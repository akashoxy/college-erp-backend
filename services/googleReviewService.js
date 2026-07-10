import axios from "axios";

import {
  GOOGLE_PLACES_API_KEY,
  GOOGLE_PLACES_URL,
  GOOGLE_FIELD_MASK,
} from "../config/googlePlaces.js";



/* ===========================================
   CACHE
=========================================== */

let cachedReviews = [];

let lastFetched = 0;

const CACHE_DURATION =
  1000 * 60 * 60 * 24; // 24 Hours

/* ===========================================
   FETCH GOOGLE REVIEWS
=========================================== */

export const fetchGoogleReviews =
  async () => {
    try {
      /* -----------------------------
         Return Cached Reviews
      ----------------------------- */

      if (
        cachedReviews.length &&
        Date.now() - lastFetched <
          CACHE_DURATION
      ) {
        return cachedReviews;
      }

      /* -----------------------------
         Call Google Places API
      ----------------------------- */

const response = await axios.get(
  GOOGLE_PLACES_URL,
  {
    headers: {
      "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
      "X-Goog-FieldMask": GOOGLE_FIELD_MASK,
    },
  }
);

      const place =
        response.data || {};

      const reviews =
        place.reviews || [];

      /* -----------------------------
         Format Response
      ----------------------------- */

      const formatted =
        reviews.map((review) => ({
          author_name:
            review.authorAttribution
              ?.displayName ||
            "Anonymous",

          profile_photo_url:
            review.authorAttribution
              ?.photoUri || "",

          rating:
            review.rating || 0,

          text:
            review.text?.text || "",

          publish_time:
            review.publishTime || "",

          relative_time_description:
            review.relativePublishTimeDescription ||
            "",

          author_url:
            review.authorAttribution
              ?.uri || "",
        }));

      /* -----------------------------
         Update Cache
      ----------------------------- */

      cachedReviews = formatted;

      lastFetched = Date.now();

      return formatted;
    } catch (error) {
      console.error(
        "Google Reviews Error:",
        error.response?.data ||
          error.message
      );

      throw new Error(
        "Failed to fetch Google Reviews."
      );
    }
  };

/* ===========================================
   CLEAR CACHE (Optional)
=========================================== */

export const clearReviewCache =
  () => {
    cachedReviews = [];

    lastFetched = 0;
  };