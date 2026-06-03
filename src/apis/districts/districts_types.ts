import { Document } from "mongoose";

export interface IDistricts extends Document {
  id: string;
  division_id: number;
  name: string;
  bn_name: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
}
