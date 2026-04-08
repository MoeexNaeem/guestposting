const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    url: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    da: { type: Number, required: true },
    traffic: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    // NEW FIELDS
    isVerified: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    featuredUntil: { type: Date },
    lastVerifiedAt: { type: Date },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Listing", listingSchema);
