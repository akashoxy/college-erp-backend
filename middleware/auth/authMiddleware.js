import jwt from "jsonwebtoken";

const authMiddleware = (
  req,
  res,
  next
) => {
  try {
    /* ======================================
       GET AUTHORIZATION HEADER
    ====================================== */

    const authHeader =
      req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith(
        "Bearer "
      )
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Authorization token is required.",
      });
    }

    /* ======================================
       EXTRACT TOKEN
    ====================================== */

    const token =
      authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid token format.",
      });
    }

    /* ======================================
       VERIFY JWT
    ====================================== */

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    /* ======================================
       ATTACH USER
    ====================================== */

    req.user = {
      id:
        decoded.id || null,

      email:
        decoded.email || "",

      role:
        decoded.role || "",
    };

    return next();
  } catch (error) {
    console.error(
      "Authentication Error:",
      error
    );

    if (
      error.name ===
      "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Token has expired.",
      });
    }

    if (
      error.name ===
      "JsonWebTokenError"
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid token.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Authentication failed.",
    });
  }
};

export default authMiddleware;