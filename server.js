import "./config/env.js"
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

// ============================================
// CMS ROUTES
// ============================================

// home-page 
import homepageRoutes from "./routes/home-page/homepageRoutes.js";
import aboutUsRoutes from "./routes/home-page/aboutUsRoutes.js";
import visionMissionRoutes from "./routes/home-page/visionMissionRoutes.js";
import approvalRoutes from "./routes/home-page/approvalRoutes.js";
import awardRoutes from "./routes/home-page/awardRoutes.js";


// academics
import bbaRoutes from "./routes/academics/bbaRoutes.js";
import bcaRoutes from "./routes/academics/bcaRoutes.js";
import mcaRoutes from "./routes/academics/mcaRoutes.js";
import calendarRoutes from "./routes/academics/calendarRoutes.js";
import holidayRoutes from "./routes/academics/holidayRoutes.js";
import facultyResearchRoutes from "./routes/academics/facultyResearchRoutes.js";

// admin 
import assignmentRoutes from "./routes/admin/assignmentRoutes.js";
import visitorRoutes from "./routes/admin/visitorRoutes.js";
import googleReviewRoutes from "./routes/admin/googleReviewRoutes.js";
import studentManagementRoutes from "./routes/admin/studentManagementRoutes.js";

// campus-tour 
import videogalleryRoutes from "./routes/campus-tour/videogalleryRoutes.js";
import recruiterRoutes from "./routes/campus-tour/recruiterRoutes.js";
import placedStudentRoutes from "./routes/campus-tour/placedStudentRoutes.js";
import photoGalleryRoutes from "./routes/campus-tour/photoGalleryRoutes.js";

// contact 
import contactRoutes from "./routes/contact/contactRoutes.js";

// facilities 
import cetRoutes from "./routes/facilities/cetRoutes.js";
import jecaRoutes from "./routes/facilities/jecaRoutes.js";
import radioRoutes from "./routes/facilities/radioRoutes.js";
import libraryRoutes from "./routes/facilities/libraryRoutes.js";
import webmagazineRoutes from "./routes/facilities/webmagazineRoutes.js";
import computerlabRoutes from "./routes/facilities/computerlabRoutes.js";
import antiRaggingRoutes from "./routes/facilities/antiRaggingRoutes.js";
import journalRoutes from "./routes/facilities/journalRoutes.js";
import commonRoomRoutes from "./routes/facilities/commonRoomRoutes.js"

// faculty 
import facultyNoteRoutes from "./routes/faculty/facultyNoteRoutes.js";
import attendanceRoutes from "./routes/faculty/attendanceRoutes.js";
import subjectRoutes from "./routes/faculty/subjectRoutes.js";

// life-at-tih 
import sparkRoutes from "./routes/life-at-tih/sparkRoutes.js"
import verbenaRoutes from "./routes/life-at-tih/verbenaRoutes.js";
import annualSportsMeetRoutes from "./routes/life-at-tih/annualSportsMeetRoutes.js";
import academicWorkRoutes from "./routes/life-at-tih/academicWorkRoutes.js";

// notice 
import noticeRoutes from "./routes/notice/noticeRoutes.js";

// student 
import paymentRoutes from "./routes/student/paymentRoutes.js";
import previousQuestionRoutes from "./routes/student/previousQuestionRoutes.js";
import syllabusRoutes from "./routes/student/syllabusRoutes.js";

// admission 
import programRoutes from "./routes/admission/programRoutes.js";
import admissionRoutes from "./routes/admission/admissionRoutes.js";
import admissionProcedureRoutes from "./routes/admission/admissionProcedureRoutes.js";
import feeStructureRoutes from "./routes/admission/feeStructureRoutes.js";

// ============================================
// AUTH ROUTES
// ============================================

import facultyAuthRoutes from "./routes/faculty/facultyAuthRoutes.js";
import studentAuthRoutes from "./routes/student/studentAuthRoutes.js";
import adminAuthRoutes from "./routes/admin/adminAuthRoutes.js";
import authRoutes from "./routes/auth/authRoutes.js";


const app = express();

// ============================================
// MIDDLEWARE
// ============================================


const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow Postman, Thunder Client, server-to-server requests
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("Blocked Origin:", origin);

      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use("/api/auth", authRoutes);


// ============================================
// AUTH ROUTES
// ============================================

// FACULTY
app.use(
  "/api/faculty",
  facultyAuthRoutes
);

// STUDENT
app.use(
  "/api/student",
  studentAuthRoutes
);

// ADMIN
app.use(
  "/api/admin",
  adminAuthRoutes
);

// ============================================
// CMS ROUTES
// ============================================

app.use(
  "/api/homepage",
  homepageRoutes
);

app.use(
  "/api/programs",
  programRoutes
);

app.use(
  "/api/google-reviews",
  googleReviewRoutes
);

app.use(
  "/api/bba",
  bbaRoutes
);

app.use(
  "/api/bca",
  bcaRoutes
);

app.use(
  "/api/mca",
  mcaRoutes
);

app.use(
  "/api/cet",
  cetRoutes
);

app.use(
  "/api/jeca",
  jecaRoutes
);

app.use(
  "/api/radio-tih",
  radioRoutes
);

app.use(
  "/api/payments",
  paymentRoutes
);

app.use("/api/admissions", admissionRoutes);

app.use(
  "/api/admission-procedure",
  admissionProcedureRoutes
);

app.use(
  "/api/library",
  libraryRoutes
);

app.use(
  "/api/computer-laboratory",
  computerlabRoutes
);

app.use(
  "/api/web-magazine",
  webmagazineRoutes
);

app.use(
  "/api/videogallery",
  videogalleryRoutes
);

app.use("/api/about-us", aboutUsRoutes);

app.use("/api/anti-ragging", antiRaggingRoutes);

app.use("/api/vision-mission", visionMissionRoutes);

app.use("/api/contact", contactRoutes);

app.use("/api/notices", noticeRoutes);

app.use(
  "/api/previous-papers",
  previousQuestionRoutes
);

app.use(
  "/api/faculty-notes",
  facultyNoteRoutes
);

app.use("/api/recruiters", recruiterRoutes);
app.use("/api/placed-students", placedStudentRoutes);

app.use("/api/calendar", calendarRoutes);

app.use("/api/holidays", holidayRoutes);

app.use("/api/spark", sparkRoutes);

app.use("/api/verbena", verbenaRoutes);

app.use("/api/approvals", approvalRoutes);

app.use(
  "/api/admin/students",
  studentManagementRoutes
);

app.use(
  "/api/subjects",
  subjectRoutes
);

app.use(
  "/api/attendance",
  attendanceRoutes
);

app.use(
  "/api/assignments",
  assignmentRoutes
);

app.use("/api/journal", journalRoutes);

app.use("/api/common-room", commonRoomRoutes);

app.use(
  "/api/syllabus",
  syllabusRoutes
);

app.use(
  "/api/fee-structure",
  feeStructureRoutes
);

app.use(
  "/api/photo-gallery",
  photoGalleryRoutes
);

app.use(
  "/api/faculty-research",
  facultyResearchRoutes
);

app.use("/api/awards", awardRoutes);


app.use(
  "/api/annual-sports-meet",
  annualSportsMeetRoutes
);

app.use(
  "/api/academic-works",
  academicWorkRoutes
);

app.use(
  "/api/visitors",
  visitorRoutes
);

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is healthy",
  });
});


// ============================================
// TEST ROUTE
// ============================================

app.get(
  "/",

  (req, res) => {
    res.send(
      "Backend Running ✅"
    );
  }
);

// ============================================
// DATABASE CONNECTION
// ============================================

mongoose
  .connect(
    process.env.MONGO_URI
  )

  .then(() => {
    console.log(
      "MongoDB Connected ✅"
    );

    app.listen(
      process.env.PORT || 5000,

      () => {
        console.log(
          `Server running on ${
            process.env.PORT || 5000
          }`
        );
      }
    );
  })

  .catch((err) => {
    console.log(
      "MongoDB Error:",
      err
    );
  });

 app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

  app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});