import express from "express"
import { googleAuth, logout, signIn, signUp } from "../controller/auth.js";
import authMiddleware from "../middlewares/authMiddlewares.js";
import { updateProfile } from "../controller/updateUser.js";
import { upload } from "../middlewares/upload.js";
const router = express.Router();

router.post("/signup", signUp)
router.post("/signin" , signIn)
router.post("/logout", logout)

router.get("/me", authMiddleware, (req, res) => {
    res.status(200).json({user: req.user});
      console.log(req.user);
});

router.post("/google/auth", googleAuth);

router.put(
  '/profile',
  authMiddleware,
  upload.single("image"),
  updateProfile
);


export default router