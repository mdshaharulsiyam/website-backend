export const DEFAULT_SOCIAL_MEDIA = Object.freeze({
  facebook: "",
  twitter: "",
  instagram: "",
  linkedin: "",
});

export const DEFAULT_APPEARANCE = Object.freeze({
  primary_color: "#000000",
  secondary_color: "#FFFFFF",
  theme: "light",
});

export const DEFAULT_SEO = Object.freeze({
  meta_title: "",
  meta_description: "",
  meta_keywords: [] as string[],
});

export const DEFAULT_CURRENCY = Object.freeze({
  symbol: "TK",
  code: "BDT",
});

export const DEFAULT_TAX = Object.freeze({
  is_enabled: false,
  rate: 0,
});

export const DEFAULT_SHIPPING = Object.freeze({
  free_shipping_threshold: 0,
  standard_rate: 0,
});

export const DEFAULT_SUPPORTS = Object.freeze({
  shipping_heading: "",
  shipping_description: "",
  support_heading: "",
  support_description: "",
  payment_heading: "",
  payment_description: "",
  refund_heading: "",
  refund_description: "",
});

export const DEFAULT_LOCATION = Object.freeze({
  type: "Point",
  coordinates: [0, 0] as number[],
});

export const DEFAULT_WEB_SETTING = Object.freeze({
  site_name: "",
  logo: "",
  favicon: "",
  contact_email: "",
  contact_phone: "",
  address: "",
  location: DEFAULT_LOCATION,
  social_media: DEFAULT_SOCIAL_MEDIA,
  appearance: DEFAULT_APPEARANCE,
  seo: DEFAULT_SEO,
  currency: DEFAULT_CURRENCY,
  tax: DEFAULT_TAX,
  shipping: DEFAULT_SHIPPING,
  maintenance_mode: false,
  auto_approve_vendor: false,
  auto_approve_product: false,
  vendor_request: true,
  make_admin: true,
  supports: DEFAULT_SUPPORTS,
  delivery_and_returns: "",
  confirm_order_text: "",
  delivery_fee_in_dhaka: 70,
  delivery_fee_outside_dhaka: 130,
  affiliate_percentage: 4,
  affiliate_policy: "",
});
