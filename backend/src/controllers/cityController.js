import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import City from "../models/cityModel.js";
// @desc Add city
// @route POST /api/v1/cities
// @access Private
const addCity = asyncHandler(async (req, res) => {
    console.log(req.body);
    try {
        const { name, location } = req.body; // Destructure location from the request body

        // Check if fields are empty
        if (!name  || !location.type || !location.coordinates) {
            return res.status(400).json(new ApiResponse(400, "All fields are required."));
        }

        // Check if the location type is valid
        if (location.type !== 'Point') {
            return res.status(400).json(new ApiResponse(400, "Invalid location type. Must be 'Point'."));
        }

        // Check if coordinates are valid
        if (!Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
            return res.status(400).json(new ApiResponse(400, "Coordinates must be an array of [longitude, latitude]."));
        }

        // Searching the city collection to check if a city with the same name exists already
        const existedCity = await City.findOne({ name });
        if (existedCity) {
            return res.status(409).json(new ApiResponse(409, "City already exists."));
        }

        // Creating a new city record with the provided name and location
        const city = await City.create({
            name,
            location // Include the location field
        });

        // Error handling for city creation
        if (!city) {
            return res.status(500).json(new ApiResponse(500, "Error creating city."));
        }
        return res.status(201).json(new ApiResponse(201, "City created successfully.", city));
    } catch (error) {
        // Handle the error
        return res.status(500).json(new ApiResponse(500, error?.message || "Internal server error."));
    }
});


// @desc Get all cities
// @route GET /api/v1/cities
// @access Public
const getAllCities = asyncHandler(async (req, res) => {
    // res.send("test");
    
    try {
        const cities = await City.find({});

        // checking if city exists or not
        if (!cities) {
            return res.status(404).json(new ApiResponse(404, "Cities not found"));
        }
        return res.status(200).json(new ApiResponse(200, "Cities found", cities));
    } catch (error) {
        // Handle the error
        return res.status(500).json(new ApiResponse(500, error?.message || "Internal server error"));
    }
});


// @desc Get nearby cities based on geolocation
// @routes GET /api/v1/cities/nearby
// @access Public

const getNearbyCities = asyncHandler(async (req, res) => {
    // res.send("test");

    const { lat, lon } = req.query;

    if (!lat || !lon) { 
        return res.status(400).json(new ApiResposne(400, "Latitude and Longitude are reqquired."));
    }

    try {
        const cities = await City.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [lon, lat],    // Note: [longitude, latitude]
                    },
                    $maxDistance: 100000,     // adjust the distance as needed (in meters)
                },
            },
        });

        if (!cities.length) {
            return res.status(404).json(new ApiResponse(404, "No cities found"));
        }
    
        return res.status(200).json(new ApiResponse(200, "Nearby cities found", cities));
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, error?.message || "Internal Server Error"));
    }
});


export {
    addCity,
    getAllCities,
    getNearbyCities,
}; 