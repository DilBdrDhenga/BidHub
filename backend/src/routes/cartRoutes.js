import { Router } from "express";
import { verifyAdmin, verifyUser, verifySeller } from "../middlewares/authMiddleware.js";
import { getCartItems, deleteCartItem } from "../controllers/cartController.js";

const router = Router();

router.route("/").get(verifyUser, getCartItems);
router.route("/:id").delete(verifyUser, deleteCartItem);

export default router;