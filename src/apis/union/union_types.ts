import { Document } from "mongoose";

export interface IUnion extends Document {
  id: string;
  upazilla_id: number;
  name: string;
  bn_name: string;
  location: {
    type: string;
    coordinates: number[];
  };
}
