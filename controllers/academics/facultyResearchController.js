import mongoose from "mongoose";

import FacultyResearch from "../../models/academics/FacultyResearch.js";

import {
  uploadImageToCloudinary,
  deleteFromCloudinary,
} from "../../utils/cloudinaryHelper.js";

/* ==========================================================
   RESPONSE HELPERS
========================================================== */

const successResponse = (
  res,
  statusCode,
  message,
  data = null
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const errorResponse = (
  res,
  statusCode,
  message,
  error = null
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error:
      process.env.NODE_ENV === "development"
        ? error
        : undefined,
  });
};

/* ==========================================================
   VALIDATE OBJECT ID
========================================================== */

const isValidId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

/* ==========================================================
   PARSE ARRAY FIELD
========================================================== */

const parseArrayField = (
  value,
  fallback = []
) => {
  if (
    value === undefined ||
    value === null
  ) {
    return fallback;
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    try {
      const parsed =
        JSON.parse(value);

      if (
        Array.isArray(parsed)
      ) {
        return parsed;
      }
    } catch {}

    return value
      .split(",")
      .map((item) =>
        item.trim()
      )
      .filter(Boolean);
  }

  return fallback;
};

/* ==========================================================
   REMOVE CLOUDINARY PHOTO
========================================================== */

const removePhoto = async (
  faculty
) => {
  if (
    !faculty?.publicId
  ) {
    return;
  }

  await deleteFromCloudinary(
    faculty.publicId,
    "image"
  );
};

/* ==========================================================
   UPLOAD PHOTO
========================================================== */

const uploadPhoto = async (
  file
) => {
  if (!file) {
    return null;
  }

  const result =
    await uploadImageToCloudinary(
      file,
      "faculty-research"
    );

  return {
    photo:
      result.secure_url,
    publicId:
      result.public_id,
  };
};

/* ==========================================================
   GET ALL FACULTY
========================================================== */

export const getFacultyMembers =
  async (req, res) => {
    try {
      const {
        category,
        featured,
        active,
      } = req.query;

      const filter = {};

      if (category) {
        filter.category =
          category;
      }

      if (
        featured !==
        undefined
      ) {
        filter.featured =
          featured ===
          "true";
      }

      if (
        active !==
        undefined
      ) {
        filter.isActive =
          active ===
          "true";
      }

      const faculty =
        await FacultyResearch.find(
          filter
        )
          .sort({
            displayOrder: 1,
            createdAt: -1,
          })
          .lean();

      return successResponse(
        res,
        200,
        "Faculty members fetched successfully.",
        faculty
      );
    } catch (error) {
      return errorResponse(
        res,
        500,
        "Failed to fetch faculty members.",
        error.message
      );
    }
  };
  /* ==========================================================
   GET SINGLE FACULTY MEMBER
========================================================== */

export const getFacultyMemberById =
  async (req, res) => {
    try {

      const { id } = req.params;

      if (!isValidId(id)) {

        return errorResponse(
          res,
          400,
          "Invalid faculty member ID."
        );

      }

      const faculty =
        await FacultyResearch.findById(
          id
        ).lean();

      if (!faculty) {

        return errorResponse(
          res,
          404,
          "Faculty member not found."
        );

      }

      return successResponse(
        res,
        200,
        "Faculty member fetched successfully.",
        faculty
      );

    } catch (error) {

      return errorResponse(
        res,
        500,
        "Failed to fetch faculty member.",
        error.message
      );

    }
  };

/* ==========================================================
   GET FEATURED FACULTY
========================================================== */

export const getFeaturedFaculty =
  async (req, res) => {
    try {

      const faculty =
        await FacultyResearch.find({

          featured: true,

          isActive: true,

        })
          .sort({

            displayOrder: 1,

            createdAt: -1,

          })
          .lean();

      return successResponse(
        res,
        200,
        "Featured faculty fetched successfully.",
        faculty
      );

    } catch (error) {

      return errorResponse(
        res,
        500,
        "Failed to fetch featured faculty.",
        error.message
      );

    }
  };
  /* ==========================================================
   CREATE FACULTY MEMBER
========================================================== */

export const createFacultyMember =
  async (req, res) => {

     let uploadedPhoto = null;
    try {

      const {
        category,
        name,
        designation,
        qualification,
        department,
        email,
        phone,
        experience,
        scholarLink,
        orcidLink,
        linkedinLink,
        featured,
        isActive,
        displayOrder,
      } = req.body;

      /* ======================================
         VALIDATION
      ====================================== */

      if (!name?.trim()) {

        return errorResponse(
          res,
          400,
          "Faculty name is required."
        );

      }

      if (!designation?.trim()) {

        return errorResponse(
          res,
          400,
          "Designation is required."
        );

      }

      /* ======================================
         UPLOAD PHOTO
      ====================================== */

      if (req.file) {

        uploadedPhoto =
          await uploadPhoto(
            req.file
          );

      }

      /* ======================================
         CREATE DOCUMENT
      ====================================== */

      const faculty =
        await FacultyResearch.create({

          category:
            category || "faculty",

          photo:
            uploadedPhoto?.photo || "",

          publicId:
            uploadedPhoto?.publicId || "",

          name:
            name.trim(),

          designation:
            designation.trim(),

          qualification:
            qualification?.trim() || "",

          department:
            department?.trim() || "",

          email:
            email?.trim() || "",

          phone:
            phone?.trim() || "",

          experience:
            experience?.trim() || "",

          researchInterests:
            parseArrayField(
              req.body.researchInterests
            ),

          publications:
            parseArrayField(
              req.body.publications
            ),

          scholarLink:
            scholarLink?.trim() || "",

          orcidLink:
            orcidLink?.trim() || "",

          linkedinLink:
            linkedinLink?.trim() || "",

          featured:
            featured === true ||
            featured === "true",

          isActive:
            isActive === undefined
              ? true
              : isActive === true ||
                isActive === "true",

          displayOrder:
            Number(displayOrder) || 0,

        });

      return successResponse(
        res,
        201,
        "Faculty member created successfully.",
        faculty
      );

    } catch (error) {

      /* ======================================
         CLEANUP FAILED IMAGE
      ====================================== */

      if (
        error &&
        req.file &&
        typeof uploadedPhoto !==
          "undefined" &&
        uploadedPhoto?.publicId
      ) {

        try {

          await deleteFromCloudinary(
            uploadedPhoto.publicId,
            "image"
          );

        } catch {}

      }

      return errorResponse(
        res,
        500,
        "Failed to create faculty member.",
        error.message
      );

    }
  };
/* ==========================================================
   UPDATE FACULTY MEMBER
========================================================== */

export const updateFacultyMember =
  async (req, res) => {
    let uploadedPhoto = null;

    try {

      const { id } = req.params;

      if (!isValidId(id)) {

        return errorResponse(
          res,
          400,
          "Invalid faculty member ID."
        );

      }

      const faculty =
        await FacultyResearch.findById(id);

      if (!faculty) {

        return errorResponse(
          res,
          404,
          "Faculty member not found."
        );

      }

      /* ======================================
         REPLACE PHOTO
      ====================================== */

      if (req.file) {

        if (faculty.publicId) {

          await removePhoto(
            faculty
          );

        }

        uploadedPhoto =
          await uploadPhoto(
            req.file
          );

        faculty.photo =
          uploadedPhoto.photo;

        faculty.publicId =
          uploadedPhoto.publicId;

      }

      /* ======================================
         UPDATE BASIC FIELDS
      ====================================== */

      faculty.category =
        req.body.category ??
        faculty.category;

      faculty.name =
        req.body.name?.trim() ??
        faculty.name;

      faculty.designation =
        req.body.designation?.trim() ??
        faculty.designation;

      faculty.qualification =
        req.body.qualification?.trim() ??
        faculty.qualification;

      faculty.department =
        req.body.department?.trim() ??
        faculty.department;

      faculty.email =
        req.body.email?.trim() ??
        faculty.email;

      faculty.phone =
        req.body.phone?.trim() ??
        faculty.phone;

      faculty.experience =
        req.body.experience?.trim() ??
        faculty.experience;

      faculty.scholarLink =
        req.body.scholarLink?.trim() ??
        faculty.scholarLink;

      faculty.orcidLink =
        req.body.orcidLink?.trim() ??
        faculty.orcidLink;

      faculty.linkedinLink =
        req.body.linkedinLink?.trim() ??
        faculty.linkedinLink;

      /* ======================================
         ARRAY FIELDS
      ====================================== */

      faculty.researchInterests =
        parseArrayField(
          req.body.researchInterests,
          faculty.researchInterests
        );

      faculty.publications =
        parseArrayField(
          req.body.publications,
          faculty.publications
        );

      /* ======================================
         FLAGS
      ====================================== */

      if (
        req.body.featured !==
        undefined
      ) {

        faculty.featured =
          req.body.featured === true ||
          req.body.featured ===
            "true";

      }

      if (
        req.body.isActive !==
        undefined
      ) {

        faculty.isActive =
          req.body.isActive === true ||
          req.body.isActive ===
            "true";

      }

      if (
        req.body.displayOrder !==
        undefined
      ) {

        faculty.displayOrder =
          Number(
            req.body.displayOrder
          ) || 0;

      }

      await faculty.save();

      return successResponse(
        res,
        200,
        "Faculty member updated successfully.",
        faculty
      );

    } catch (error) {

      /* ======================================
         CLEANUP NEW IMAGE IF UPDATE FAILS
      ====================================== */

      if (
        uploadedPhoto?.publicId
      ) {

        try {

          await deleteFromCloudinary(
            uploadedPhoto.publicId,
            "image"
          );

        } catch {}

      }

      return errorResponse(
        res,
        500,
        "Failed to update faculty member.",
        error.message
      );

    }
  };
  /* ==========================================================
   REMOVE FACULTY PHOTO
   (Keeps Faculty Record)
========================================================== */

export const removeFacultyPhoto =
  async (req, res) => {
    try {

      const { id } = req.params;

      if (!isValidId(id)) {

        return errorResponse(
          res,
          400,
          "Invalid faculty member ID."
        );

      }

      const faculty =
        await FacultyResearch.findById(id);

      if (!faculty) {

        return errorResponse(
          res,
          404,
          "Faculty member not found."
        );

      }

      if (!faculty.publicId) {

        return successResponse(
          res,
          200,
          "No uploaded photo found.",
          faculty
        );

      }

      await removePhoto(
        faculty
      );

      faculty.photo = "";
      faculty.publicId = "";

      await faculty.save();

      return successResponse(
        res,
        200,
        "Faculty photo removed successfully.",
        faculty
      );

    } catch (error) {

      return errorResponse(
        res,
        500,
        "Failed to remove faculty photo.",
        error.message
      );

    }
  };

/* ==========================================================
   DELETE FACULTY MEMBER
========================================================== */

export const deleteFacultyMember =
  async (req, res) => {
    try {

      const { id } = req.params;

      if (!isValidId(id)) {

        return errorResponse(
          res,
          400,
          "Invalid faculty member ID."
        );

      }

      const faculty =
        await FacultyResearch.findById(id);

      if (!faculty) {

        return errorResponse(
          res,
          404,
          "Faculty member not found."
        );

      }

      /* ======================================
         DELETE CLOUDINARY PHOTO
      ====================================== */

      if (faculty.publicId) {

        await removePhoto(
          faculty
        );

      }

      /* ======================================
         DELETE DOCUMENT
      ====================================== */

      await FacultyResearch.findByIdAndDelete(
        faculty._id
      );

      return successResponse(
        res,
        200,
        "Faculty member deleted successfully."
      );

    } catch (error) {

      return errorResponse(
        res,
        500,
        "Failed to delete faculty member.",
        error.message
      );

    }
  };