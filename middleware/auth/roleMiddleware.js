/* ==========================================================================
   GENERIC ROLE AUTHORIZATION MIDDLEWARE
============================================================================= */

const roleMiddleware =
  (...allowedRoles) => {

    return (
      req,
      res,
      next
    ) => {

      try {

        /* ======================================
           AUTHENTICATION CHECK
        ====================================== */

        if (!req.user) {

          return res.status(401).json({
            success: false,
            message:
              "Authentication required.",
          });

        }

        /* ======================================
           ROLE AUTHORIZATION
        ====================================== */

        if (
          !allowedRoles.includes(
            req.user.role
          )
        ) {

          return res.status(403).json({
            success: false,
            message:
              "You are not authorized to access this resource.",
          });

        }

        return next();

      } catch (error) {

        console.error(
          "Role Middleware Error:",
          error
        );

        return res.status(500).json({
          success: false,
          message:
            "Role authorization failed.",
        });

      }

    };

  };

/* ==========================================================================
   ALIAS (Backward Compatibility)
============================================================================= */

export const authorizeRoles =
  (...allowedRoles) =>
    roleMiddleware(
      ...allowedRoles
    );

/* ==========================================================================
   PREDEFINED ROLE MIDDLEWARE
============================================================================= */

export const studentOnly =
  roleMiddleware(
    "student"
  );

export const facultyOnly =
  roleMiddleware(
    "faculty"
  );

export const adminOnly =
  roleMiddleware(
    "admin"
  );

export const facultyAdminOnly =
  roleMiddleware(
    "faculty",
    "admin"
  );

export const allAuthorized =
  roleMiddleware(
    "student",
    "faculty",
    "admin"
  );

/* ==========================================================================
   EXPORTS
============================================================================= */

export default roleMiddleware;