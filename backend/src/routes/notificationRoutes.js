import { Router } from "express";
import {  verifyUser } from "../middlewares/authMiddleware.js";
import {
    deleteAllReadNotifications,
    deleteSingleReadNotification,
    getUserNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    sendNotification,

} from "../controllers/notificationController.js";



const router = Router();


router.route("/mark-all-as-read").put(verifyUser, markAllNotificationsAsRead);
router.route("/mark-as-read/:id").put(verifyUser, markNotificationAsRead);
router.route("/get-notifications").get( verifyUser, getUserNotifications);
router.route("/send-notification").post( verifyUser, sendNotification );
router.route("/delete-all-read-notifications").delete(verifyUser, deleteAllReadNotifications);
router.route("/delete-single-read-notification/:id").delete(verifyUser, deleteSingleReadNotification);


export default router;