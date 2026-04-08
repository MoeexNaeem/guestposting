const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  createListing,
  getListings,
  getAdminListings,
  updateListingStatus,
  bulkUploadListings,
  approveListing,
  getMyListings,
  updateListing,
  getListingById,
} = require("../controllers/listingController");
const { protect, admin, seller } = require("../middleware/authMiddleware");

const upload = multer({ dest: "uploads/" });

// APPLY SELLER MIDDLEWARE TO CREATION
router.route("/").get(getListings).post(protect, seller, createListing);

router.post(
  "/bulk",
  protect,
  seller,
  upload.single("file"),
  bulkUploadListings,
);

// ADMIN ONLY ENDPOINTS
router.get("/admin", protect, admin, getAdminListings);
router.put("/:id/approve", protect, admin, approveListing);
router.put("/:id/status", protect, admin, updateListingStatus);

// SELLER ONLY ENDPOINTS
router.get("/my-listings", protect, seller, getMyListings);

router
  .route("/:id")
  .get(protect, getListingById)
  .put(protect, seller, updateListing);

module.exports = router;
