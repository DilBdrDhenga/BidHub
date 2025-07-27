import { Router } from "express";

import {
    registerUser,
    loginUser,
    forgetPasswordSendEmail,
    resetPassword,
    logoutUser,
    changeCurrentPassword,
    updateUserProfile,
    getCurrentUser,
    getAllUsers,
    getUserById,
    updateUserById,
    deleteUserById,
    getTopSellers,
    getTopCities,
} from "../controllers/userController.js";
import { verifyAdmin, verifyUser } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/multerMiddleware.js";


const router = Router();



router.route("/register").post( registerUser );
router.route("/login").post( loginUser );
router.route("/forgot-password").post( forgetPasswordSendEmail );
router.route("/reset-password/:id/:token").post( resetPassword );
router.route("/logout").post( logoutUser );

router.route("/current-user").get( verifyUser, getCurrentUser );

router.route("/change-password").put( verifyUser, changeCurrentPassword );
router.route("/update-user-profile").put( verifyUser, upload.single("profilePicture"), updateUserProfile );
router.route("/top-cities").get(verifyUser, verifyAdmin, getTopCities);
router.route("/top-sellers").get(verifyUser, verifyAdmin, getTopSellers);

router.route("/:id").delete(verifyUser, verifyAdmin, deleteUserById);
router.route("/update-user/:id").put( verifyUser, verifyAdmin, upload.single("profilePicture"), updateUserById);
router.route("/:userid").get( verifyUser, verifyAdmin, getUserById);

router.route("/").get( verifyUser, verifyAdmin, getAllUsers );



export default router;