import { UnlinkFiles } from "../../middleware/fileUploader";
import {
  DEFAULT_APPEARANCE,
  DEFAULT_CURRENCY,
  DEFAULT_LOCATION,
  DEFAULT_SEO,
  DEFAULT_SHIPPING,
  DEFAULT_SOCIAL_MEDIA,
  DEFAULT_SUPPORTS,
  DEFAULT_TAX,
  DEFAULT_WEB_SETTING,
} from "./setting_defaults";
import { setting_model, WebsiteSettingModel } from "./setting_model";
import { ISetting, IWebsiteSetting } from "./setting_type";

const mergeDeep = (target: any = {}, source: any = {}) => {
  const output = Array.isArray(target) ? [...target] : { ...target };
  if (source == null) return output;
  Object.keys(source).forEach((key) => {
    const sourceValue = source[key];
    if (sourceValue === undefined) return;
    if (
      sourceValue &&
      typeof sourceValue === "object" &&
      !Array.isArray(sourceValue)
    ) {
      output[key] = mergeDeep(output[key] || {}, sourceValue);
    } else {
      output[key] = Array.isArray(sourceValue) ? [...sourceValue] : sourceValue;
    }
  });
  return output;
};

const parseJsonField = <T>(value: any, fallback?: T): T | undefined => {
  if (value == null || value === "") return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch (error) {
      return fallback;
    }
  }
  if (typeof value === "object") return value as T;
  return fallback;
};

const parseBoolean = (value: any, fallback?: boolean) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) return fallback;
    if (["true", "1", "yes", "on"].includes(trimmed)) return true;
    if (["false", "0", "no", "off"].includes(trimmed)) return false;
  }
  return fallback;
};

const parseNumber = (value: any, fallback?: number) => {
  if (value == null || value === "") return fallback;
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const sanitizeExisting = (doc?: any) => {
  if (!doc) return {};
  const { _id, __v, createdAt, updatedAt, ...rest } = doc;
  return rest;
};

const normalizeWebSettingPayload = (payload: any): Partial<IWebsiteSetting> => {
  const normalized: Partial<IWebsiteSetting> = {};
  const stringFields: Array<keyof IWebsiteSetting> = [
    "site_name",
    "favicon",
    "contact_email",
    "contact_phone",
    "address",
    "delivery_and_returns",
    "confirm_order_text",
  ];

  stringFields.forEach((key) => {
    const value = payload?.[key as string];
    if (value !== undefined) {
      normalized[key] = String(value ?? "");
    }
  });

  if (payload?.logo) {
    normalized.logo = String(payload.logo);
  }

  if (payload?.favicon) {
    normalized.favicon = String(payload.favicon);
  }

  const objectFieldMap: Record<string, any> = {
    social_media: DEFAULT_SOCIAL_MEDIA,
    appearance: DEFAULT_APPEARANCE,
    seo: DEFAULT_SEO,
    currency: DEFAULT_CURRENCY,
    tax: DEFAULT_TAX,
    shipping: DEFAULT_SHIPPING,
    supports: DEFAULT_SUPPORTS,
    location: DEFAULT_LOCATION,
  };

  Object.entries(objectFieldMap).forEach(([key, defaults]) => {
    const parsed = parseJsonField(payload?.[key], undefined);
    if (parsed) {
      normalized[key as keyof IWebsiteSetting] = mergeDeep(defaults, parsed);
    }
  });

  if (normalized.seo) {
    const keywords = normalized.seo.meta_keywords as
      | string
      | string[]
      | undefined;
    if (typeof keywords === "string") {
      normalized.seo.meta_keywords = keywords
        .split(",")
        .map((kw: string) => kw.trim())
        .filter(Boolean);
    } else if (!Array.isArray(keywords)) {
      normalized.seo.meta_keywords = [];
    }
  }

  if (normalized.tax) {
    normalized.tax.is_enabled = parseBoolean(
      normalized.tax.is_enabled,
      DEFAULT_TAX.is_enabled,
    ) as boolean;
    normalized.tax.rate = parseNumber(
      normalized.tax.rate,
      DEFAULT_TAX.rate,
    ) as number;
  }

  if (normalized.shipping) {
    normalized.shipping.free_shipping_threshold = parseNumber(
      normalized.shipping.free_shipping_threshold,
      DEFAULT_SHIPPING.free_shipping_threshold,
    ) as number;
    normalized.shipping.standard_rate = parseNumber(
      normalized.shipping.standard_rate,
      DEFAULT_SHIPPING.standard_rate,
    ) as number;
  }

  const numberFields: Array<keyof IWebsiteSetting> = [
    "delivery_fee_in_dhaka",
    "delivery_fee_outside_dhaka",
  ];

  numberFields.forEach((key) => {
    const parsed = parseNumber(
      payload?.[key as string],
      DEFAULT_WEB_SETTING[key as keyof typeof DEFAULT_WEB_SETTING] as number,
    );
    if (parsed !== undefined) {
      (normalized as Record<string, unknown>)[key as string] = parsed;
    }
  });

  const boolFields: Array<keyof IWebsiteSetting> = [
    "maintenance_mode",
    "auto_approve_vendor",
    "auto_approve_product",
    "vendor_request",
    "make_admin",
  ];

  boolFields.forEach((key) => {
    const parsed = parseBoolean(payload?.[key as string]);
    if (parsed !== undefined) {
      normalized[key] = parsed as boolean;
    }
  });

  return normalized;
};

async function create(data: ISetting) {
  const result = await setting_model.findOneAndUpdate(
    { name: data?.name },
    { desc: data?.desc },
    { new: true, upsert: true },
  );

  return { success: true, message: `${data?.name} updated successfully` };
}

async function get(name: string) {
  const result = await setting_model
    .findOne({ name })
    .select("-_id name desc")
    .lean();
  if (result) {
    return {
      success: true,
      message: `${name} retrieve successfully`,
      data: { ...result },
    };
  } else {
    return {
      success: true,
      message: `${name} retrieve successfully`,
      data: { name: name, desc: "" },
    };
  }
}

const create_web_setting = async (payload: any) => {
  const normalized = normalizeWebSettingPayload(payload);
  const existingDoc = await WebsiteSettingModel.findOne();
  const existing = sanitizeExisting(existingDoc?.toObject?.() ?? existingDoc);

  let merged = mergeDeep(DEFAULT_WEB_SETTING, existing);
  merged = mergeDeep(merged, normalized);

  if (!normalized.logo && existing?.logo) {
    merged.logo = existing.logo;
  }

  if (!normalized.favicon && existing?.favicon) {
    merged.favicon = existing.favicon;
  }

  if (normalized.logo && existing?.logo && normalized.logo !== existing.logo) {
    UnlinkFiles([existing.logo]);
  }

  if (
    normalized.favicon &&
    existing?.favicon &&
    normalized.favicon !== existing.favicon
  ) {
    UnlinkFiles([existing.favicon]);
  }

  if (merged.location?.coordinates) {
    merged.location.coordinates = merged.location.coordinates.map(
      (coord: any) => Number(coord) || 0,
    );
  }

  if (existingDoc) {
    await WebsiteSettingModel.updateOne({ _id: existingDoc._id }, merged);
  } else {
    await WebsiteSettingModel.create(merged);
  }

  return {
    success: true,
    message: "web setting updated successfully",
    data: merged,
  };
};

async function get_web_setting() {
  const existing = await WebsiteSettingModel.findOne().lean();
  const data = mergeDeep(DEFAULT_WEB_SETTING, sanitizeExisting(existing));

  return {
    success: true,
    message: `web setting retrieve successfully`,
    data,
  };
}

export const setting_service = Object.freeze({
  create,
  get,
  create_web_setting,
  get_web_setting,
});
