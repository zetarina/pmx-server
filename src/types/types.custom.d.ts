// src/types/types.d.ts or another .d.ts file in your project
import { User } from "../models/Users";

declare module "express-serve-static-core" {
  interface Request {
    user?: User; // Make sure this matches how you're setting `req.user` in your code
  }
}
