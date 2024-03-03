import { Router } from "express";
import {
  changeUserPassword,
  getUser,
  loginUser,
  logoutUser,
  refreshUserToken,
  registerUser,
  updateUser,
} from "../controller/user.controller.js";
import { upload } from "../middleware/multer.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// Register
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  registerUser
);
// Password hashing not working :- Done
// Removing the upload middleware make field undefined frst_name,last_name etc.. PLEASE CHECK
// Write a CRUD operation on user

// Login
router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshUserToken);
//Secure Route
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/changepassword").post(verifyJWT, changeUserPassword);
router.route("/getuser").post(verifyJWT, getUser);
router
  .route("/updateuser")
  .post(verifyJWT, upload.single("avatar"), updateUser);

export default router;
