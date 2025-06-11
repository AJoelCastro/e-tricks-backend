import { verifyToken } from '@clerk/backend';

async function authenticateClerkToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Token no encontrado' });

  const token = authHeader.replace('Bearer ', '');
  
  try {
    const { sessionId, userId, getToken } = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    req.userId = userId;
    req.sessionId = sessionId;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido' });
  }
}

module.exports = authenticateClerkToken;
