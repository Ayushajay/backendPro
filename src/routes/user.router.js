import { Router } from "express";
import { registerUser } from "../controller/user.controller.js";
import { upload } from "../middleware/multer.js";

const router = Router();

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
export default router;
