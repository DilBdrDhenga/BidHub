import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import ProductCategory from "../models/productCategoryModel.js";

import mongoose from "mongoose";


// @desc Create product category
// @route POST /api/v1/product-categories
// @access Private
const createProductCategory = asyncHandler(async (req, res) => {
    // res.send("test");
    
    try {

        const { name, description } = req.body;
        const image = req.file?.path;
        
        // Check if any fields are empty
        if (!name || !description || !image) {
            throw new ApiError(400, "All fields are required");
        };  

        // Check if product category exists
        const existedProductCategory = await ProductCategory.findOne({ name });
        if (existedProductCategory) {
            throw new ApiError(409, "Product category already exists");
        }

        // uploading image to cloudinary
        const imgUrlCloudinary = await uploadOnCloudinary(image);
        if(!imgUrlCloudinary){
            throw new ApiError(500, "Error uploading image");
        }

        // creating product category
        const productCategory = await ProductCategory.create({
            name,
            description,
            imageUrl: imgUrlCloudinary.url 
        });


        if (!productCategory) {
            throw new ApiError(500, "Error creating product category");
        }

        res.status(201).json(new ApiResponse(201, "Product category created successfully", productCategory));
    } catch (error) {
        // Handle the error
        throw new ApiError(500, error?.message || "Internal server error");
    }
});


// @desc Get a specific product category by id
// @route GET /api/v1/product-categories/:id
// @access Public
const getProductCategory = asyncHandler(async (req, res) => {
    // res.send("test");
    
    try {
        // extracting id and finding the productcategory with the specified id
        const { id } = req.params;
        const productCategory = await ProductCategory.findById(id);

        // checking if product category exist or not
        if (!productCategory) {
            throw new ApiError(404, "Product category not found");
        }
        res.status(200).json(new ApiResponse(200, "Product category retrieved successfully", productCategory));

    } catch (err) {
        throw new ApiError(500, err?.message || "Internal server error");
    }
});


// @desc Get all product categories
// @route GET /api/v1/product-categories
// @access Public
const getAllProductCategories = async ( req, res) => {
    // res.send("test");
    
    try {
        // fetching all product categories from the database
        const productCategories = await ProductCategory.find();
        res.status(200).json(new ApiResponse(200, "Product categories retrieved successfully", productCategories));
    } catch (err) {
        return res.status(500).json(new ApiResponse(500, err?.message || "Internal server error"));
    }
};


//@desc update product category
//@route PUT /api/v1/product-categories/:id
//@access Private/Admin
const updateProductCategory = asyncHandler(async (req, res) => {
    // res.send("test");

    try {
        const { id } = req.params;
        const { name, description } = req.body;
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json(new ApiResponse(400, "Invalid category ID."));
        }

        // finding product category by id and checking if it exists or not
        const productCategory = await ProductCategory.findById(id);
        if (!productCategory) {
            return res.status(404).json(new ApiResponse(404, "Product category not found."));
        }

        // handling image upload if provided
        const image = req.file?.path;
        //Checking for existing image and   updating the image
        if(image){
            const imgUrlCloudinary = await uploadOnCloudinary(image);
            if(!imgUrlCloudinary){
                throw new ApiError(500, "Error uploading image.");
            }
            productCategory.imageUrl = imgUrlCloudinary.url;
        } 
        else{
            productCategory.imageUrl = productCategory.imageUrl;
        }
        
        productCategory.name = name ? name : productCategory.name;
        productCategory.description = description ? description : productCategory.description;
    
        await productCategory.save();
    
        res.status(201).json(new ApiResponse(201, "Product category updated successfully", productCategory));
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, error?.message || "Internal server error"));
    }
});


//@desc delete product category
//@route DELETE /api/v1/product-categories/:id
//@access Private/Admin
const deleteProductCategory = asyncHandler(async (req, res) => {
    // res.send("test");
    
    try {
        // extracting the id parameter
        const { id } = req.params;

        // finding the product category in the database using the extracted id
        const productCategory = await ProductCategory.findById(id);
        // checking if it exists or not
        if (!productCategory) {
            return res.status(404).json(new ApiResponse(404, "Product category not found."));
        }
        // if the productcategory exist then it calls the findByIdAndDelete to remove it from the database
        await ProductCategory.findByIdAndDelete(id);
        res.status(200).json(new ApiResponse(200, "Product category deleted successfully."));
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, error?.message || "Internal server error."));
    }
});



// @desc Get total number & Popular & 
// @route GET /api/v1/product-categories/detail
// @access Admin

const getCatgegoriesMoreDetail = asyncHandler(async (req, res) => {
    try {
        console.log("start........");
        const totalCategories = await ProductCategory.countDocuments();

        //find a categegory which have most products from Auction Model and get it
        const mostPopulatedCategory = await ProductCategory.aggregate([
            {
                $lookup: {
                    from: "auctions",
                    localField: "_id",
                    foreignField: "category",
                    as: "products"
                }
            },
            {
                $project: {
                    name: 1,
                    products: { $size: "$products" }
                }
            },
            {
                $sort: { 'products': -1 }
            },
            {
                $limit: 1
            }
        ]);

        const recentlyAddedCategory = await ProductCategory.findOne().sort({ 'createdAt': -1 });

        console.log(totalCategories, recentlyAddedCategory);
        res.status(200).json(new ApiResponse(200, "Product categories retrieved successfully", {
            totalCategories,
             mostPopulatedCategory ,
            //  leastPopulatedCategory ,
            recentlyAddedCategory
        }));
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, error?.message || "Internal server error"));
    }
})


// @desc Get Top 5 Categories
// @route GET /api/v1/product-categories/top
// @access Admin
const getTopCategories = asyncHandler(async (req, res) => {
    try {
        const topCategories = await ProductCategory.aggregate([
            {
                $lookup: {
                    from: "auctions",
                    localField: "_id",
                    foreignField: "category",
                    as: "products"
                }
            },
            {
                $project: {
                    name: 1,
                    products: { $size: "$products" }
                }
            },
            {
                $sort: { 'products': -1 }
            },
            {
                $limit: 5
            }
        ]);
        console.log(topCategories);
        res.status(200).json(new ApiResponse(200, "Top 5 categories retrieved successfully", topCategories));
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, error?.message || "Internal server error"));
    }
})



export {
    createProductCategory,
    getProductCategory,
    getAllProductCategories,
    updateProductCategory,
    deleteProductCategory,
    getCatgegoriesMoreDetail,
    getTopCategories,
    
};