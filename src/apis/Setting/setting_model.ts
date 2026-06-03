import { model, Schema } from "mongoose";
import { ISetting, IWebsiteSetting } from "./setting_type";

const setting_schema = new Schema<ISetting>(
  {
    name: {
      type: String,
      unique: true,
      enum: ["about", "terms", "privacy", "contact"],
    },
    desc: { type: String, trim: true, required: true },
  },
  { timestamps: true },
);

export const setting_model = model("setting", setting_schema);

const website_setting_schema = new Schema<IWebsiteSetting>(
  {
    site_name: { type: String, default: "" },
    logo: { type: String, default: "" },
    favicon: { type: String, default: "" },
    contact_email: { type: String, default: "" },
    contact_phone: { type: String, default: "" },
    address: { type: String, default: "" },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: { type: [Number], default: [0, 0] },
    },
    social_media: {
      facebook: { type: String, default: "" },
      twitter: { type: String, default: "" },
      instagram: { type: String, default: "" },
      linkedin: { type: String, default: "" },
    },
    appearance: {
      primary_color: { type: String, default: "#000000" },
      secondary_color: { type: String, default: "#FFFFFF" },
      theme: { type: String, enum: ["light", "dark"], default: "light" },
    },
    seo: {
      meta_title: { type: String, default: "" },
      meta_description: { type: String, default: "" },
      meta_keywords: { type: [String], default: [] },
    },
    currency: {
      symbol: { type: String, default: "TK" },
      code: { type: String, default: "BDT" },
    },
    tax: {
      is_enabled: { type: Boolean, default: false },
      rate: { type: Number, default: 0 },
    },
    shipping: {
      free_shipping_threshold: { type: Number, default: 0 },
      standard_rate: { type: Number, default: 5 },
    },
    maintenance_mode: { type: Boolean, default: false },
    auto_approve_vendor: { type: Boolean, default: false },
    auto_approve_product: { type: Boolean, default: false },
    vendor_request: { type: Boolean, default: true },
    make_admin: { type: Boolean, default: true },
    supports: {
      shipping_heading: { type: String, default: "" },
      shipping_description: { type: String, default: "" },
      support_heading: { type: String, default: "" },
      support_description: { type: String, default: "" },
      payment_heading: { type: String, default: "" },
      payment_description: { type: String, default: "" },
      refund_heading: { type: String, default: "" },
      refund_description: { type: String, default: "" },
    },
    delivery_and_returns: { type: String, default: "" },
    confirm_order_text: { type: String, default: "" },
    delivery_fee_in_dhaka: { type: Number, default: 70 },
    delivery_fee_outside_dhaka: { type: Number, default: 130 },
  },
  { timestamps: true },
);

website_setting_schema.index({ location: "2dsphere" });

export const WebsiteSettingModel = model<IWebsiteSetting>(
  "web_setting",
  website_setting_schema,
);
