import mongoose from "mongoose";

import Notice from "../../models/notice/Notice.js";

import {
  uploadPdfToCloudinary,
  deleteFromCloudinary,
} from "../../utils/cloudinaryHelper.js";

import {
  successResponse,
  errorResponse,
} from "../../utils/responseHandler.js";

/* ==========================================================
   HELPER : VALIDATE OBJECT ID
========================================================== */

const isValidObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

/* ==========================================================
   HELPER : FIND NOTICE
========================================================== */

const findNotice = async (id) => {
  return await Notice.findById(id);
};

/* ==========================================================
   HELPER : DELETE PDF
========================================================== */

const deleteNoticePdf = async (
  publicId
) => {
  if (!publicId) return;

  await deleteFromCloudinary(
    publicId,
    "raw"
  );
};

/* ==========================================================
   CREATE NOTICE
========================================================== */

export const createNotice = async (
  req,
  res
) => {
  try {
    const {
      title,
      description,
      category,
      audience,
      noticeDate,
      expiryDate,
      featured,
    } = req.body;

    if (
      !title?.trim() ||
      !description?.trim() ||
      !category?.trim() ||
      !audience?.trim() ||
      !noticeDate
    ) {
      return errorResponse(
        res,
        "Please fill all required fields.",
        400
      );
    }

    let pdfFile = "";
    let publicId = "";

    if (req.file) {
      const upload =
        await uploadPdfToCloudinary(
          req.file,
          "notices"
        );

      pdfFile = upload.secure_url;
      publicId = upload.public_id;
    }

    const notice =
      await Notice.create({
        title: title.trim(),
        description:
          description.trim(),
        category: category.trim(),
        audience: audience.trim(),
        noticeDate,
        expiryDate,
        featured:
          featured === true ||
          featured === "true",
        pdfFile,
        publicId,
      });

    return successResponse(
      res,
      "Notice created successfully.",
      notice,
      201
    );
  } catch (error) {
    return errorResponse(
      res,
      "Failed to create notice."
    );
  }
};

/* ==========================================================
   GET ALL NOTICES
========================================================== */

export const getNotices =
  async (req, res) => {
    try {
      const notices =
        await Notice.find()
          .sort({
            noticeDate: -1,
            createdAt: -1,
          })
          .lean();

      return successResponse(
        res,
        "Notices fetched successfully.",
        {
          count: notices.length,
          notices,
        }
      );
    } catch (error) {
      return errorResponse(
        res,
        "Failed to fetch notices."
      );
    }
  };

/* ==========================================================
   GET NOTICE BY ID
========================================================== */

export const getNoticeById =
  async (req, res) => {
    try {
      const { id } = req.params;

      if (
        !isValidObjectId(id)
      ) {
        return errorResponse(
          res,
          "Invalid notice ID.",
          400
        );
      }

      const notice =
        await Notice.findById(id).lean();

      if (!notice) {
        return errorResponse(
          res,
          "Notice not found.",
          404
        );
      }

      return successResponse(
        res,
        "Notice fetched successfully.",
        notice
      );
    } catch (error) {
      return errorResponse(
        res,
        "Failed to fetch notice."
      );
    }
  };

/* ==========================================================
   UPDATE NOTICE
========================================================== */

export const updateNotice = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return errorResponse(
        res,
        "Invalid notice ID.",
        400
      );
    }

    const notice = await findNotice(id);

    if (!notice) {
      return errorResponse(
        res,
        "Notice not found.",
        404
      );
    }

    let pdfFile = notice.pdfFile;
    let publicId = notice.publicId;

    const oldPublicId = notice.publicId;

    /* ==========================================
       REMOVE EXISTING PDF
    ========================================== */

    if (
      req.body.removeExistingPdf ===
      "true"
    ) {
      pdfFile = "";
      publicId = "";
    }

    /* ==========================================
       UPLOAD NEW PDF
    ========================================== */

    if (req.file) {
      const upload =
        await uploadPdfToCloudinary(
          req.file,
          "notices"
        );

      pdfFile = upload.secure_url;
      publicId = upload.public_id;
    }

    notice.title =
      req.body.title?.trim() ??
      notice.title;

    notice.description =
      req.body.description?.trim() ??
      notice.description;

    notice.category =
      req.body.category?.trim() ??
      notice.category;

    notice.audience =
      req.body.audience?.trim() ??
      notice.audience;

    notice.noticeDate =
      req.body.noticeDate ??
      notice.noticeDate;

    notice.expiryDate =
      req.body.expiryDate ??
      notice.expiryDate;

    if (
      req.body.featured !== undefined
    ) {
      notice.featured =
        req.body.featured === true ||
        req.body.featured ===
          "true";
    }

    notice.pdfFile = pdfFile;
    notice.publicId = publicId;

    const updatedNotice =
      await notice.save();

    /* ==========================================
       DELETE OLD PDF AFTER SUCCESS
    ========================================== */

    if (
      req.file &&
      oldPublicId &&
      oldPublicId !== publicId
    ) {
      await deleteNoticePdf(
        oldPublicId
      );
    }

    if (
      req.body.removeExistingPdf ===
        "true" &&
      oldPublicId
    ) {
      await deleteNoticePdf(
        oldPublicId
      );
    }

    return successResponse(
      res,
      "Notice updated successfully.",
      updatedNotice
    );
  } catch (error) {
    return errorResponse(
      res,
      "Failed to update notice."
    );
  }
};

/* ==========================================================
   DELETE NOTICE
========================================================== */

export const deleteNotice = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return errorResponse(
        res,
        "Invalid notice ID.",
        400
      );
    }

    const notice =
      await findNotice(id);

    if (!notice) {
      return errorResponse(
        res,
        "Notice not found.",
        404
      );
    }

    if (notice.publicId) {
      await deleteNoticePdf(
        notice.publicId
      );
    }

    await notice.deleteOne();

    return successResponse(
      res,
      "Notice deleted successfully."
    );
  } catch (error) {
    return errorResponse(
      res,
      "Failed to delete notice."
    );
  }
};

/* ==========================================================
   GET FEATURED NOTICES
   (returns ALL notices marked featured, not just one —
   the frontend renders these as a slider)
========================================================== */

export const getFeaturedNotice =
  async (req, res) => {
    try {
      const notices =
        await Notice.find({
          featured: true,
        })
          .sort({
            noticeDate: -1,
            createdAt: -1,
          })
          .lean();

      return successResponse(
        res,
        "Featured notices fetched successfully.",
        {
          count: notices.length,
          notices,
        }
      );
    } catch (error) {
      return errorResponse(
        res,
        "Failed to fetch featured notices."
      );
    }
  };

/* ==========================================================
   GET STUDENT NOTICES
========================================================== */

export const getStudentNotices =
  async (req, res) => {
    try {
      const notices =
        await Notice.find({
          audience: "student",
        })
          .sort({
            noticeDate: -1,
            createdAt: -1,
          })
          .lean();

      return successResponse(
        res,
        "Student notices fetched successfully.",
        {
          count: notices.length,
          notices,
        }
      );
    } catch (error) {
      return errorResponse(
        res,
        "Failed to fetch student notices."
      );
    }
  };

/* ==========================================================
   GET FACULTY NOTICES
========================================================== */

export const getFacultyNotices =
  async (req, res) => {
    try {
      const notices =
        await Notice.find({
          audience: "faculty",
        })
          .sort({
            noticeDate: -1,
            createdAt: -1,
          })
          .lean();

      return successResponse(
        res,
        "Faculty notices fetched successfully.",
        {
          count: notices.length,
          notices,
        }
      );
    } catch (error) {
      return errorResponse(
        res,
        "Failed to fetch faculty notices."
      );
    }
  };