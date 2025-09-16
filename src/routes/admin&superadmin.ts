import express from "express";
import  authorizeRole from "../middleware/roleMiddleware";
import authenticateToken from "../middleware/authMiddleware";
import User from "../models/user";
import { Request, Response } from "express";
import status from "../utils/http_codes";


const router = express.Router();


// Create user (admin/employer/user only)
router.post("/create-user",authenticateToken,authorizeRole(["admin", "superadmin"]), async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, phone, role } = req.body;
  if (role === "superadmin") {
    return res.status(status.FORBIDDEN).json({ message: "Cannot create Superadmin." });
  }
    const existing = await User.findOne({ email });     
    if (existing) return res.status(status.BAD_REQUEST).json({ message: "Email already exists." });
    const user = await User.create({ email, password, firstName, lastName, phone, role });
    res.status(status.CREATED).json({ message: "User created", user });
});


// Update user by ID
router.put("/update-user/:UserId", authenticateToken, authorizeRole(["admin", "superadmin"]), async (req: Request, res: Response) => {
  const { UserId } = req.params;
  const update = req.body;
  if (update.role === "superadmin") {
    return res.status(status.FORBIDDEN).json({ message: "Cannot assign Superadmin role." });
  }
  const updatedUser = await User.findByIdAndUpdate(UserId, update, { new: true });
  res.json(updatedUser);
});

// Delete user by ID
router.delete("/delete-user/:UserId", authenticateToken, authorizeRole(["admin", "superadmin"]), async (req: Request, res: Response) => {
  const { UserId } = req.params;
  await User.findByIdAndDelete(UserId);
  res.json({ message: "User deleted successfully" });
});

// the admin and superadmin can change the user roles but not to superadmin
router.put("/change-role/:UserId", authenticateToken, authorizeRole(["admin", "superadmin"]), async (req: Request, res: Response) => {
  const { UserId } = req.params;
  const { role } = req.body;
  
  try {
    if (role === "superadmin") {
      return res.status(status.FORBIDDEN).json({ message: "Cannot assign Superadmin role." });
    }
    
    const updatedUser = await User.findByIdAndUpdate(UserId, { role }, { new: true });
    res.json(updatedUser);
  } catch (error) {
    console.error("Error changing user role:", error);
    res.status(status.SERVER_ERROR).json({ message: "Failed to change user role", error });
  }
});


export default router;
