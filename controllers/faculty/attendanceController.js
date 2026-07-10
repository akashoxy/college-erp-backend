import Attendance from "../../models/faculty/Attendance.js";
import Student from "../../models/student/Student.js";
import FacultySubjectAssignment from "../../models/faculty/FacultySubjectAssignment.js";

import {
  successResponse,
  errorResponse,
} from "../../utils/responseHandler.js";

/* ==========================================================================
   GET FACULTY SUBJECTS
============================================================================= */

export const getFacultySubjects =
  async (req, res) => {
    try {
      const subjects =
        await FacultySubjectAssignment.find({
          facultyId: req.user.id,
          isActive: true,
        })
          .populate("subjectId")
          .sort({
            assignedDate: -1,
          })
          .lean();

      return successResponse(
        res,
        200,
        "Faculty subjects fetched successfully.",
        {
          count:
            subjects.length,
          subjects,
        }
      );
    } catch (error) {
      console.error(
        "Get Faculty Subjects Error:",
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
   LOAD STUDENTS
============================================================================= */

export const loadStudents =
  async (req, res) => {
    try {
      const {
        stream,
        semester,
      } = req.query;

      const semesterNumber =
        Number(
          semester
            ?.toString()
            .replace(
              "Semester ",
              ""
            )
        );

      /* ======================================
         VALIDATION
      ====================================== */

      if (!stream || !semester) {
        return errorResponse(
          res,
          400,
          "Stream and semester are required."
        );
      }

      if (
        stream === "MCA" &&
        (semesterNumber < 1 ||
          semesterNumber > 4)
      ) {
        return errorResponse(
          res,
          400,
          "MCA has only 4 semesters."
        );
      }

      if (
        ["BCA", "BBA"].includes(
          stream
        ) &&
        (semesterNumber < 1 ||
          semesterNumber > 8)
      ) {
        return errorResponse(
          res,
          400,
          `${stream} has only 8 semesters.`
        );
      }

      const students =
        await Student.find({
          stream,
          semester:
            semesterNumber,
          status: "active",
        })
          .select(
            "name roll reg stream semester batch"
          )
          .sort({
            roll: 1,
          })
          .lean();

      return successResponse(
        res,
        200,
        "Students loaded successfully.",
        {
          count:
            students.length,
          students,
        }
      );
    } catch (error) {
      console.error(
        "Load Students Error:",
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
   SAVE ATTENDANCE
============================================================================= */

export const saveAttendance =
  async (req, res) => {
    try {
      const {
        date,
        subjectId,
        stream,
        semester,
        session,
        attendance,
      } = req.body;

      if (
        !date ||
        !subjectId ||
        !stream ||
        !semester ||
        !session ||
        !Array.isArray(
          attendance
        )
      ) {
        return errorResponse(
          res,
          400,
          "All attendance details are required."
        );
      }

      const existing =
        await Attendance.findOne({
          date,
          subjectId,
          facultyId:
            req.user.id,
        });

      if (existing) {
        existing.stream =
          stream;

        existing.semester =
          semester;

        existing.session =
          session;

        existing.attendance =
          attendance;

        await existing.save();

        return successResponse(
          res,
          200,
          "Attendance updated successfully.",
          {
            attendance:
              existing,
          }
        );
      }

      const record =
        await Attendance.create({
          date,
          subjectId,
          facultyId:
            req.user.id,
          stream,
          semester,
          session,
          attendance,
        });

      return successResponse(
        res,
        201,
        "Attendance saved successfully.",
        {
          attendance:
            record,
        }
      );
    } catch (error) {
      console.error(
        "Save Attendance Error:",
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
   GET STUDENT ATTENDANCE
============================================================================= */

export const getStudentAttendance =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const student =
        await Student.findById(
          id
        )
          .select(
            "name roll reg stream semester"
          )
          .lean();

      if (!student) {
        return errorResponse(
          res,
          404,
          "Student not found."
        );
      }

      const attendance =
        await Attendance.find({
          "attendance.studentId":
            id,
        })
          .populate(
            "subjectId"
          )
          .sort({
            date: -1,
          })
          .lean();

      return successResponse(
        res,
        200,
        "Student attendance fetched successfully.",
        {
          count:
            attendance.length,
          attendance,
        }
      );
    } catch (error) {
      console.error(
        "Get Student Attendance Error:",
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
   GET ATTENDANCE PERCENTAGE
============================================================================= */

export const getAttendancePercentage =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const student =
        await Student.findById(
          id
        )
          .select(
            "name roll reg stream semester"
          )
          .lean();

      if (!student) {
        return errorResponse(
          res,
          404,
          "Student not found."
        );
      }

      const records =
        await Attendance.find({
          "attendance.studentId":
            id,
        }).lean();

      let totalClasses = 0;
      let presentClasses = 0;

      records.forEach(
        (record) => {
          const studentRecord =
            record.attendance.find(
              (item) =>
                item.studentId.toString() ===
                id
            );

          if (!studentRecord) return;

          totalClasses++;

          if (
            studentRecord.status ===
            "Present"
          ) {
            presentClasses++;
          }
        }
      );

      const percentage =
        totalClasses === 0
          ? 0
          : Number(
              (
                (presentClasses /
                  totalClasses) *
                100
              ).toFixed(2)
            );

      return successResponse(
        res,
        200,
        "Attendance percentage fetched successfully.",
        {
          student: {
            id: student._id,
            name:
              student.name,
            roll:
              student.roll,
            reg: student.reg,
            stream:
              student.stream,
            semester:
              student.semester,
          },

          summary: {
            totalClasses,
            presentClasses,

            absentClasses:
              totalClasses -
              presentClasses,

            percentage,
          },
        }
      );
    } catch (error) {
      console.error(
        "Get Attendance Percentage Error:",
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
   GET SUBJECT ATTENDANCE
============================================================================= */

export const getSubjectAttendance =
  async (req, res) => {
    try {
      const { subjectId } =
        req.params;

      const attendance =
        await Attendance.find({
          subjectId,
        })
          .populate(
            "subjectId"
          )
          .populate(
            "facultyId"
          )
          .populate(
            "attendance.studentId"
          )
          .sort({
            date: -1,
          })
          .lean();

      return successResponse(
        res,
        200,
        "Subject attendance fetched successfully.",
        {
          count:
            attendance.length,
          attendance,
        }
      );
    } catch (error) {
      console.error(
        "Get Subject Attendance Error:",
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
   GET ATTENDANCE BY DATE
============================================================================= */

export const getAttendanceByDate =
  async (req, res) => {
    try {
      const {
        date,
        subjectId,
      } = req.query;

      if (
        !date ||
        !subjectId
      ) {
        return errorResponse(
          res,
          400,
          "Date and Subject are required."
        );
      }

      const attendance =
        await Attendance.findOne({
          date,
          subjectId,
        })
          .populate(
            "subjectId"
          )
          .populate(
            "facultyId"
          )
          .populate(
            "attendance.studentId"
          )
          .lean();

      if (!attendance) {
        return errorResponse(
          res,
          404,
          "Attendance record not found."
        );
      }

      return successResponse(
        res,
        200,
        "Attendance fetched successfully.",
        {
          attendance,
        }
      );
    } catch (error) {
      console.error(
        "Get Attendance By Date Error:",
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
   GET ATTENDANCE REPORT
============================================================================= */

export const getAttendanceReport =
  async (req, res) => {
    try {
      const {
        stream,
        semester,
        subjectId,
      } = req.query;

      const query = {};

      if (stream) {
        query.stream =
          stream;
      }

      if (semester) {
        query.semester =
          semester;
      }

      if (subjectId) {
        query.subjectId =
          subjectId;
      }

      const records =
        await Attendance.find(
          query
        )
          .populate(
            "subjectId"
          )
          .populate(
            "facultyId"
          )
          .populate(
            "attendance.studentId"
          )
          .sort({
            date: -1,
          })
          .lean();

      return successResponse(
        res,
        200,
        "Attendance report fetched successfully.",
        {
          count:
            records.length,
          records,
        }
      );
    } catch (error) {
      console.error(
        "Get Attendance Report Error:",
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
   GET REPORT SUMMARY
============================================================================= */

export const getReportSummary =
  async (req, res) => {
    try {
      const totalRecords =
        await Attendance.countDocuments();

      const totalSubjects =
        await Attendance.distinct(
          "subjectId"
        );

      const totalFaculty =
        await Attendance.distinct(
          "facultyId"
        );

      const totalStudents =
        await Student.countDocuments({
          status: "active",
        });

      return successResponse(
        res,
        200,
        "Attendance summary fetched successfully.",
        {
          summary: {
            totalRecords,
            totalStudents,
            totalSubjects:
              totalSubjects.length,
            totalFaculty:
              totalFaculty.length,
          },
        }
      );
    } catch (error) {
      console.error(
        "Get Report Summary Error:",
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
   GET LOW ATTENDANCE STUDENTS
============================================================================= */

export const getLowAttendanceStudents =
  async (req, res) => {
    try {
      const threshold =
        Number(
          req.query.threshold ??
            75
        );

      const records =
        await Attendance.find()
          .populate(
            "attendance.studentId"
          )
          .lean();

      const studentMap = {};

      records.forEach(
        (record) => {
          record.attendance.forEach(
            (entry) => {
              if (
                !entry.studentId
              )
                return;

              const id =
                entry.studentId._id.toString();

              if (
                !studentMap[id]
              ) {
                studentMap[id] = {
                  student:
                    entry.studentId,
                  totalClasses: 0,
                  presentClasses: 0,
                };
              }

              studentMap[id]
                .totalClasses++;

              if (
                entry.status ===
                "Present"
              ) {
                studentMap[id]
                  .presentClasses++;
              }
            }
          );
        }
      );

      const students =
        Object.values(
          studentMap
        )
          .map((item) => {
            const percentage =
              item.totalClasses ===
              0
                ? 0
                : Number(
                    (
                      (item.presentClasses /
                        item.totalClasses) *
                      100
                    ).toFixed(2)
                  );

            return {
              student:
                item.student,

              totalClasses:
                item.totalClasses,

              presentClasses:
                item.presentClasses,

              absentClasses:
                item.totalClasses -
                item.presentClasses,

              percentage,
            };
          })
          .filter(
            (item) =>
              item.percentage <
              threshold
          )
          .sort(
            (a, b) =>
              a.percentage -
              b.percentage
          );

      return successResponse(
        res,
        200,
        "Low attendance students fetched successfully.",
        {
          threshold,
          count:
            students.length,
          students,
        }
      );
    } catch (error) {
      console.error(
        "Get Low Attendance Students Error:",
        error
      );

      return errorResponse(
        res,
        500,
        error.message
      );
    }
  };