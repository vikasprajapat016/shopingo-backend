import Slider from "../models/sliderModel.js";
import path from "path";
import fs from "fs";

/* CREATE SLIDER */
export const createSlider = async (req, res) => {
  try {
    const { title, subtitle, link, position } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Slider image required" });
    }

    const slider = await Slider.create({
      title,
      subtitle,
      link,
      position,
      image: `uploads/sliders/${req.file.filename}`,
      adminId: req.user._id,
    });

    res.status(201).json({ message: "Slider created", slider });
  } catch (error) {
    res.status(500).json({ message: "Create slider failed", error });
  }
};

/* GET ALL SLIDERS (ADMIN) */
export const getAllSliders = async (req, res) => {
  try {
    const sliders = await Slider.find().sort({ position: 1 });
    res.json({ sliders });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch sliders", error });
  }
};

/* GET SLIDER BY ID */
export const getSliderById = async (req, res) => {
  try {
    const slider = await Slider.findById(req.params.id);
    if (!slider) {
      return res.status(404).json({ message: "Slider not found" });
    }
    res.json({ slider });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch slider", error });
  }
};

/* GET ACTIVE SLIDERS (PUBLIC) */
export const getActiveSliders = async (req, res) => {
  try {
    const sliders = await Slider.find({ isActive: true }).sort({ position: 1 });
    res.json({ sliders });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch active sliders", error });
  }
};

/* UPDATE SLIDER */
export const updateSlider = async (req, res) => {
  try {
    const slider = await Slider.findById(req.params.id);
    if (!slider) {
      return res.status(404).json({ message: "Slider not found" });
    }

    if (req.file && slider.image) {
      const oldPath = path.join(process.cwd(), slider.image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const updated = await Slider.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        ...(req.file && { image: `uploads/sliders/${req.file.filename}` }),
      },
      { new: true }
    );

    res.json({ message: "Slider updated", slider: updated });
  } catch (error) {
    res.status(500).json({ message: "Update failed", error });
  }
};

/* DELETE SLIDER */
export const deleteSlider = async (req, res) => {
  try {
    const slider = await Slider.findById(req.params.id);
    if (!slider) {
      return res.status(404).json({ message: "Slider not found" });
    }

    const imgPath = path.join(process.cwd(), slider.image);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);

    await slider.deleteOne();
    res.json({ message: "Slider deleted" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error });
  }
};
