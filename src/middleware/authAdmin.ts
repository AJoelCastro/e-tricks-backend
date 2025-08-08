import { verifyToken, createClerkClient } from '@clerk/backend';
import { NextFunction, Request, Response } from 'express';

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

async function authenticateAdminToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Token no encontrado' });

  const token = authHeader.replace('Bearer ', '');

  try {
    const verificationResult = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
    });

    const { sid, sub } = verificationResult;

    // Obtener información completa del usuario desde Clerk
    const user = await clerkClient.users.getUser(sub);

    let userRoles: string[] = [];

    // Verificar en publicMetadata
    if (user.publicMetadata?.role) {
      const role = user.publicMetadata.role as string | string[];
      userRoles = Array.isArray(role) ? role : [role];
    } 

    const hasAdminRole = userRoles.includes('admin');

    if (!hasAdminRole) {
      return res.status(403).json({ 
        message: 'Acceso denegado. Se requieren permisos de administrador',
        debug: {
          sub,
          userRoles,
          publicMetadata: user.publicMetadata,
        }
      });
    }

    (req as any).userId = sub;
    (req as any).sessionId = sid;
    (req as any).userRoles = userRoles;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token admin inválido' });
  }
}

module.exports = authenticateAdminToken;
