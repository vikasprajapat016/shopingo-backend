import bcrypt from "bcrypt";
import fs from "fs";
import User from "../models/userModel.js";

export const updateProfile = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { username, email, password } = req.body;
    const updateData = {};

    if (username) updateData.username = username;

    if (email) {
      const emailExists = await User.findOne({
        email,
        _id: { $ne: req.user.id }
      });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }
      updateData.email = email;
    }

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (req.file) {
      const existingUser = await User.findById(req.user.id);

      // Delete old image
      if (
        existingUser?.profilepic &&
        existingUser.profilepic.startsWith("/uploads")
      ) {
        const oldPath = `.${existingUser.profilepic}`;
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      updateData.profilepic = `/uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
        console.log(req.params.id)
  if (!user) {
    return res.status(404).json({
      message: "User not found"
    })
  }

  if (user._id.toString() === req.user._id.toString()) {
    return res.status(301).json({
      message: "Bhai khud ko hi delete kr dega kya "
    })
  }

  if (user.role === "SUPER_ADMIN") {
    return res.status(301).json({
      message: "Halwa h kya super admin delete krna"
    })
  }

  await user.deleteOne();
  res.json({message: "User deleted successfully"})

  } catch (error) {
    res.status(500).json({message: "Server Error "})
  }
}