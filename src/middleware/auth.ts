import { verifyToken } from '@clerk/backend';
import { NextFunction, Request, Response } from 'express';

async function authenticateClerkToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Token no encontrado' });

  const token = authHeader.replace('Bearer ', '');
  
  try {
    const { sessionId, userId, getToken } = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    (req as any).userId = userId;
    (req as any).sessionId = sessionId;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido' });
  }
}

module.exports = authenticateClerkToken;
