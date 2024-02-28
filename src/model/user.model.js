import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bycrpt from "bcryptjs";
import { ACCESS_TOKEN_SECRET } from "../constants.js";

const usersSchema = new mongoose.Schema(
  {
    first_name: {
      type: "String",
      required: true,
    },
    last_name: {
      type: "String",
      required: true,
    },
    email: {
      type: "String",
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // make field searchable it also make the performace low (don;t assign all the field)
    },
    password: {
      type: "String",
      required: [true, "Password must be at least 8 digit long"],
    },
    avatar: {
      type: "String",
      // required: true,
    },
    watchHistory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
    },
    refreshToken: {
      type: "String",
    },
  },
  { timestamps: true }
);

usersSchema.pre("save", (next) => {
  console.log("Pre hook middle to run before saving the data");
  next();
});
usersSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bycrpt.hash(this.password, 10);
  next();
});
// your custom method
usersSchema.methods.isPasswordCorrect = async function (password) {
  console.log("Pre hook middleware 2");
  return await bycrpt.compare(password, this.password);
};
usersSchema.methods.generateAcessToken = async function () {
  console.log("Pre hook middleware 3");
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      first_name: this.first_name,
    },
    ACCESS_TOKEN_SECRET,
    {
      expiresIn: "1d",
    }
  );
};
usersSchema.methods.generateRefreshToken = async function () {
  console.log("Pre hook middleware 4");
  return jwt.sign(
    {
      _id: this._id,
    },
    ACCESS_TOKEN_SECRET,
    {
      expiresIn: "1d",
    }
  );
};

export const User = mongoose.model("User", usersSchema);
