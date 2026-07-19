import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "fee-reminder",
        "payment-alert",
        "general",
      ],
      default: "general",
      index: true,
    },

    // Free-text tag e.g. "Semester Fees" — lets the student page
    // link a notification back to what it's about, without a hard
    // foreign key to any one Payment document.
    relatedPaymentPurpose: {
      type: String,
      default: "",
      trim: true,
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Who sent it (the logged-in admin's req.user.id).
    // Left un-ref'd on purpose since the admin model's name may
    // differ across setups — adjust `ref` here if you want population.
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
    },

    emailSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);