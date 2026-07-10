import express from "express";
import authMiddleware from "../../middleware/auth/authMiddleware.js";

const router = express.Router();

router.get(
  "/me",
  authMiddleware,
  async (req, res) => {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  }
);

export default router;