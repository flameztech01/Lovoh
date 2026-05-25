// controllers/contributorController.js
import User from "../models/userModel.js";
import asyncHandler from "express-async-handler";
import { v2 as cloudinary } from "cloudinary";

// Helper: upload a buffer (from multer memoryStorage) to Cloudinary
const uploadToCloudinary = async (fileBuffer, mimetype, folder) => {
  try {
    const dataUri = `data:${mimetype};base64,${fileBuffer.toString("base64")}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder,
      resource_type: "auto",
    });
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("File upload to cloud storage failed");
  }
};

// @desc    Apply to become a contributor
// @route   POST /api/contributor/apply
// @access  Private
export const applyForContributor = asyncHandler(async (req, res) => {
  console.log("=== Apply Contributor Called ===");
  console.log("User:", req.user?._id);
  console.log("Files:", req.files ? Object.keys(req.files) : "none");
  console.log("Body keys:", Object.keys(req.body));

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Check if contributor_application exists (old users might not have it)
  if (!user.contributor_application) {
    user.contributor_application = {
      status: "not_applied",
      queryLetter: "",
      publishedWorks: [],
      briefBio: "",
      resume: "",
      adminNotes: "",
      submittedAt: null,
      reviewedAt: null,
    };
  }

  if (
    user.contributor_application.status === "pending" ||
    user.contributor_application.status === "approved"
  ) {
    res.status(400);
    throw new Error(
      "You have already submitted an application or are already a contributor"
    );
  }

  // Check files
  if (!req.files || !req.files.queryLetterFile || !req.files.resumeFile) {
    console.log("Missing files - req.files:", req.files);
    res.status(400);
    throw new Error("Both query letter and resume files are required");
  }

  const { briefBio, publishedWorks } = req.body;

  if (!briefBio || !briefBio.trim()) {
    res.status(400);
    throw new Error("Brief bio is required");
  }

  let queryLetterUrl = "";
  let resumeUrl = "";

  try {
    // Upload query letter
    const queryLetterFile = req.files.queryLetterFile[0];
    console.log("Uploading query letter:", queryLetterFile.originalname, queryLetterFile.size);
    queryLetterUrl = await uploadToCloudinary(
      queryLetterFile.buffer,
      queryLetterFile.mimetype,
      "contributor_applications/query_letters"
    );
    console.log("Query letter uploaded:", queryLetterUrl);
  } catch (error) {
    console.error("Query letter upload failed:", error);
    res.status(500);
    throw new Error("Failed to upload query letter");
  }

  try {
    // Upload resume
    const resumeFile = req.files.resumeFile[0];
    console.log("Uploading resume:", resumeFile.originalname, resumeFile.size);
    resumeUrl = await uploadToCloudinary(
      resumeFile.buffer,
      resumeFile.mimetype,
      "contributor_applications/resumes"
    );
    console.log("Resume uploaded:", resumeUrl);
  } catch (error) {
    console.error("Resume upload failed:", error);
    res.status(500);
    throw new Error("Failed to upload resume");
  }

  // Parse publishedWorks if it comes as a JSON string (form-data)
  let worksArray = [];
  if (publishedWorks) {
    try {
      worksArray = typeof publishedWorks === "string" 
        ? JSON.parse(publishedWorks) 
        : publishedWorks;
    } catch (error) {
      console.error("publishedWorks parse error:", error);
      res.status(400);
      throw new Error("Invalid publishedWorks format. Must be a JSON array of URLs.");
    }
    if (!Array.isArray(worksArray)) {
      res.status(400);
      throw new Error("Published works must be an array");
    }
    if (worksArray.length > 3) {
      res.status(400);
      throw new Error("You can provide up to 3 links to your best published work");
    }
  }

  user.contributor_application = {
    status: "pending",
    queryLetter: queryLetterUrl,
    publishedWorks: worksArray,
    briefBio: briefBio.trim(),
    resume: resumeUrl,
    adminNotes: "",
    submittedAt: new Date(),
    reviewedAt: null,
  };

  console.log("Saving user...");
  await user.save();
  console.log("User saved successfully");

  res.status(201).json({
    success: true,
    message: "Contributor application submitted successfully",
    data: {
      status: user.contributor_application.status,
      submittedAt: user.contributor_application.submittedAt,
    },
  });
});

// @desc    Get own contributor application status
// @route   GET /api/contributor/status
// @access  Private
export const getContributorStatus = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "biizzed_contributor contributor_application"
    );

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // Return defaults if contributor_application doesn't exist yet
    const application = user.contributor_application || {
      status: "not_applied",
      queryLetter: "",
      publishedWorks: [],
      briefBio: "",
      resume: "",
      adminNotes: "",
      submittedAt: null,
      reviewedAt: null,
    };

    res.json({
      success: true,
      data: {
        biizzed_contributor: user.biizzed_contributor || false,
        contributor_application: application,
      },
    });
  } catch (error) {
    console.error("Error in getContributorStatus:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch contributor status",
    });
  }
});

// @desc    Admin: Get all contributor applications
// @route   GET /api/contributor/applications
// @access  Private/Admin
export const getContributorApplications = asyncHandler(async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status) {
      filter["contributor_application.status"] = status;
    } else {
      filter["contributor_application.status"] = { $ne: "not_applied" };
    }

    const users = await User.find(filter).select(
      "name email username profile biizzed_contributor contributor_application"
    );

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Error in getContributorApplications:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch applications",
    });
  }
});

// @desc    Admin: Approve a contributor application
// @route   PUT /api/contributor/approve/:userId
// @access  Private/Admin
export const approveContributor = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    const { adminNotes } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    if (!user.contributor_application || user.contributor_application.status !== "pending") {
      res.status(400);
      throw new Error("Application is not in pending state");
    }

    user.contributor_application.status = "approved";
    user.contributor_application.adminNotes = adminNotes || "";
    user.contributor_application.reviewedAt = new Date();
    user.biizzed_contributor = true;

    await user.save();

    res.json({
      success: true,
      message: "Contributor application approved",
      data: {
        userId: user._id,
        biizzed_contributor: user.biizzed_contributor,
        status: user.contributor_application.status,
      },
    });
  } catch (error) {
    console.error("Error in approveContributor:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to approve application",
    });
  }
});

// @desc    Admin: Reject a contributor application
// @route   PUT /api/contributor/reject/:userId
// @access  Private/Admin
export const rejectContributor = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    const { adminNotes } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    if (!user.contributor_application || user.contributor_application.status !== "pending") {
      res.status(400);
      throw new Error("Application is not in pending state");
    }

    user.contributor_application.status = "rejected";
    user.contributor_application.adminNotes = adminNotes || "";
    user.contributor_application.reviewedAt = new Date();
    user.biizzed_contributor = false;

    await user.save();

    res.json({
      success: true,
      message: "Contributor application rejected",
      data: {
        userId: user._id,
        biizzed_contributor: user.biizzed_contributor,
        status: user.contributor_application.status,
      },
    });
  } catch (error) {
    console.error("Error in rejectContributor:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to reject application",
    });
  }
});