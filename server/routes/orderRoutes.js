const express = require("express");
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getMySales,
  getOrderById,
  updateOrderContent,
  markOrderPublished,
  rejectOrder,
  submitOrderContent,
  deliverOrder
} = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");

router.route("/").post(protect, createOrder);
router.get("/myorders", protect, getMyOrders);
router.get("/mysales", protect, getMySales);
router.route("/:id").get(protect, getOrderById);
router.put("/:id/content", protect, updateOrderContent);
router.put("/:id/publish", protect, markOrderPublished);
router.put("/:id/reject", protect, rejectOrder); 
router.put('/:id/content', protect, submitOrderContent);
router.put('/:id/publish', protect, deliverOrder);

module.exports = router;
