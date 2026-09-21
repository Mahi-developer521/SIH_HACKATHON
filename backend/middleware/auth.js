const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'pashu-suraksha-sih-2026-secret-key-national-portal';

/**
 * Authentication Middleware:
 * Verifies JWT token in Authorization: Bearer <token> header.
 * Attaches decoded user profile to req.user.
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: 'Access Denied: No authentication token provided. Please log in.'
    });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return res.status(401).json({
      success: false,
      error: 'Access Denied: Invalid Authorization token format. Expected "Bearer <token>".'
    });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Authentication failed: Token is expired or invalid. Please sign in again.'
    });
  }
}

/**
 * Role-Based Authorization Middleware:
 * Restricts access to specified roles.
 * Returns HTTP 403 Forbidden with a clear message if role is unauthorized.
 */
function requireRole(allowedRoles) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required before role verification.'
      });
    }

    const userRole = req.user.role;
    // Normalize admin / flow_inspector
    const hasPermission = roles.some(r => 
      r === userRole || 
      (r === 'admin' && userRole === 'flow_inspector') ||
      (r === 'flow_inspector' && userRole === 'admin')
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: `Access Forbidden: Your role '${userRole}' is not authorized to access this resource. Required role(s): ${roles.join(', ')}.`
      });
    }

    next();
  };
}

module.exports = {
  verifyToken,
  requireRole,
  JWT_SECRET
};
