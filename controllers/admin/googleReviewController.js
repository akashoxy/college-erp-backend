import { fetchGoogleReviews } from "../../services/googleReviewService.js";

/* ===========================================
   GET GOOGLE REVIEWS
=========================================== */

export const getGoogleReviews = async (req, res) => {
  try {
    const reviews = await fetchGoogleReviews();

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch Google Reviews.",
    });
  }
};