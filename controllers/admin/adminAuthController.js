import jwt from "jsonwebtoken";

/* ==========================================================================
   ADMIN LOGIN
============================================================================= */

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    /* ======================================
       VALIDATION
    ====================================== */

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    /* ======================================
       VERIFY ENVIRONMENT VARIABLES
    ====================================== */

    if (
      !process.env.ADMIN_EMAIL ||
      !process.env.ADMIN_PASSWORD ||
      !process.env.JWT_SECRET
    ) {
      return res.status(500).json({
        success: false,
        message: "Server configuration error.",
      });
    }

    /* ======================================
       VERIFY ADMIN CREDENTIALS
    ====================================== */

    if (
      email !== process.env.ADMIN_EMAIL ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials.",
      });
    }

    /* ======================================
       GENERATE JWT
    ====================================== */

    const token = jwt.sign(
      {
        email,
        role: "admin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    /* ======================================
       RESPONSE
    ====================================== */

    return res.status(200).json({
      success: true,
      message: "Admin login successful.",
      token,
      admin: {
        email,
        role: "admin",
      },
    });
  } catch (error) {
    console.error("Admin Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Admin login failed.",
    });
  }
};