// src/types/types.d.ts
import { User as CustomUser } from "../models/User";

declare global {
  namespace Express {
    interface User extends CustomUser {}
    interface Request {
      csrfToken(): string;
    }
  }
}
