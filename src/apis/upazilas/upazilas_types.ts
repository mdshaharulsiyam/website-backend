import { Document } from "mongoose";

export interface IUpazilas extends Document {
  id: string;
  district_id: number;
  name: string;
  bn_name: string;
  location: {
    type: string;
    coordinates: number[];
  };
}
