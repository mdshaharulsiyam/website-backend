import { Document } from "mongoose";

export interface IBanner extends Document {
  img: string;
  link: string;
  is_active: boolean;
  offer: string;
  heading: string;
  description: string;
  button: string;
  start_date: Date;
  end_date: Date;
}
