import Student from "../../models/student/Student.js";

/* ==========================================================================
   GET ALL STUDENTS
============================================================================= */

export const getAllStudents =
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
        count:
          students.length,
        students,
      });
    } catch (error) {
      console.error(
        "Get All Students Error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

/* ==========================================================================
   DASHBOARD STATS
============================================================================= */

export const getDashboardStats =
  async (req, res) => {
    try {
      const [
        total,
        active,
        passout,
        suspended,
        bca,
        bba,
        mca,
      ] = await Promise.all([
        Student.countDocuments(),

        Student.countDocuments({
          status: "active",
        }),

        Student.countDocuments({
          status: "passout",
        }),

        Student.countDocuments({
          status: "suspended",
        }),

        Student.countDocuments({
          stream: "BCA",
          status: "active",
        }),

        Student.countDocuments({
          stream: "BBA",
          status: "active",
        }),

        Student.countDocuments({
          stream: "MCA",
          status: "active",
        }),
      ]);

      res.status(200).json({
        success: true,

        stats: {
          total,
          active,
          passout,
          suspended,

          streams: {
            bca,
            bba,
            mca,
          },
        },
      });
    } catch (error) {
      console.error(
        "Dashboard Stats Error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

/* ==========================================================================
   PROMOTE SELECTED STUDENTS
============================================================================= */

export const promoteSelectedStudents =
  async (req, res) => {
    try {
      const { ids } =
        req.body;

      /* ======================================
         VALIDATION
      ====================================== */

      if (
        !Array.isArray(ids) ||
        ids.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please select at least one student.",
        });
      }

      /* ======================================
         FETCH STUDENTS
      ====================================== */

      const students =
        await Student.find({
          _id: {
            $in: ids,
          },
        });

      if (
        students.length === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "No students found.",
        });
      }

      let promoted = 0;
      let passedOut = 0;
      let skipped = 0;

      /* ======================================
         PROMOTION
      ====================================== */

      for (const student of students) {
        if (
          student.status !==
          "active"
        ) {
          skipped++;
          continue;
        }

        let maxSemester = 8;

        if (
          student.stream ===
          "MCA"
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

      /* ======================================
         RESPONSE
      ====================================== */

      res.status(200).json({
        success: true,
        message:
          "Student promotion completed successfully.",

        summary: {
          totalSelected:
            students.length,
          promoted,
          passedOut,
          skipped,
        },
      });
    } catch (error) {
      console.error(
        "Promote Students Error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

/* ==========================================================================
   BULK MOVE TO ALUMNI
============================================================================= */

export const bulkMoveToAlumni =
  async (req, res) => {
    try {
      const { ids } =
        req.body;

      /* ======================================
         VALIDATION
      ====================================== */

      if (
        !Array.isArray(ids) ||
        ids.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please select at least one student.",
        });
      }

      /* ======================================
         UPDATE STUDENTS
      ====================================== */

      const result =
        await Student.updateMany(
          {
            _id: {
              $in: ids,
            },
            status: {
              $ne: "passout",
            },
          },
          {
            $set: {
              status: "passout",
            },
          }
        );

      res.status(200).json({
        success: true,
        message:
          "Selected students moved to alumni successfully.",

        modifiedCount:
          result.modifiedCount,
      });
    } catch (error) {
      console.error(
        "Bulk Alumni Error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

/* ==========================================================================
   BULK DELETE STUDENTS
============================================================================= */

export const bulkDeleteStudents =
  async (req, res) => {
    try {
      const { ids } =
        req.body;

      /* ======================================
         VALIDATION
      ====================================== */

      if (
        !Array.isArray(ids) ||
        ids.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please select at least one student.",
        });
      }

      /* ======================================
         DELETE STUDENTS
      ====================================== */

      const result =
        await Student.deleteMany({
          _id: {
            $in: ids,
          },
        });

      res.status(200).json({
        success: true,
        message:
          "Selected students deleted successfully.",

        deletedCount:
          result.deletedCount,
      });
    } catch (error) {
      console.error(
        "Bulk Delete Students Error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

/* ==========================================================================
   MOVE STUDENT TO ALUMNI
============================================================================= */

export const moveStudentToAlumni =
  async (req, res) => {
    try {
      const student =
        await Student.findById(
          req.params.id
        );

      if (!student) {
        return res.status(404).json({
          success: false,
          message:
            "Student not found.",
        });
      }

      if (
        student.status ===
        "passout"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Student is already in alumni.",
        });
      }

      student.status =
        "passout";

      await student.save();

      res.status(200).json({
        success: true,
        message:
          "Student moved to alumni successfully.",
        student:
          await Student.findById(
            student._id
          ).select("-password"),
      });
    } catch (error) {
      console.error(
        "Move Student To Alumni Error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

/* ==========================================================================
   RESTORE STUDENT
============================================================================= */

export const restoreStudent =
  async (req, res) => {
    try {
      const student =
        await Student.findById(
          req.params.id
        );

      if (!student) {
        return res.status(404).json({
          success: false,
          message:
            "Student not found.",
        });
      }

      if (
        student.status ===
        "active"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Student is already active.",
        });
      }

      student.status =
        "active";

      await student.save();

      res.status(200).json({
        success: true,
        message:
          "Student restored successfully.",
        student:
          await Student.findById(
            student._id
          ).select("-password"),
      });
    } catch (error) {
      console.error(
        "Restore Student Error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

/* ==========================================================================
   GET SINGLE STUDENT
============================================================================= */

export const getStudentById =
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
            "Student not found.",
        });
      }

      res.status(200).json({
        success: true,
        student,
      });
    } catch (error) {
      console.error(
        "Get Student Error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

/* ==========================================================================
   UPDATE STUDENT
============================================================================= */

export const updateStudent =
  async (req, res) => {
    try {
      const student =
        await Student.findById(
          req.params.id
        );

      if (!student) {
        return res.status(404).json({
          success: false,
          message:
            "Student not found.",
        });
      }

      const {
        name,
        email,
        roll,
        reg,
        stream,
        semester,
        phone,
        address,
        status,
        batch,
      } = req.body;

      /* ======================================
         VALIDATE STREAM & SEMESTER
      ====================================== */

      if (
        stream &&
        semester
      ) {
        const semesterNumber =
          Number(semester);

        if (
          stream === "MCA" &&
          (semesterNumber < 1 ||
            semesterNumber > 4)
        ) {
          return res.status(400).json({
            success: false,
            message:
              "MCA has only 4 semesters.",
          });
        }

        if (
          ["BCA", "BBA"].includes(
            stream
          ) &&
          (semesterNumber < 1 ||
            semesterNumber > 8)
        ) {
          return res.status(400).json({
            success: false,
            message:
              `${stream} has only 8 semesters.`,
          });
        }
      }

      /* ======================================
         UPDATE FIELDS
      ====================================== */

      student.name =
        name ??
        student.name;

      student.email =
        email ??
        student.email;

      student.roll =
        roll ??
        student.roll;

      student.reg =
        reg ??
        student.reg;

      student.stream =
        stream ??
        student.stream;

      student.semester =
        semester ??
        student.semester;

      student.phone =
        phone ??
        student.phone;

      student.address =
        address ??
        student.address;

      student.status =
        status ??
        student.status;

      student.batch =
        batch ??
        student.batch;

      await student.save();

      res.status(200).json({
        success: true,
        message:
          "Student updated successfully.",
        student:
          await Student.findById(
            student._id
          ).select("-password"),
      });
    } catch (error) {
      console.error(
        "Update Student Error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

/* ==========================================================================
   DELETE STUDENT
============================================================================= */

export const deleteStudent =
  async (req, res) => {
    try {
      const student =
        await Student.findById(
          req.params.id
        );

      if (!student) {
        return res.status(404).json({
          success: false,
          message:
            "Student not found.",
        });
      }

      await student.deleteOne();

      res.status(200).json({
        success: true,
        message:
          "Student deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete Student Error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };
  

