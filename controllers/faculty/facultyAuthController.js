import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

import Faculty from "../../models/faculty/Faculty.js";

import {
  uploadImageToCloudinary,
  deleteFromCloudinary,
} from "../../utils/cloudinaryHelper.js";

import {
  successResponse,
  errorResponse,
} from "../../utils/responseHandler.js";

/* ==========================================================================
   OTP STORE
============================================================================= */

const otpStore = {};

/* ==========================================================================
   REGISTER FACULTY
============================================================================= */

export const registerFaculty =
  async (req, res) => {
    try {
      const {
        name,
        email,
        password,
      } = req.body;

      /* ======================================
         VALIDATION
      ====================================== */

      if (
        !name ||
        !email ||
        !password
      ) {
        return errorResponse(
          res,
          400,
          "Name, email and password are required."
        );
      }

      if (
        password.length < 6
      ) {
        return errorResponse(
          res,
          400,
          "Password must be at least 6 characters."
        );
      }

      /* ======================================
         DUPLICATE CHECK
      ====================================== */

      const normalizedEmail =
        email
          .trim()
          .toLowerCase();

      const existingFaculty =
        await Faculty.findOne({
          email:
            normalizedEmail,
        });

      if (
        existingFaculty
      ) {
        return errorResponse(
          res,
          400,
          "Faculty already exists."
        );
      }

      /* ======================================
         CREATE FACULTY
      ====================================== */

      const faculty =
        await Faculty.create({
          name:
            name.trim(),
          email:
            normalizedEmail,
          password,
          role:
            "faculty",
        });

      const facultyData =
        faculty.toObject();

      delete facultyData.password;

      return successResponse(
        res,
        201,
        "Faculty registered successfully.",
        {
          faculty:
            facultyData,
        }
      );
    } catch (error) {
      console.error(
        "Register Faculty Error:",
        error
      );

      return errorResponse(
        res,
        500,
        error.message
      );
    }
  };

/* ==========================================================================
   FORGOT PASSWORD
============================================================================= */

export const forgotPassword =
  async (req, res) => {
    try {
      const {
        email,
      } = req.body;

      const normalizedEmail =
        email
          .trim()
          .toLowerCase();

      const faculty =
        await Faculty.findOne({
          email:
            normalizedEmail,
        });

      if (!faculty) {
        return errorResponse(
          res,
          404,
          "Faculty not found."
        );
      }

      /* ======================================
         GENERATE OTP
      ====================================== */

      const otp =
        Math.floor(
          100000 +
            Math.random() *
              900000
        ).toString();

      otpStore[
        normalizedEmail
      ] = otp;

      /* ======================================
         EMAIL TRANSPORT
      ====================================== */

      const transporter =
        nodemailer.createTransport(
          {
            service:
              "gmail",
            auth: {
              user:
                process.env.EMAIL_USER,
              pass:
                process.env.EMAIL_PASS,
            },
          }
        );

      /* ======================================
         SEND OTP EMAIL
      ====================================== */

      await transporter.sendMail({
        from:
          process.env.EMAIL_USER,
        to:
          normalizedEmail,
        subject:
          "Faculty Password Reset OTP",
        html: `
          <div style="font-family:Arial,sans-serif;padding:20px">
            <h2>Password Reset Request</h2>

            <p>Your One Time Password is:</p>

            <h1
              style="
                color:#2563eb;
                letter-spacing:4px;
              "
            >
              ${otp}
            </h1>

            <p>
              Use this OTP to reset your password.
            </p>

            <p>
              Ignore this email if you did not request a password reset.
            </p>
          </div>
        `,
      });

      return successResponse(
        res,
        200,
        "OTP sent successfully."
      );
    } catch (error) {
      console.error(
        "Forgot Password Error:",
        error
      );

      return errorResponse(
        res,
        500,
        error.message
      );
    }
  };
  /* ==========================================================================
   RESET PASSWORD
============================================================================= */

export const resetPassword =
  async (req, res) => {
    try {
      const {
        email,
        otp,
        newPassword,
      } = req.body;

      const normalizedEmail =
        email
          .trim()
          .toLowerCase();

      /* ======================================
         OTP VALIDATION
      ====================================== */

      if (
        otpStore[
          normalizedEmail
        ] !== otp
      ) {
        return errorResponse(
          res,
          400,
          "Invalid OTP."
        );
      }

      /* ======================================
         PASSWORD VALIDATION
      ====================================== */

      if (
        !newPassword ||
        newPassword.length < 6
      ) {
        return errorResponse(
          res,
          400,
          "Password must be at least 6 characters."
        );
      }

      /* ======================================
         FIND FACULTY
      ====================================== */

      const faculty =
        await Faculty.findOne({
          email:
            normalizedEmail,
        });

      if (!faculty) {
        return errorResponse(
          res,
          404,
          "Faculty not found."
        );
      }

      /* ======================================
         UPDATE PASSWORD
      ====================================== */

      faculty.password =
        newPassword;

      await faculty.save();

      /* ======================================
         REMOVE OTP
      ====================================== */

      delete otpStore[
        normalizedEmail
      ];

      return successResponse(
        res,
        200,
        "Password reset successfully."
      );
    } catch (error) {
      console.error(
        "Reset Password Error:",
        error
      );

      return errorResponse(
        res,
        500,
        error.message
      );
    }
  };

/* ==========================================================================
   LOGIN FACULTY
============================================================================= */

export const loginFaculty =
  async (req, res) => {
    try {
      const {
        email,
        password,
      } = req.body;

      const normalizedEmail =
        email
          .trim()
          .toLowerCase();

      /* ======================================
         FIND FACULTY
      ====================================== */

      const faculty =
        await Faculty.findOne({
          email:
            normalizedEmail,
        });

      if (!faculty) {
        return errorResponse(
          res,
          404,
          "Faculty not found."
        );
      }

      /* ======================================
         VERIFY PASSWORD
      ====================================== */

      const isMatch =
        await bcrypt.compare(
          password,
          faculty.password
        );

      if (!isMatch) {
        return errorResponse(
          res,
          400,
          "Invalid email or password."
        );
      }

      /* ======================================
         GENERATE JWT
      ====================================== */

      const token =
        jwt.sign(
          {
            id:
              faculty._id,
            role:
              "faculty",
          },
          process.env.JWT_SECRET,
          {
            expiresIn:
              "7d",
          }
        );

      const facultyData =
        faculty.toObject();

      delete facultyData.password;

      return successResponse(
        res,
        200,
        "Login successful.",
        {
          token,
          faculty:
            facultyData,
        }
      );
    } catch (error) {
      console.error(
        "Faculty Login Error:",
        error
      );

      return errorResponse(
        res,
        500,
        error.message
      );
    }
  };
  /* ==========================================================================
   GET FACULTY PROFILE
============================================================================= */

export const getFacultyProfile =
  async (req, res) => {
    try {
      /* ======================================
         FIND FACULTY
      ====================================== */

      const faculty =
        await Faculty.findById(
          req.user.id
        )
          .select(
            "-password"
          )
          .lean();

      if (!faculty) {
        return errorResponse(
          res,
          404,
          "Faculty not found."
        );
      }

      /* ======================================
         SUCCESS RESPONSE
      ====================================== */

      return successResponse(
        res,
        200,
        "Faculty profile fetched successfully.",
        {
          faculty,
        }
      );
    } catch (error) {
      console.error(
        "Get Faculty Profile Error:",
        error
      );

      return errorResponse(
        res,
        500,
        error.message
      );
    }
  };

/* ==========================================================================
   UPDATE FACULTY PROFILE
============================================================================= */

export const updateFacultyProfile =
  async (req, res) => {
    try {
      /* ======================================
         FIND FACULTY
      ====================================== */

      const faculty =
        await Faculty.findById(
          req.user.id
        );

      if (!faculty) {
        return errorResponse(
          res,
          404,
          "Faculty not found."
        );
      }

      let photo =
        faculty.photo;

      let photoPublicId =
        faculty.photoPublicId;

      /* ======================================
         REMOVE EXISTING PHOTO
      ====================================== */

      if (
        req.body.removePhoto ===
        "true"
      ) {
        if (
          photoPublicId
        ) {
          await deleteFromCloudinary(
            photoPublicId
          );
        }

        photo = "";
        photoPublicId =
          "";
      }

      /* ======================================
         UPLOAD NEW PHOTO
      ====================================== */

      if (req.file) {
        if (
          !req.file.mimetype.startsWith(
            "image/"
          )
        ) {
          return errorResponse(
            res,
            400,
            "Only image files are allowed."
          );
        }

        if (
          photoPublicId
        ) {
          await deleteFromCloudinary(
            photoPublicId
          );
        }

        const uploadResult =
          await uploadImageToCloudinary(
            req.file,
            "faculty"
          );

        photo =
          uploadResult.secure_url;

        photoPublicId =
          uploadResult.public_id;
      }

      /* ======================================
         UPDATE BASIC DETAILS
      ====================================== */

      faculty.name =
        req.body.name ??
        faculty.name;

      faculty.email =
        req.body.email
          ?.trim()
          ?.toLowerCase() ??
        faculty.email;

      faculty.designation =
        req.body.designation ??
        faculty.designation;

      faculty.department =
        req.body.department ??
        faculty.department;

      faculty.phone =
        req.body.phone ??
        faculty.phone;

      faculty.photo =
        photo;

      faculty.photoPublicId =
        photoPublicId;

      await faculty.save();
            /* ======================================
         FETCH UPDATED FACULTY
      ====================================== */

      const updatedFaculty =
        await Faculty.findById(
          faculty._id
        )
          .select(
            "-password"
          )
          .lean();

      /* ======================================
         SUCCESS RESPONSE
      ====================================== */

      return successResponse(
        res,
        200,
        "Profile updated successfully.",
        {
          faculty:
            updatedFaculty,
        }
      );
    } catch (error) {
      console.error(
        "Update Faculty Profile Error:",
        error
      );

      return errorResponse(
        res,
        500,
        error.message
      );
    }
  };

/* ==========================================================================
   GET ALL FACULTY
============================================================================= */

export const getAllFaculty =
  async (req, res) => {
    try {
      /* ======================================
         FETCH FACULTY
      ====================================== */

      const faculty =
        await Faculty.find()
          .select(
            "-password"
          )
          .sort({
            name: 1,
          })
          .lean();

      /* ======================================
         SUCCESS RESPONSE
      ====================================== */

      return successResponse(
        res,
        200,
        "Faculty fetched successfully.",
        {
          count:
            faculty.length,
          faculty,
        }
      );
    } catch (error) {
      console.error(
        "Get All Faculty Error:",
        error
      );

      return errorResponse(
        res,
        500,
        error.message
      );
    }
  };