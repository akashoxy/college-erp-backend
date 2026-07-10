import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

import Student from "../../models/student/Student.js";

import {
  successResponse,
  errorResponse,
} from "../../utils/responseHandler.js";

/* ==========================================================================
   OTP STORE
============================================================================= */

const otpStore =
  new Map();

/* ==========================================================================
   EMAIL REGEX
============================================================================= */

const EMAIL_REGEX =
  /^\S+@\S+\.\S+$/;

  /* ==========================================================================
   CONSTANTS
============================================================================= */

const OTP_EXPIRY_TIME =
  10 * 60 * 1000;

const SALT_ROUNDS = 10;

/* ==========================================================================
   VALIDATE SEMESTER
============================================================================= */

const validateSemester = (
  stream,
  semester
) => {

  const semesterNumber =
    Number(semester);

  if (
    Number.isNaN(
      semesterNumber
    )
  ) {

    return "Semester must be a valid number.";

  }

  switch (
    stream?.toUpperCase()
  ) {

    case "MCA":

      if (
        semesterNumber < 1 ||
        semesterNumber > 4
      ) {

        return "MCA has only 4 semesters.";

      }

      break;

    case "BCA":

    case "BBA":

      if (
        semesterNumber < 1 ||
        semesterNumber > 8
      ) {

        return `${stream.toUpperCase()} has only 8 semesters.`;

      }

      break;

    default:

      return "Invalid stream.";

  }

  return null;

};

/* ==========================================================================
   GENERATE BATCH
============================================================================= */

const generateBatch =
  (stream) => {

    const year =
      new Date().getFullYear();

    return stream?.toUpperCase() ===
      "MCA"

      ? `${year} - ${year + 2}`

      : `${year} - ${year + 4}`;

  };

/* ==========================================================================
   GENERATE OTP
============================================================================= */

const generateOtp =
  () =>

    Math.floor(

      100000 +

      Math.random() * 900000

    ).toString();

/* ==========================================================================
   SAVE OTP
============================================================================= */

const saveOtp = (
  email,
  otp
) => {

  otpStore.set(

    email.trim().toLowerCase(),

    {

      otp,

      createdAt:
        Date.now(),

    }

  );

};

/* ==========================================================================
   VERIFY OTP
============================================================================= */

const verifyOtp = (
  email,
  otp
) => {

  const record =
    otpStore.get(

      email.trim().toLowerCase()

    );

  if (!record) {

    return false;

  }

const expiresIn =
  OTP_EXPIRY_TIME;

  if (

    Date.now() -

      record.createdAt >

    expiresIn

  ) {

    otpStore.delete(

      email
        .trim()
        .toLowerCase()

    );

    return false;

  }

  return (
    record.otp === otp
  );

};

/* ==========================================================================
   REMOVE OTP
============================================================================= */

const removeOtp =
  (email) => {

    otpStore.delete(

      email
        .trim()
        .toLowerCase()

    );

  };

/* ==========================================================================
   MAIL TRANSPORTER
============================================================================= */

const transporter =
  nodemailer.createTransport({

    service: "gmail",

    auth: {

      user:
        process.env.EMAIL_USER,

      pass:
        process.env.EMAIL_PASS,

    },

  });
  /* ==========================================================================
   REGISTER STUDENT
============================================================================= */

export const registerStudent =
  async (
    req,
    res
  ) => {

    try {

      const {

        name,
        email,
        password,
        reg,
        roll,
        stream,
        semester,

      } = req.body;

      /* =====================================================
         VALIDATION
      ====================================================== */

      if (

        !name ||

        !email ||

        !password ||

        !stream ||

        !semester

      ) {

        return errorResponse(

          res,

          "Name, email, password, stream and semester are required.",

          400

        );

      }

      if (

        !EMAIL_REGEX.test(
          email
        )

      ) {

        return errorResponse(

          res,

          "Invalid email format.",

          400

        );

      }

      if (

        password.length < 6

      ) {

        return errorResponse(

          res,

          "Password must be at least 6 characters long.",

          400

        );

      }

      const semesterError =
        validateSemester(

          stream,

          semester

        );

      if (

        semesterError

      ) {

        return errorResponse(

          res,

          semesterError,

          400

        );

      }

      /* =====================================================
         DUPLICATE CHECK
      ====================================================== */

      const [

        existingEmail,

        existingRoll,

        existingReg,

      ] = await Promise.all([

        Student.findOne({

          email:
            email
              .trim()
              .toLowerCase(),

        }),

        roll

          ? Student.findOne({

              roll,

            })

          : null,

        reg

          ? Student.findOne({

              reg,

            })

          : null,

      ]);

      if (

        existingEmail

      ) {

        return errorResponse(

          res,

          "Student already exists with this email.",

          400

        );

      }

      if (

        existingRoll

      ) {

        return errorResponse(

          res,

          "Roll number already exists.",

          400

        );

      }

      if (

        existingReg

      ) {

        return errorResponse(

          res,

          "Registration number already exists.",

          400

        );

      }

      /* =====================================================
         CREATE STUDENT
      ====================================================== */

      const student =
        await Student.create({

          name:
            name.trim(),

          email:
            email
              .trim()
              .toLowerCase(),

          password,

          role:
            "student",

          reg:
            reg?.trim() ||
            "",

          roll:
            roll?.trim() ||
            "",

          stream:
            stream
              .trim()
              .toUpperCase(),

          semester:
            Number(
              semester
            ),

          batch:
            generateBatch(
              stream
            ),

        });

      /* =====================================================
         REMOVE PASSWORD
      ====================================================== */

      const studentData =
        student.toObject();

      delete studentData.password;

      return successResponse(

        res,

        "Student registered successfully.",

        studentData,

        201

      );

    } catch (error) {

      console.error(

        "REGISTER STUDENT ERROR:",

        error

      );

      return errorResponse(

        res,

        "Registration failed.",

        500,

        error.message

      );

    }

  };
  /* ==========================================================================
   FORGOT PASSWORD
============================================================================= */

export const forgotPassword =
  async (
    req,
    res
  ) => {

    try {

      const {

        email,

      } = req.body;

      /* =====================================================
         VALIDATION
      ====================================================== */

      if (!email) {

        return errorResponse(

          res,

          "Email is required.",

          400

        );

      }

      const normalizedEmail =
        email
          .trim()
          .toLowerCase();

      if (

        !EMAIL_REGEX.test(
          normalizedEmail
        )

      ) {

        return errorResponse(

          res,

          "Invalid email format.",

          400

        );

      }

      /* =====================================================
         FIND STUDENT
      ====================================================== */

      const student =
        await Student.findOne({

          email:
            normalizedEmail,

        });

      if (!student) {

        return errorResponse(

          res,

          "Student not found.",

          404

        );

      }

      /* =====================================================
         GENERATE OTP
      ====================================================== */

      const otp =
        generateOtp();

      saveOtp(

        normalizedEmail,

        otp

      );

      /* =====================================================
         SEND EMAIL
      ====================================================== */

      await transporter.sendMail({

        from:
          process.env.EMAIL_USER,

        to:
          normalizedEmail,

        subject:
          "Password Reset OTP",

        html: `

          <div style="font-family:Arial,sans-serif;padding:20px;">

            <h2>Password Reset Request</h2>

            <p>

              Hello
              <strong>${student.name}</strong>,

            </p>

            <p>

              Use the following OTP to reset your password.

            </p>

            <h1
              style="
                letter-spacing:6px;
                color:#2563eb;
              "
            >

              ${otp}

            </h1>

            <p>

              This OTP is valid for
              <strong>10 minutes</strong>.

            </p>

            <p>

              If you didn't request this,
              please ignore this email.

            </p>

          </div>

        `,

      });

      return successResponse(

        res,

        "OTP sent successfully."

      );

    } catch (error) {

      console.error(

        "FORGOT PASSWORD ERROR:",

        error

      );

      return errorResponse(

        res,

        "Failed to send OTP.",

        500,

        error.message

      );

    }

  };
  /* ==========================================================================
   RESET PASSWORD
============================================================================= */

export const resetPassword =
  async (
    req,
    res
  ) => {

    try {

      const {

        email,
        otp,
        newPassword,

      } = req.body;

      /* =====================================================
         VALIDATION
      ====================================================== */

      if (

        !email ||

        !otp ||

        !newPassword

      ) {

        return errorResponse(

          res,

          "Email, OTP and new password are required.",

          400

        );

      }

      const normalizedEmail =
        email
          .trim()
          .toLowerCase();

      if (

        !EMAIL_REGEX.test(
          normalizedEmail
        )

      ) {

        return errorResponse(

          res,

          "Invalid email format.",

          400

        );

      }

      if (

        newPassword.length < 6

      ) {

        return errorResponse(

          res,

          "Password must be at least 6 characters long.",

          400

        );

      }

      /* =====================================================
         VERIFY OTP
      ====================================================== */

      const isOtpValid =
        verifyOtp(

          normalizedEmail,

          otp

        );

      if (!isOtpValid) {

        return errorResponse(

          res,

          "Invalid or expired OTP.",

          400

        );

      }

      /* =====================================================
         FIND STUDENT
      ====================================================== */

      const student =
        await Student.findOne({

          email:
            normalizedEmail,

        });

      if (!student) {

        removeOtp(
          normalizedEmail
        );

        return errorResponse(

          res,

          "Student not found.",

          404

        );

      }

      /* =====================================================
         PREVENT SAME PASSWORD
      ====================================================== */

      const isSamePassword =
        await bcrypt.compare(

          newPassword,

          student.password

        );

      if (

  isSamePassword

) {

  removeOtp(
    normalizedEmail
  );

  return errorResponse(

    res,

    "New password must be different from the current password.",

    400

  );

}

      /* =====================================================
         UPDATE PASSWORD
      ====================================================== */

      student.password =
        await bcrypt.hash(
  newPassword,
  SALT_ROUNDS
);

      await student.save();

      /* =====================================================
         REMOVE OTP
      ====================================================== */

      removeOtp(
        normalizedEmail
      );

      /* =====================================================
         SUCCESS
      ====================================================== */

      return successResponse(

        res,

        "Password reset successfully."

      );

    } catch (error) {

      console.error(

        "RESET PASSWORD ERROR:",

        error

      );

      return errorResponse(

        res,

        "Password reset failed.",

        500,

        error.message

      );

    }

  };
  /* ==========================================================================
   LOGIN STUDENT
============================================================================= */

export const loginStudent = async (
  req,
  res
) => {

  try {

    const {

      email,
      password,

    } = req.body;

    /* =====================================================
       VALIDATION
    ====================================================== */

    if (

      !email ||

      !password

    ) {

      return errorResponse(

        res,

        "Email and password are required.",

        400

      );

    }

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    if (

      !EMAIL_REGEX.test(
        normalizedEmail
      )

    ) {

      return errorResponse(

        res,

        "Invalid email format.",

        400

      );

    }

    /* =====================================================
       FIND STUDENT
    ====================================================== */

    const student =
      await Student.findOne({

        email:
          normalizedEmail,

      });

    if (!student) {

      return errorResponse(

        res,

        "Invalid email or password.",

        401

      );

    }

    /* =====================================================
       ACCOUNT STATUS
    ====================================================== */

    if (

      student.status ===
      "suspended"

    ) {

      return errorResponse(

        res,

        "Your account has been suspended. Please contact the administrator.",

        403

      );

    }

    if (

      student.status ===
      "passout"

    ) {

      return errorResponse(

        res,

        "Your student account is no longer active.",

        403

      );

    }

    /* =====================================================
       VERIFY PASSWORD
    ====================================================== */

    const isPasswordValid =
      await bcrypt.compare(

        password,

        student.password

      );

    if (!isPasswordValid) {

      return errorResponse(

        res,

        "Invalid email or password.",

        401

      );

    }

    /* =====================================================
       GENERATE TOKEN
    ====================================================== */

    const token =
      jwt.sign(

        {

          id:
            student._id,

          role:
            student.role,

        },

        process.env.JWT_SECRET,

        {

          expiresIn:
            "7d",

        }

      );

    /* =====================================================
       REMOVE PASSWORD
    ====================================================== */

    const studentData =
      student.toObject();

    delete studentData.password;

    /* =====================================================
       SUCCESS
    ====================================================== */

    return successResponse(

      res,

      "Login successful.",

      {

        token,

        student:
          studentData,

      }

    );

  } catch (error) {

    console.error(

      "LOGIN STUDENT ERROR:",

      error

    );

    return errorResponse(

      res,

      "Login failed.",

      500,

      error.message

    );

  }

};
/* ==========================================================================
   GET STUDENT PROFILE
============================================================================= */

export const getStudentProfile = async (
  req,
  res
) => {

  try {

    /* =====================================================
       VALIDATION
    ====================================================== */

    if (

      !req.user?.id

    ) {

      return errorResponse(

        res,

        "Unauthorized access.",

        401

      );

    }

    /* =====================================================
       FIND STUDENT
    ====================================================== */

    const student =
      await Student.findById(

        req.user.id

      ).select(

        "-password"

      );

    if (!student) {

      return errorResponse(

        res,

        "Student not found.",

        404

      );

    }

    /* =====================================================
       ACCOUNT STATUS
    ====================================================== */

    if (

      student.status ===
      "suspended"

    ) {

      return errorResponse(

        res,

        "Your account has been suspended.",

        403

      );

    }

    if (

  student.status ===
  "passout"

) {

  return errorResponse(

    res,

    "Your student account is no longer active.",

    403

  );

}

    /* =====================================================
       SUCCESS
    ====================================================== */

    return successResponse(
  res,
  "Student profile fetched successfully.",
  {
    student,
  }
);

  } catch (error) {

    console.error(

      "GET STUDENT PROFILE ERROR:",

      error

    );

    return errorResponse(

      res,

      "Failed to fetch student profile.",

      500,

      error.message

    );

  }

};
/* ==========================================================================
   UPDATE STUDENT PROFILE
============================================================================= */

export const updateStudentProfile =
  async (
    req,
    res
  ) => {

    try {

      /* =====================================================
         AUTH VALIDATION
      ====================================================== */

      if (

        !req.user?.id

      ) {

        return errorResponse(

          res,

          "Unauthorized access.",

          401

        );

      }

      /* =====================================================
         FIND STUDENT
      ====================================================== */

      const student =
        await Student.findById(
          req.user.id
        );

      if (!student) {

        return errorResponse(

          res,

          "Student not found.",

          404

        );

      }

      /* =====================================================
         ACCOUNT STATUS
      ====================================================== */

      if (

        student.status ===
        "suspended"

      ) {

        return errorResponse(

          res,

          "Your account has been suspended.",

          403

        );

      }

      if (

  student.status ===
  "passout"

) {

  return errorResponse(

    res,

    "Your student account is no longer active.",

    403

  );

}

      /* =====================================================
         ALLOWED FIELDS
      ====================================================== */

      const allowedFields = [

        "name",

        "phone",

        "address",

        "avatar",

      ];

      allowedFields.forEach(
        (field) => {

          if (

            req.body[field] !==
            undefined

          ) {

            student[field] =

              typeof req.body[
                field
              ] === "string"

                ? req.body[
                    field
                  ].trim()

                : req.body[
                    field
                  ];

          }

        }
      );

      /* =====================================================
         SAVE
      ====================================================== */

      await student.save();

      const studentData =
        student.toObject();

      delete studentData.password;

      /* =====================================================
         SUCCESS
      ====================================================== */

      return successResponse(
  res,
  "Profile updated successfully.",
  {
    student: studentData,
  }
);

    } catch (error) {

      console.error(

        "UPDATE STUDENT PROFILE ERROR:",

        error

      );

      return errorResponse(

        res,

        "Failed to update profile.",

        500,

        error.message

      );

    }

  };
