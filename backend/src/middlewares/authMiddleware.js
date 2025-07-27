import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import User from "../models/userModel.js";


const verifyUser = asyncHandler(async (req, res, next) => {
    try {
      // checking if JWT_SECRET environment variable is defined or not
      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined.");
      }

      // extracting token
      const token = req.cookies?.JwtToken ||  req.headers.authorization?.split(" ")[1];
      // to print token if it is recieved
      console.log("Token recieved: ", token);

      // to check if token is recieved or not
      if (!token) {
        console.log("No token found.");
        return res.status(401).json(new ApiResponse(401, "Unauthorized request, No token found"));
      }
    
      // verifying token 
      const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);
      // log the decoded token
      // console.log("decodedToken", decodedToken);
    
      // fetching user from database using id
      const user = await User.findById(decodedToken?._id).select("-password");
      // log the retrived user
      // console.log("User from token: ", user);

      // checking if user exists or not
      if (!user) {
        // logging the user Id that is being searched for when user is not found
        console.log("User not found for ID: ", decodedToken?._id);
        return res.status(401).json(new ApiResponse(401, "Unauthorized request, User not found."));
      }
    
      //console.log(user, "user")
    
      req.user = user;
      next();
      
    } catch (error) {
      // logging the error when catching errors from jwt.verify
      console.log("JWT verification error: ", error);
      const message = error?.name === "JsonWebTokenError" ? "Invalid token." : error.message || "Unauthorized request.";
      return res.status(401).json(new ApiResponse(401, message));
    }
});


const verifySeller = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies?.JwtToken ||  req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json(new ApiResponse(401, "Unauthorized request"));
    }

    const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);
    //console.log(decodedToken, "decodedToken")


    // extracting the user
    const user = await User.findById(decodedToken?._id).select("-password");
    console.log("Seller User is: ", user);
    // Ensuring if user as seller exists or not
    if (!user) {
      return res.status(401).json(new ApiResponse(401, "User not authenticated. Not a valid Seller Id."));
    }
    console.log("Verifying seller access for user ID: ", user._id);
    // console.log(user);

    // checking if usertype is seller or not
    if (user.userType !== "seller") {
     return res.status(403).json(new ApiResponse(403, "Access denied."));
    }

    next();
  } catch (error) {
    return res.status(401).json(new ApiResponse(401, error?.message || "Unauthorized request."));
  }
});


const verifyAdmin = asyncHandler(async (req, res, next) => {
  try {
    //i dont have to check if the user is a seller or buyer 


    // user verification
    const user = req.user;
    if(!user){
      console.warn("Unauthorized access attempt: User not authenticated.");
      return res.status(401).json(new ApiResponse(401, "Unauthorized request. Not a valid Admin."));
    }

    // to inspect user object
    console.log(`Verifying admin access for user ID: ${user._id}, User type: ${user.userType}`);

    // checks if the usertype is admin or not
    if (user.userType !== "admin") {
      console.warn(`Access denied for user: ${user._id}. User type: ${user.userType}`);
      return res.status(403).json(new ApiResponse(403, "Access denied."));
    }

    next();
  } catch (error) {
    return res.status(401).json(new ApiResponse(401, error?.message || "Unauthorized request."));
  }
});


export {
  verifyUser,
  verifySeller,
  verifyAdmin
};