import { Router } from "express";

import {
    createAuction,
    deleteSingleAuctionById,
    getAllAuctions,
    getAuctionsByUser,
    getBidsAuctionsByUser,
    getSingleAuctionById,
    updateAuctionStatus,
    updateSingleAuctionById,
    getLiveAuctions,
    getUpcomingAuctions,
    getAuctionWinner,
    updatePaymentStatus,
} from "../controllers/auctionController.js";

import { verifyAdmin, verifySeller, verifyUser } from "../middlewares/authMiddleware.js";

import { upload } from "../middlewares/multerMiddleware.js";


const router = Router();



router.route("/upcoming-auctions").get(getUpcomingAuctions);
router.route("/live-auctions").get(getLiveAuctions);
router.route("/:id/winner").get(getAuctionWinner);

router.route("/").post( getAllAuctions );
router.route("/:id/status").post( updateAuctionStatus );
router.route("/update-payment-status/:id").put(updatePaymentStatus);

router.route("/user-bids").get( verifyUser, getBidsAuctionsByUser );
router.route("/delete/:id").delete( verifyUser, verifySeller, deleteSingleAuctionById );
router.route("/update/:id").put( verifyUser, verifySeller, verifyAdmin, upload.single("image"), updateSingleAuctionById );
router.route("/user-auctions").get( verifyUser, verifySeller, getAuctionsByUser );
router.route("/create-Auction").post( verifyUser, verifySeller, upload.single("image"), createAuction );
router.route("/:id").get( getSingleAuctionById );

router.route("/admin-delete/:id").delete(verifyUser, verifyAdmin, deleteSingleAuctionById);

export default router;
