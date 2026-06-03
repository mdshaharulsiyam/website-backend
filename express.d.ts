import { IAuth } from "./src/apis/Auth/auth_types";

declare global {
  namespace Express {
    interface Request {
      user?: IAuth;
      extra?: any;
      //  {
      //   // category?: ICategory,
      //   // cart?: ICart,

      // }
    }
  }
}
