import bcrypt from "bcrypt";
import User from "../models/userModel.js";
export const createAdmin = async (req, res, ) => {
    const {username, email, password, role} = req.body || {}

    if (! ["USER_ADMIN", "PRODUCT_ADMIN"].includes(role)) {
        return res.status(400).json({
            success: false,
            message: "Invalid admin role"
        })
    }

    const exist = await User.findOne({ email})
    if (exist) {
        return res.status(400).json({
            success: false,
            message: "Email already exist"
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.Create({
        username,
        email,
        password: hashedPassword,
        role,
    });
    res.status(200).json({
        success: true,
        message: "Admin created successfully",
        admin: {
            id: admin._id,
            email: admin.email,
            role: admin.role
        }
    });
};