import "./env.js"



const GOOGLE_PLACES_API_KEY =
  process.env.GOOGLE_PLACES_API_KEY;

const GOOGLE_PLACE_ID =
  process.env.GOOGLE_PLACE_ID;

const GOOGLE_PLACES_URL =
  `https://places.googleapis.com/v1/places/${GOOGLE_PLACE_ID}`;

const GOOGLE_FIELD_MASK = [
  "displayName",
  "rating",
  "userRatingCount",
  "reviews",
].join(",");

export {
  GOOGLE_PLACES_API_KEY,
  GOOGLE_PLACE_ID,
  GOOGLE_PLACES_URL,
  GOOGLE_FIELD_MASK,
};