import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "../constants.js";
import { User } from "../model/user.model.js";
export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new ApiError(401, "Unauthorized Request");
    }
    const decodedJwt = Jwt.verify(token, ACCESS_TOKEN_SECRET);
    const checkUser = await User.findById(decodedJwt?._id).select(
      "-password -refreshToken"
    );
    if (!checkUser) {
      throw new ApiError(401, "Invalid access token");
    }
    req.user = checkUser;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Error in auth middleware");
  }
});
