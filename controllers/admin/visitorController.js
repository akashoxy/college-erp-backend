import Visitor from "../../models/admin/visitorModel.js";

/* ==========================================================================
   INCREMENT VISITOR COUNT
============================================================================= */

export const incrementVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findOneAndUpdate(
      {}, // Always update the single visitor document
      {
        $inc: {
          count: 1,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Visitor count updated successfully.",
      count: visitor.count,
    });
  } catch (error) {
    console.error("Increment Visitor Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update visitor count.",
    });
  }
};

/* ==========================================================================
   GET VISITOR COUNT
============================================================================= */

export const getVisitorCount = async (req, res) => {
  try {
    const visitor = await Visitor.findOne();

    return res.status(200).json({
      success: true,
      count: visitor?.count || 0,
    });
  } catch (error) {
    console.error("Get Visitor Count Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch visitor count.",
    });
  }
};