import express from "express";

import {
  loginAdmin,
} from "../../controllers/admin/adminAuthController.js";

const router = express.Router();

/* ==========================================================================
   PUBLIC ROUTES
============================================================================= */

router.post(
  "/login",
  loginAdmin
);

export default router;