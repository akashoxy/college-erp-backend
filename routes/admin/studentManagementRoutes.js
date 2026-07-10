import express from "express";
import Student from "../../models/student/Student.js";

import authMiddleware from "../../middleware/auth/authMiddleware.js";

import {
  adminOnly,
} from "../../middleware/auth/roleMiddleware.js";

const router = express.Router();


// =====================================================
// GET ALL STUDENTS
// =====================================================

router.get(
  "/",
  authMiddleware,
  adminOnly,

  async (req, res) => {
    try {

      const students =
        await Student.find()
          .select("-password")
          .sort({
            createdAt: -1,
          });

      res.status(200).json({
        success: true,
        count: students.length,
        students,
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        success: false,
        message:
          "Failed to fetch students",
      });

    }
  }
);


// =====================================================
// DASHBOARD STATS
// =====================================================

router.get(
  "/stats/dashboard",
  authMiddleware,
  adminOnly,

  async (req, res) => {

    try {

      const total =
        await Student.countDocuments();

      const active =
        await Student.countDocuments({
          status: "active",
        });

      const passout =
        await Student.countDocuments({
          status: "passout",
        });

     const bca =
  await Student.countDocuments({
    stream: "BCA",
    status: "active",
  });

const bba =
  await Student.countDocuments({
    stream: "BBA",
    status: "active",
  });

const mca =
  await Student.countDocuments({
    stream: "MCA",
    status: "active",
  });

      res.status(200).json({
        success: true,
        total,
        active,
        passout,
        bca,
        bba,
        mca,
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        success: false,
      });

    }

  }
);



// =====================================================
// PROMOTE SELECTED STUDENTS
// =====================================================

router.put(
  "/promote-selected",
  authMiddleware,
  adminOnly,

  async (req, res) => {

    try {

      const { ids } = req.body;

      if (
        !ids ||
        ids.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please select at least one student",
        });
      }

      const students =
        await Student.find({
          _id: {
            $in: ids,
          },
        });

      let promoted = 0;
      let passedOut = 0;

      for (const student of students) {

        let maxSemester = 8;

        if (
          student.stream === "MCA"
        ) {
          maxSemester = 4;
        }

        if (
          student.semester <
          maxSemester
        ) {

          student.semester += 1;
          promoted++;

        } else {

          student.status =
            "passout";
          passedOut++;

        }

        await student.save();

      }

      res.status(200).json({
        success: true,
        promoted,
        passedOut,
        message:
          `${promoted} students promoted, ${passedOut} students moved to passout`,
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        success: false,
        message:
          error.message,
      });

    }

  }
);

// =====================================================
// BULK ALUMNI
// =====================================================

router.put(
  "/bulk/alumni",
  authMiddleware,
  adminOnly,

  async (req, res) => {

    try {

      const { ids } =
        req.body;

      await Student.updateMany(
        {
          _id: {
            $in: ids,
          },
        },
        {
          status: "passout",
        }
      );

      res.status(200).json({
        success: true,
        message:
          "Students moved to alumni",
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        success: false,
      });

    }

  }
);


// =====================================================
// BULK DELETE
// =====================================================

router.delete(
  "/bulk/delete",
  authMiddleware,
  adminOnly,

  async (req, res) => {

    try {

      const { ids } =
        req.body;

      await Student.deleteMany({
        _id: {
          $in: ids,
        },
      });

      res.status(200).json({
        success: true,
        message:
          "Students deleted",
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        success: false,
      });

    }

  }
);


// =====================================================
// MOVE TO ALUMNI
// =====================================================

router.put(
  "/alumni/:id",
  authMiddleware,
  adminOnly,

  async (req, res) => {

    try {

      const student =
        await Student.findByIdAndUpdate(

          req.params.id,

          {
            status:
              "passout",
          },

          {
            new: true,
          }

        ).select("-password");

      res.status(200).json({
        success: true,
        student,
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        success: false,
      });

    }

  }
);


// =====================================================
// RESTORE STUDENT
// =====================================================

router.put(
  "/restore/:id",
  authMiddleware,
  adminOnly,

  async (req, res) => {

    try {

      const student =
        await Student.findByIdAndUpdate(

          req.params.id,

          {
            status:
              "active",
          },

          {
            new: true,
          }

        ).select("-password");

      res.status(200).json({
        success: true,
        student,
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        success: false,
      });

    }

  }
);


// =====================================================
// GET SINGLE STUDENT
// =====================================================

router.get(
  "/:id",
  authMiddleware,
  adminOnly,

  async (req, res) => {

    try {

      const student =
        await Student.findById(
          req.params.id
        ).select("-password");

      if (!student) {

        return res.status(404).json({
          success: false,
          message:
            "Student not found",
        });

      }

      res.status(200).json({
        success: true,
        student,
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        success: false,
      });

    }

  }
);


// =====================================================
// UPDATE STUDENT
// =====================================================

router.put(
  "/:id",
  authMiddleware,
  adminOnly,

  async (req, res) => {

    try {

      const student =
        await Student.findByIdAndUpdate(

          req.params.id,

          req.body,

          {
            new: true,
            runValidators: true,
          }

        ).select("-password");

      if (!student) {

        return res.status(404).json({
          success: false,
          message:
            "Student not found",
        });

      }

      res.status(200).json({
        success: true,
        student,
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        success: false,
      });

    }

  }
);


// =====================================================
// DELETE STUDENT
// =====================================================

router.delete(
  "/:id",
  authMiddleware,
  adminOnly,

  async (req, res) => {

    try {

      const student =
        await Student.findByIdAndDelete(
          req.params.id
        );

      if (!student) {

        return res.status(404).json({
          success: false,
          message:
            "Student not found",
        });

      }

      res.status(200).json({
        success: true,
        message:
          "Student deleted",
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        success: false,
      });

    }

  }
);

export default router;