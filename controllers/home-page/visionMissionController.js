import VisionMission from "../../models/home-page/VisionMission.js";

/* ==========================================================================
   CREATE (ONLY IF EMPTY)
============================================================================= */

export const createVisionMission =
  async (req, res) => {
    try {
      const existing =
        await VisionMission.findOne();

      if (existing) {
        return res.status(400).json({
          success: false,
          message:
            "Vision & Mission document already exists. Use Update instead.",
        });
      }

      const visionMission =
        await VisionMission.create(
          req.body
        );

      res.status(201).json({
        success: true,
        message:
          "Vision & Mission created successfully",
        data: visionMission,
      });
    } catch (error) {
      console.error(
        "Create Vision Mission Error:",
        error
      );

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

/* ==========================================================================
   GET SINGLE DOCUMENT
============================================================================= */

export const getVisionMission =
  async (req, res) => {
    try {
      const visionMission =
        await VisionMission.findOne();

      res.status(200).json({
        success: true,
        data: visionMission,
      });
    } catch (error) {
      console.error(
        "Get Vision Mission Error:",
        error
      );

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

/* ==========================================================================
   UPDATE SINGLE DOCUMENT
============================================================================= */

export const updateVisionMission =
  async (req, res) => {
    try {
      const existing =
        await VisionMission.findById(
          req.params.id
        );

      if (!existing) {
        return res.status(404).json({
          success: false,
          message:
            "Vision & Mission document not found",
        });
      }

      const updatedData = {
        heroTitle:
          req.body.heroTitle ??
          existing.heroTitle,

        heroDescription:
          req.body.heroDescription ??
          existing.heroDescription,

        visionTitle:
          req.body.visionTitle ??
          existing.visionTitle,

        visionDescription:
          req.body
            .visionDescription ??
          existing.visionDescription,

        missions:
          req.body.missions ??
          existing.missions,
      };

      const updated =
        await VisionMission.findByIdAndUpdate(
          req.params.id,
          updatedData,
          {
            new: true,
            runValidators: true,
          }
        );

      res.status(200).json({
        success: true,
        message:
          "Vision & Mission updated successfully",
        data: updated,
      });
    } catch (error) {
      console.error(
        "Update Vision Mission Error:",
        error
      );

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

/* ==========================================================================
   DELETE ALL
============================================================================= */

export const deleteVisionMission =
  async (req, res) => {
    try {
      await VisionMission.deleteMany(
        {}
      );

      res.status(200).json({
        success: true,
        message:
          "All Vision & Mission data deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete Vision Mission Error:",
        error
      );

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };