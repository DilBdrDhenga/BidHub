import { Router } from "express";

import {
    addBidOnItem,
    getAllBidsByAuctionId,
    getBidsByUser,
    getWinnerOfAuction,
} from "../controllers/bidController.js";
import { verifyUser } from "../middlewares/authMiddleware.js";


const router = Router();

router.route("/get-all-bids/:auctionId").get( getAllBidsByAuctionId );
router.route("/:id/winner").get( getWinnerOfAuction );
router.route("/get-all-bids-item").get( verifyUser, getBidsByUser );
router.route("/:id").post( verifyUser, addBidOnItem );




export default router;