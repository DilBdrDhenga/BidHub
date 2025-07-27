import { Router } from "express";

import {
    createProductCategory,
    deleteProductCategory,
    getAllProductCategories,
    getProductCategory,
    updateProductCategory,
    getCatgegoriesMoreDetail,
    getTopCategories,
} from "../controllers/productCategoryController.js";
import { upload } from "../middlewares/multerMiddleware.js";
import { verifyAdmin, verifyUser } from "../middlewares/authMiddleware.js";

const router = Router();

router.route("/top").get(verifyUser, verifyAdmin, getTopCategories);
router.route("/detail").get(verifyUser, verifyAdmin, getCatgegoriesMoreDetail);

router.route("/").post(verifyUser, verifyAdmin, upload.single("image"), createProductCategory );

router.route("/:id").get( getProductCategory );
router.route("/").get( getAllProductCategories );

router.route("/:id").put( verifyUser, verifyAdmin, upload.single("image"), updateProductCategory);

router.route("/:id").delete( verifyUser, verifyAdmin, deleteProductCategory );




export default router;