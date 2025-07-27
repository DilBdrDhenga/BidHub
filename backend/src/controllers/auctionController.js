import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

import Auction from "../models/auctionModel.js";
import Bid from "../models/bidModel.js";
import City from "../models/cityModel.js";

import mongoose from "mongoose";



// @desc Create auction product
// @route POST /api/v1/auctions
// @access Private/ Seller only
const createAuction = asyncHandler(async (req, res) => {
//  res.send("test");

    // to see exactly what is being recieved
    console.log("Request Body: ", req.body); // Log body
    console.log("Uploaded File: ", req.file); // Log uploaded file

    try {
      const {
        name,
        description,
        category,
        startTime,
        endTime,
        startingPrice,
        location,
      } = req.body;
      const image = req.file?.path;
  
      console.log("name", name);
      console.log("description", description);
      console.log("category", category);
      console.log("startTime", startTime);
      console.log("endTime", endTime);
      console.log("startingPrice", startingPrice);

      // Check if fields are empty
      if (!name) {
        return res.status(400).json(new ApiResponse(400, "Name is required."));
      }
      if (!description) {
          return res.status(400).json(new ApiResponse(400, "Description is required."));
      }
      if (!category) {
        return res.status(400).json(new ApiResponse(400, "Category is required."));
      }
      if (!startTime) {
        return res.status(400).json(new ApiResponse(400, "Starting Time is required."));
      }
      if (!endTime) {
          return res.status(400).json(new ApiResponse(400, "Ending Time is required."));
      }
      if (!startingPrice) {
        return res.status(400).json(new ApiResponse(400, "Starting Price is required."));
      } 
      if (!location) {
        return res.status(400).json(new ApiResponse(400, "Location is required."));
      } 
      if (!image) {
          return res.status(400).json(new ApiResponse(400, "Image is required."));
      } 


      // Convert startingPrice to a number and checking if it is positive or not
      const parsedStartingPrice = parseFloat(startingPrice);
      if (isNaN(parsedStartingPrice) || parsedStartingPrice <= 0) {
          return res.status(400).json(new ApiResponse(400, "Starting price must be a positive number"));
      }

      // Check if startTime is before endTime
      if (new Date(startTime).getTime() >= new Date(endTime).getTime()) {
        return res
          .status(400)
          .json(new ApiResponse(400, "Start time must be before end time"));
      }
  
      // check if image can be uploaded or not
      const imgUrlCloudinary = await uploadOnCloudinary(image);
      if (!imgUrlCloudinary) {
        return res
          .status(500)
          .json(new ApiResponse(500, "Error uploading image"));
      }

      // determining the auction status based on current date
      // Determine the auction status based on the current date
      let currentDate = new Date();
      let status = "upcoming";
      console.log(new Date(startTime).getTime() + " and time is .." + currentDate.getTime());

      if (new Date(startTime).getTime() < currentDate.getTime()) {
          status = "active";
      }
      if (endTime < currentDate.getTime()) {
          status = "over";
      }

      // creating a new auction
      const auction = await Auction.create ({
        name,
        description,
        category,
        seller: req.user._id,
        startTime,
        endTime,
        location,
        image: imgUrlCloudinary.url,
        startingPrice: parsedStartingPrice,
        status,
      });
  
      if (!auction) {
        return res.status(500).json(new ApiResponse(500, "Error creating auction."));
      }
      return res.status(201).json(new ApiResponse(201, "Auction created successfully.", auction));
    } catch (error) {
      // Handle the error
      return res.status(500).json(new ApiResponse(500, error?.message || "Internal server error."));
    } 
});


// @desc Get a single Auction by ID
// @route GET /api/v1/auctions/:id
// @access Public
const getSingleAuctionById = asyncHandler(async (req, res) => {
  // res.send("test");

  try {
    // console.log("single auction getting...");

    // finding the auction by its id
    const auction = await Auction.findById(req.params.id)
      // including related documents in the response
      .populate("category", "name")
      .populate("location", "name")
      .populate("seller", "fullName email phone location profilePicture")
      .populate("bids")
      .populate("winner", "amount")
      .populate("bids", "bidder bidAmount bidTime")
      .populate({
        path: "bids",
        populate: {
          path: "bidder",
          select: "fullName email profilePicture",
        },
      }) 
      //populate the winner's information as well bidamount and time
      .populate({
        path: "winner",
        populate: {
          path: "bidder",
          select: "fullName  profilePicture",
        },
      });
    
      
    // checking if auction exists or not  
    if (!auction) {
      return res.status(404).json(new ApiResponse(404, "Auction not found"));
    }
    return res.json(
      new ApiResponse(200, "Auction retrieved successfully", auction)
    );
  } catch (error) {
    return res.status(500).json(new ApiResponse(500, error?.message || "Internal server error"));
  }
});

// @desc Get all auctions
// @route GET /api/v1/auctions
// @access Public
const getAllAuctions = asyncHandler(async (req, res) => {
  try {
    const { location, category, itemName } = req.body;
    console.log("req.body", req.body);  // logs the incoming body to the console for debugging

    // Initialize a filter object (no exclusion for "over" status)
    let filter = {};

    // Check if location is provided
    if (location) {
      // Check if location is a valid ObjectId
      if (mongoose.Types.ObjectId.isValid(location)) {
        // If it's a valid ObjectId, filter by ObjectId directly
        filter.location = location;
      } else {
        // If it's not a valid ObjectId, search by city name
        const cityid = await City.find({ name: location });
        
        // Check if cityid is not empty
        if (cityid.length > 0) {
          console.log(cityid[0]._id.toString(), " city id");
          filter.location = cityid[0]._id.toString();
        } else {
          return res.status(404).json(new ApiResponse(404, "City not found."));
        }
      }
    }

    // Additional filters
    if (category) filter.category = category;
    // Using a regex to allow for case-insensitive matching of item names in the database
    if (itemName) {
      filter.name = { $regex: itemName, $options: "i" };
    }

    // Fetching the auctions
    const auctions = await Auction.find(filter)
      .populate("seller", "fullName email phone location profilePicture")
      .populate({
        path: "winner",
        populate: {
          path: "bidder",
          select: "fullName profilePicture",
        }
      })
      .populate("category", "name")
      .populate("location", "name")
      // Show new ones
      .sort({ createdAt: -1 });
    
    // Checking if auctions exist or not  
    if (!auctions || auctions.length === 0) {
      return res.status(404).json(new ApiResponse(404, "No auctions found."));
    }
    
    return res.json(
      new ApiResponse(200, "Auctions retrieved successfully.", auctions)
    );
  } catch (error) {
    // Handle the error
    return res.status(500).json(new ApiResponse(500, error?.message || "Internal server error."));
  }
});

// @desc Update auction status
// @route POST /api/v1/auctions/:id/status
// @access public
const updateAuctionStatus = asyncHandler(async (req, res) => {
  // res.send("test");

  try {
    // validate the auction id format
    const auctionId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(auctionId)) {
      return res.status(400).json(new ApiResponse(400, "Invalid auction ID."));
    }

    // finding the auction using its id
    const auction = await Auction.findById(req.params.id);
    // checking if auction exists or not
    if (!auction) {
      return res.status(404).json(new ApiResponse(404, "Auction not found."));
    }

    // check the current time against the auction start and end time 
    const now = new Date();
    // let newStatus;

    // logs to confirm that the conditions for changing the auction status are being met
    console.log("Current Time: ", now);
    console.log("Auction Start Time: ", auction.startTime);
    console.log("Auction End Time: ", auction.endTime);

    if (now < auction.startTime) {
      newStatus = "upcoming";
    } else if (now > auction.startTime && now < auction.endTime) {
      newStatus = "active";
    } else {
      newStatus = "over";
    }
    await auction.save();

    // console.log("New Status: ", newStatus);
    // // Update status only if it has changed
    // if (auction.status !== newStatus) {
    //   auction.status = newStatus;
    //   await auction.save();
    //   console.log("Status updated in DB: ", auction.status);
    // }

    return res.json(new ApiResponse(200, "Auction status updated successfully.", auction));
  } catch (error) {
    return res.status(500).json(new ApiResponse(500, error?.message || "Internal server error."));
  }
});


// @desc delete auction by id
// @route DELETE /api/v1/auctions/delete/:id
// @access Private
const deleteSingleAuctionById = asyncHandler(async (req, res) => {
  // res.send("test");

  try {
    // finding the auction by its id
    const auction = await Auction.findById(req.params.id);
    // checking if auction exists or not
    if (!auction) {
      return res.status(404).json(new ApiResponse(404, "Auction not found."));
    }

    // deleting the related bids 
    const bids = await Bid.find({ auction: req.params.id });
    if (bids) {
      await Bid.deleteMany({ auction: req.params._id });
    }
    console.log(auction, "auction......");
    // deleting the auction
    await Auction.deleteOne({ _id: req.params.id });

    return res.json(new ApiResponse(200, "Auction deleted successfully", auction));
  } catch (error) {
    return res.status(500).json(new ApiResponse(500, error?.message || "Internal server error"));
  }
});


// @desc Get all auctions by a user uploaded by seller
// @route GET /api/v1/auctions/user-auctions
// @access Private
const getAuctionsByUser = asyncHandler(async (req, res) => {
  // res.send("test");

  try { 
    console.log("Authenticated User:", req.user); // Debug log
    if (!req.user || !req.user._id) {
      return res.status(400).json(new ApiResponse(400, "User Id is not available."));
    }
    
    
    console.log("User Id Type is:", typeof req.user._id); // Log the user ID being queried
    console.log("User Id Value is: ", req.user._id);

    // finding auctions, fetching additionals details to the auctions, and sorting the auctions by creation date in descending order
    const auctions = await Auction.find({ seller: req.user._id })
      .populate( "category", "name" )
      .populate({
        path: "winner",
        populate: {
          path: "bidder",
          select: "fullName",
        },
      })
      .sort({createdAt:-1})

    // checking for auctions
    if (!auctions) {
      return res.status(404).json(new ApiResponse(404, "No auctions found."));
    }
    return res.json(new ApiResponse(200, "Auctions retrieved successfully.", { auctions:auctions })
    );
    } catch (error) {
      return res.status(500).json(new ApiResponse(500, error?.message || "Internal server error."));
    }
});


// @desc Get all auctions of a currently-loggedIn-user on which he placed bids
// @route GET /api/v1/auctions/user-bids
// @access Private
const getBidsAuctionsByUser = asyncHandler(async (req, res) => {
  // res.send("test");

  try {
    // fetching bids to get all bids associated with the logged-id user
    const bids = await Bid.find({ bidder: req.user._id }).populate("auction")
    // populate category in auction
    .populate({
      path: "auction",
      populate: {
        path: "category",
        select: "name",
      }
    })
    .sort({ createdAt: -1 });

    if (!bids) {
      return res.status(404).json(new ApiResponse(404, "No bids found."));
    }

    return res.json(
      new ApiResponse(200, "Bids retrieved successfully.", bids)
    );
  } catch (error) {
    return res.status(500).json(new ApiResponse(500, error?.message || "Internal server error"));
  }
});



// @desc update a single auction by id
// @route PUT /api/v1/auctions/update/:id
// @access Private

const updateSingleAuctionById = asyncHandler(async (req, res) => {
  // res.send("test"); 

  try {
    // extracting relevent fields
    const {
      name,
      description,
      category,
      startTime,
      endTime,
      startingPrice,
      location,
    } = req.body;
    const image = req.file?.path;

    console.log("req.body........", req.body);

    // finding the auction by its id
    const auction = await Auction.findById(req.params.id);
    // checking if the auction exists or not
    if (!auction) {
      return res.status(404).json(new ApiResponse(404, "Auction not found."));
    }

    // Checking if startingPrice is a positive number
    if (startingPrice <= 0) {
      return res.status(400).json(new ApiResponse(400, "Starting price must be a positive number."));
    }

    //checking starting time and current time to update status accordingly
    let currentDate = new Date();
   
    // const auctionStartTime = new Date(auction.startTime);
    // const auctionEndTime = new Date(auction.endTime);

    // if ( startTime || endTime ) {
    //   if (currentDate > endTime) { 
    //     return res.status(400).json(new ApiResponse(400, "Auction has already started, you can't update start time or end time."));
    //   }
    // }

    if(startTime !== auction.startTime || endTime !== auction.endTime){
      if(currentDate.getTime()>auction.startTime.getTime()){
        return res.status(400).json(new ApiResponse(400, "Auction has already started, you can't update start time or end time"));
      }
    }

    if ( startTime > endTime ) {
      return res.status(400).json(new ApiResponse(400, "Start time must be before end time."));
    }
    // updating auction based on time
    if ( startTime < currentDate.getTime() ) {
      auction.status = "active";
    } else {
      auction.status = "upcoming";
    }
    if ( auction.status === "over" ) {
      return res.status(400).json(new ApiResponse(400, "Auction is over, you can't update."));
    }

    // handling the image upload
    
    if (image) {
      var imgUrlCloudinary = await uploadOnCloudinary(image);
      console.log(imgUrlCloudinary);
      if (!imgUrlCloudinary?.url) {
        return res.status(400).json(new ApiResponse(400, "Invalid image."));
      }
    }

    // updating the auction properties

    // auction.set({
    //   name: name ?? auction.name,
    //   description: description ?? auction.description,
    //   category: category ?? auction.category,
    //   startTime: startTime ?? auction.startTime,
    //   endTime: endTime ?? auction.endTime,
    //   startingPrice: startingPrice ?? auction.startingPrice,
    //   location: location ?? auction.location,
    //   image: imgUrlCloudinary?.url ?? auction.image,
    // })

    auction.name = name ? name : auction.name;
    auction.description = description ? description : auction.description;
    auction.category = category ? category : auction.category;
    auction.startTime = startTime ? startTime : auction.startTime;
    auction.endTime = endTime ? endTime : auction.endTime;
    auction.startingPrice = startingPrice ? startingPrice : auction.startingPrice;
    auction.location = location ? location : auction.location;

    auction.image = imgUrlCloudinary?.url
      ? imgUrlCloudinary.url
      : auction.image ;
    
    await auction.save();
    // Populate and return the updated auction
    const updatedAuction = await Auction.findById(auction._id)
    .populate("category", "name")
    .populate("seller", "fullName") // Assuming you want to populate seller details
    .exec();

    return res.status(201).json(new ApiResponse(201, "Auction Updated Successfully.", updatedAuction));
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json(new ApiResponse(error.statusCode || 500,error.message || "Internal Server Error"));
  }
});





// @desc Get LIVE 10 auctions 
// @route GET /api/v1/auctions/live
// @access Public

const getLiveAuctions = asyncHandler(async (req, res) => {
  // res.send("test");

  try {
    const auctions = await Auction.find({ status: "active" })
      .limit(10)
      .populate("seller", "fullName email phone location profilePicture")
      .populate({
        path: "winner",

        populate: {
          path: "bidder",
          select: "fullName  profilePicture",
        },
      });

    if (!auctions) {
      return res.status(404).json(new ApiResponse(404, "No auctions found"));
    }
    return res.json(
      new ApiResponse(200, "Auctions retrieved successfully", auctions)
    );
  } catch (error) {
    // Handle the error
    // console.error("Error retrieving live auctions:", error);
    return res.status(500).json(new ApiResponse(500, error?.message || "Internal server error"));
  }
});





// @desc Get UPCOMING 10 auctions
// @route GET /api/v1/auctions/upcoming-auctions
// @access Public

const getUpcomingAuctions = asyncHandler(async (req, res) => {
  // res.send("test");

  try {
    const auctions = await Auction.find({ status: "upcoming" })
      .limit(10)
      .populate("seller", "fullName email phone location profilePicture")
      .populate({
        path: "winner",

        populate: {
          path: "bidder",
          select: "fullName  profilePicture",
        },
      });

    if (!auctions) {
      return res.status(404).json(new ApiResponse(404, "No auctions found"));
    }
    return res.json(
      new ApiResponse(200, "Auctions retrieved successfully", auctions)
    );
  } catch (error) {
    // Handle the error
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal server error"));
  }
});



// @desc Get auction winner
// @route GET /api/v1/auctions/:id/winner
// @access Public
const getAuctionWinner = asyncHandler(async (req, res) => {
  
  try {
    const auction = await Auction.findById(req.params.id)
    .populate(
      {
        path: "winner",
        populate: {
          path: "bidder",
          select: "fullName  profilePicture",
        },
      }
    )
      
    if (!auction) {
      return res.status(404).json(new ApiResponse(404, "Auction not found."));
    }
    if (auction.bids.length === 0) {
      return res.status(404).json(new ApiResponse(404, "No bids found."));
    }
    const winner = {
      winnerFullName:auction?.winner?.bidder?.fullName,
      winnerProfilePicture:auction?.winner?.bidder?.profilePicture,
      winnerBidAmount:auction?.winner?.bidAmount,
      winnerBidTime:auction?.winner?.bidTime
    }

return res.status(200).json(new ApiResponse(200, "Auction winner retrieved successfully.", {winner:winner}));
    
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal server error."));
  }
});


// @desc update payment status of auction
// @desc PUT /api/v1/auctions/update-payment-status/:id (auctionId)
// @desc Private

const updatePaymentStatus = asyncHandler(async (req, res) => {
  // res.send("test");

  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json(new ApiResponse(404, "Auction not found."));
    }
    auction.paid = true;
    await auction.save();
    return res.json(new ApiResponse(200, "Auction payment status updated successfully", auction));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal Server Error."));
  }
});





export {
  createAuction,
  getSingleAuctionById,
  getAllAuctions,
  updateAuctionStatus,
  deleteSingleAuctionById,
  getAuctionsByUser,
  getBidsAuctionsByUser,
  updateSingleAuctionById,
  getLiveAuctions,
  getUpcomingAuctions,
  getAuctionWinner,
  updatePaymentStatus
  
};