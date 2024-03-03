import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudnary } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../model/user.model.js";
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "../constants.js";

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user?.generateAcessToken();
    const refreshToken = await user?.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      error?.message ||
        "Something went wrong while generating referesh and access token"
    );
  }
};
const options = {
  httpOnly: true,
  secure: true,
};
export const registerUser = asyncHandler(async (req, res) => {
  const { first_name, last_name, email, password, avatar } = req.body;
  // console.log({ first_name, last_name, email, password, avatar });
  if (
    [first_name, last_name, email, password].some((field) => {
      field?.trim() === "";
    })
  ) {
    console.log("VALIDATION _FAILED:::::");
    throw new ApiError(403, "All Field are required");
  }
  const existedUser = User.findOne({
    $or: [{ email }],
  });
  // console.log("EXISYTED_ERROR_USER", existedUser);
  // if (existedUser) throw new ApiError(409, "User Already exists");

  const avatarLocalPath = req?.files?.avatar?.[0]?.path;
  const avatarCloud = await uploadOnCloudnary(avatarLocalPath);

  const newUser = await User.create({
    first_name,
    last_name,
    email,
    password,
    avatar: avatarCloud || "",
  });
  const createdUser = await User.findById(newUser._id).select(
    "-password -refreshToken"
  );

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User created successfully"));
});
export const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  console.log(email);

  if (!username && !email) {
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{ email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  console.log("isPasswordValid::", isPasswordValid);
  if (!isPasswordValid) {
    res.status(401).json(new ApiError(401, "Invalid user credentials"));
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});
export const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    }
  );
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "User loggedOut Successfully"));
});
export const refreshUserToken = asyncHandler(async (req, res) => {
  const tokenbyUser = req.cookies.refreshToken || req.body.refreshToken;
  if (!tokenbyUser) throw new ApiError(401, "unauthorized request");
  try {
    const tokendata = jwt.verify(tokenbyUser, ACCESS_TOKEN_SECRET);
    const user = await User.findById(tokendata?._id);
    if (!user) throw new ApiError(401, "Invalid refresh token");
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
      user._id
    );
    console.log({ accessToken, refreshToken });
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});
export const updateUser = asyncHandler(async (req, res) => {
  const { first_name, last_name } = req.body;
  const avatarPath = req.file?.path;
  if (!first_name || !last_name || !avatarPath)
    throw new ApiError(
      401,
      "First Name and last name  and avatar is required field "
    );
  const newAvatarUrl = await uploadOnCloudnary(avatarPath);
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        first_name,
        last_name,
        avatar: newAvatarUrl,
      },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");
  res.status(200).json(new ApiError(200, user, "User updated successfully"));
});
export const changeUserPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);
  console.log({ user });
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) throw new ApiError(401, "Invalid old password");
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, "Password updated"));
});
export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "-password -refreshToken"
  );
  if (!user) throw new ApiError(401, "No such user");
  res.status(200).json(user);
});

export const getUserDetails = asyncHandler(async (req, res) => {});
