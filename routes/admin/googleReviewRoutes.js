import express from "express";

import {
  getGoogleReviews,
} from "../../controllers/admin/googleReviewController.js";

const router = express.Router();

/* ===========================================
   GOOGLE REVIEWS
=========================================== */

router.get(
  "/",
  getGoogleReviews
);

export default router;