import FacultySubjectAssignment from "../../models/faculty/FacultySubjectAssignment.js";
import Subject from "../../models/admin/Subject.js";
import Faculty from "../../models/faculty/Faculty.js";

/* ==========================================================================
   ASSIGN FACULTY TO SUBJECT
============================================================================= */

export const assignFaculty =
  async (req, res) => {
    try {
      const {
        facultyId,
        subjectId,
      } = req.body;

      /* ======================================
         VALIDATION
      ====================================== */

      if (
        !facultyId ||
        !subjectId
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Faculty and Subject are required.",
        });
      }

      /* ======================================
         CHECK FACULTY
      ====================================== */

      const faculty =
        await Faculty.findById(
          facultyId
        );

      if (!faculty) {
        return res.status(404).json({
          success: false,
          message:
            "Faculty not found.",
        });
      }

      /* ======================================
         CHECK SUBJECT
      ====================================== */

      const subject =
        await Subject.findById(
          subjectId
        );

      if (!subject) {
        return res.status(404).json({
          success: false,
          message:
            "Subject not found.",
        });
      }

      /* ======================================
         PREVENT DUPLICATE ASSIGNMENT
      ====================================== */

      const existingAssignment =
        await FacultySubjectAssignment.findOne(
          {
            facultyId,
            subjectId,
            isActive: true,
          }
        );

      if (
        existingAssignment
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Faculty is already assigned to this subject.",
        });
      }

      /* ======================================
         DEACTIVATE PREVIOUS FACULTY
      ====================================== */

      await FacultySubjectAssignment.updateMany(
        {
          subjectId,
          isActive: true,
        },
        {
          isActive: false,
        }
      );

      /* ======================================
         CREATE NEW ASSIGNMENT
      ====================================== */

      const assignment =
        await FacultySubjectAssignment.create(
          {
            facultyId,
            subjectId,
            assignedBy:
              req.user?.email ||
              req.user?.name ||
              "Admin",
          }
        );

      const populatedAssignment =
        await FacultySubjectAssignment.findById(
          assignment._id
        )
          .populate(
            "facultyId"
          )
          .populate(
            "subjectId"
          );

      res.status(201).json({
        success: true,
        message:
          "Faculty assigned successfully.",
        assignment:
          populatedAssignment,
      });
    } catch (error) {
      console.error(
        "Assign Faculty Error:",
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
   GET ALL ACTIVE ASSIGNMENTS
============================================================================= */


export const getAssignments =
  async (req, res) => {
    try {
      const assignments =
        await FacultySubjectAssignment.find({
          isActive: true,
        })
          .populate("facultyId")
          .populate("subjectId")
          .sort({
            createdAt: -1,
          });

      res.status(200).json({
        success: true,
        count:
          assignments.length,
        assignments,
      });
    } catch (error) {
      console.error(
        "Get Assignments Error:",
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
   GET FACULTY ASSIGNMENTS
============================================================================= */

export const getFacultyAssignments =
  async (req, res) => {
    try {
      const { facultyId } =
        req.params;

      const faculty =
        await Faculty.findById(
          facultyId
        );

      if (!faculty) {
        return res.status(404).json({
          success: false,
          message:
            "Faculty not found.",
        });
      }

      const assignments =
        await FacultySubjectAssignment.find({
          facultyId,
          isActive: true,
        })
          .populate("facultyId")
          .populate("subjectId")
          .sort({
            createdAt: -1,
          });

      res.status(200).json({
        success: true,
        count:
          assignments.length,
        assignments,
      });
    } catch (error) {
      console.error(
        "Get Faculty Assignments Error:",
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
   REASSIGN FACULTY
============================================================================= */

export const reassignFaculty =
  async (req, res) => {
    try {
      const { subjectId } =
        req.params;

      const { facultyId } =
        req.body;

      /* ======================================
         VALIDATION
      ====================================== */

      if (!facultyId) {
        return res.status(400).json({
          success: false,
          message:
            "Faculty is required.",
        });
      }

      /* ======================================
         CHECK FACULTY
      ====================================== */

      const faculty =
        await Faculty.findById(
          facultyId
        );

      if (!faculty) {
        return res.status(404).json({
          success: false,
          message:
            "Faculty not found.",
        });
      }

      /* ======================================
         CHECK SUBJECT
      ====================================== */

      const subject =
        await Subject.findById(
          subjectId
        );

      if (!subject) {
        return res.status(404).json({
          success: false,
          message:
            "Subject not found.",
        });
      }

      /* ======================================
         CHECK EXISTING ASSIGNMENT
      ====================================== */

      const existingAssignment =
        await FacultySubjectAssignment.findOne(
          {
            facultyId,
            subjectId,
            isActive: true,
          }
        );

      if (
        existingAssignment
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Faculty is already assigned to this subject.",
        });
      }

      /* ======================================
         DEACTIVATE CURRENT ASSIGNMENT
      ====================================== */

      await FacultySubjectAssignment.updateMany(
        {
          subjectId,
          isActive: true,
        },
        {
          isActive: false,
        }
      );

      /* ======================================
         CREATE NEW ASSIGNMENT
      ====================================== */

      const assignment =
        await FacultySubjectAssignment.create(
          {
            facultyId,
            subjectId,
            assignedBy:
              req.user?.email ||
              req.user?.name ||
              "Admin",
          }
        );

      const populatedAssignment =
        await FacultySubjectAssignment.findById(
          assignment._id
        )
          .populate(
            "facultyId"
          )
          .populate(
            "subjectId"
          );

      res.status(200).json({
        success: true,
        message:
          "Faculty reassigned successfully.",
        assignment:
          populatedAssignment,
      });
    } catch (error) {
      console.error(
        "Reassign Faculty Error:",
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
   DEACTIVATE ASSIGNMENT
============================================================================= */

export const deactivateAssignment =
  async (req, res) => {
    try {
      const assignment =
        await FacultySubjectAssignment.findById(
          req.params.id
        );

      if (!assignment) {
        return res.status(404).json({
          success: false,
          message:
            "Assignment not found.",
        });
      }

      if (!assignment.isActive) {
        return res.status(400).json({
          success: false,
          message:
            "Assignment is already inactive.",
        });
      }

      assignment.isActive = false;

      await assignment.save();

      res.status(200).json({
        success: true,
        message:
          "Assignment deactivated successfully.",
        assignment,
      });
    } catch (error) {
      console.error(
        "Deactivate Assignment Error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };
