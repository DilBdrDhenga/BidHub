import { Router } from "express";
import { verifyUser } from "../middlewares/authMiddleware.js";
import { addPaymentMethodToCutomer, paymentCheckout, updatePaymentMethod } from "../controllers/paymentController.js";

const router = Router();

router.route("/add-payment-method").post(verifyUser, addPaymentMethodToCutomer);
router.route("/update-payment-method").post(verifyUser, updatePaymentMethod);
router.route("/checkout").post(verifyUser, paymentCheckout);

export default router;