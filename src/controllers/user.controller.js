import { asyncHandler } from "../utilis/asyncHandler.js";
import {ApiError}  from "../utilis/apiError.js";
import {User} from "../models/user.model.js"

import {uploadOnCloudinary} from "../utilis/cloudinary.js"
import { ApiResponse } from "../utilis/apiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

const registerUser = asyncHandler( async(req, res)=>{
   //get user details from frontend
   //validation // check empty toh na bhej diya and all
   // check if user already exists by email ya username se
   //check for images, check for avatar
   //upload them to cloudinary, avatar
   //create user object - create entry in db
   //remove password and refresh token field from response
   //check for user creation
   //return response
   
//step 1
   const {fullName, email, username, password} =req.body;

   console.log("email: ", email);

   //step 2 validation

  if(
    [fullName, email, username, password].some((field)=> field?.trim()==="")

  ){

    throw new ApiError(400, "all fields are required");

  }

  //step 3 check already registred 

  const existedUser = await User.findOne({
    $or: [{ username }, { email }]
})

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists")
}



//step 4
//console.log(req.files);
const avatarLocalPath = req.files?.avatar[0]?.path;
//const coverImageLocalPath = req.files?.coverImage[0]?.path;


let coverImageLocalPath;
if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path
}

if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required")
}

const avatar = await uploadOnCloudinary(avatarLocalPath)
const coverImage = await uploadOnCloudinary(coverImageLocalPath)

if (!avatar) {
    throw new ApiError(400, "Avatar file is required")
}




//step 5




const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email, 
    password,
    username: username.toLowerCase()
})


//step 6

const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
)

//step 7 check for user creation

if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user")
}


//step 8  return

return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered Successfully")
)

} )














export {registerUser}