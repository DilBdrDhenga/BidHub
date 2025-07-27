import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import Notification from "../models/notificationModel.js";
import Auction from "../models/auctionModel.js";
import Bid from "../models/bidModel.js";

// @desc send notification
// @route POST /api/v1/send-notification
// @access Private
const sendNotification = asyncHandler(async (req, res) => {
    // Extracting elements from the incoming request body
    const { auctionId, type, newBidAmount } = req.body;

    // Checking for missing parameters
    if (!auctionId) {
        return res.status(400).json(new ApiResponse(400, "Auction ID is required."));
    }
    if (!type) {
        return res.status(400).json(new ApiResponse(400, "Notification Type is required."));
    }
    if (!newBidAmount) {
        return res.status(400).json(new ApiResponse(400, "New bid amount is required."));
    }

    // Finding auction by its ID
    let auction = await Auction.findById(auctionId);
    if (!auction) {
        return res.status(404).json(new ApiResponse(404, "Auction not found."));
    }

    // Initialize the notification object based on the type
    if (type === "BID_PLACED") {
      var notification = {
        user: null,
        message:  `${req?.user?.fullName} has placed a ${newBidAmount}$ bid on ${auction?.name}`,
        type: "BID_PLACED",
        auction: auctionId,
        link: `/single-auction-detail/${auctionId}`,
      }
    };

    try {
        // Finding all bids for the auction
        const bids = await Bid.find({ auction: auctionId });

        // Getting all unique user IDs from the bids
        const userIds = new Set(bids.map((bid) => bid.bidder.toString()));

        // Adding the owner of the item to the user IDs
        userIds.add(auction.seller.toString());

        // Prepare an array to hold promises for saving notifications
        const notificationPromises = [];

        // Creating a notification for each user ID
        userIds.forEach(async (id) => {
            // Customize the notification message for each user
            notification.message = `${id === req.user._id.toString() ? "you" : req?.user?.fullName} placed a ${newBidAmount}$ bid on ${auction.name}`;
            
            // // Create the notification instance
            // const notificationInstance = new Notification({ ...notification, user: id });
            // // Add the save operation to the promises array
            // notificationPromises.push(notificationInstance.save());

            // Wait for all notifications to be saved
            await new Notification({...notification, user: id }).save();
          });
        return res.status(200).json(new ApiResponse(200, "Notification sent successfully"));
    } catch (error) {
        console.error("Error sending notifications:", error);
        return res.status(500).json(new ApiResponse(500, error.message || "Internal server error"));
    }
});



// @desc Get all notifications for a user
// @route GET /api/v1/notifications/get-notification/:userId
// @access Private
const getUserNotifications = asyncHandler(async (req, res) => {
    // res.send("test");

    // checking if the userId exists in the request or not
    if (!req?.user?._id) {
        return res.status(400).json(new ApiResponse(400, "User ID is required."));
    }

    // retriving notifications and sorting & populating data
    try {
        const notifications = await Notification.find({
        user: req?.user?._id,
      })
      .sort({ createdAt: -1 })
      .populate("auction", "name image")
      .populate({
        path: "auction",
        populate: {
          path: "bids",
          model: "Bid",
        },
      
      })
      // console.log("Retrived Notifications: ", notifications);

  
      // checking if any notifications were retrived or not
      if (!notifications) {
            return res
              .status(404)
                .json(new ApiResponse(404, "Notifications not found."));
      }
  
      return res
        .status(200)
        .json(new ApiResponse(200, "Notifications found.", notifications));
    } catch (error) {
      // Handle the error
      return res
        .status(500)
        .json(new ApiResponse(500, error?.message || "Internal server error"));
    }
});
  

// @desc mark notification as read
// @route PUT /api/v1/notifications/mark-as-read/:id
// @access Private
const markNotificationAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req?.params?.id);
    if (!notification) {
      return res.status(404).json(new ApiResponse(404, "Notification not found."));
    }
    notification.isRead = true;
    await notification.save();
    return res
      .status(200)
      .json(new ApiResponse(200, "Notification marked as read."));
});
  
  
// @desc mark all notification as read
// @route PUT /api/v1/notifications/mark-all-as-read
// @access Private  
const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany(
      { user: req?.user?._id },
      { $set: { isRead: true } }
    );
    return res
        .status(200)
        .json(new ApiResponse(200, "All notifications marked as read."));
});
  

// @desc delete read notification
// route DELETE /api/v1/notifications/delete-all-read-notifications
// @access Private 
const deleteAllReadNotifications = asyncHandler(async (req, res) => {
  // res.send("test");

  await Notification.deleteMany(
    { user: req?.user?._id, isRead: true}
  );
 return res
        .status(200)
        .json(new ApiResponse(200, "All notifications marked as read are deleted."));
}); 


// @desc delete read notification
// route DELETE /api/v1/notifications/delete-single-read-notification/:notificationId
// @access Private 
const deleteSingleReadNotification = asyncHandler(async (req, res) => {
  // res.send("test");
  
  // getting the notifications id from the request paramaters
  const notificationId = req.params.id; 

  // finding the notification by ID and check if it belongs to the user and is marked as read
  const notification = await Notification.find({
    _id: notificationId,
    user: req?.user?._id,
    isRead: true,
  });

  if (!notification) {
    return res.status(404).json(new ApiResponse(404, "Notification not found or is not marked as read."));
  }

  // Delete the notification
  await Notification.deleteOne({
    _id: notificationId
  });
  return res.status(200).json(new ApiResponse(200, "Selected notification deleted successfully"));
}); 


export  {
    sendNotification,
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteAllReadNotifications,
    deleteSingleReadNotification,

}