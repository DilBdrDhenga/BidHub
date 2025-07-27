import { Router } from "express";
import { verifyUser, verifyAdmin } from "../middlewares/authMiddleware.js";
import { addCity, getAllCities, getNearbyCities } from "../controllers/cityController.js";

const router = Router();

router.route("/").post( addCity);
router.route("/").get(getAllCities);
router.route("/nearby").get(getNearbyCities);

export default router;