
// types/multer.d.ts
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      files?: Express.Multer.File[];
    }
  }
}