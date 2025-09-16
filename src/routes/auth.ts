import express, {Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/user";
import ActiveToken from "../models/ActiveTokens";
import authenticateToken, {  CustomRequest } from "../middleware/authMiddleware";
import status from "../utils/http_codes";
import UserModel from "../models/user";
import crypto from "crypto";
import validate from "../middleware/validate";
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} from "../validators/authValidators";

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET!;

// Route: signup

router.post("/signup", validate(signupSchema), async (req : CustomRequest , res) => {
    const { firstName, lastName, email, password , phone, role } = req.body;
    if (!email || !password) {
        return res.status(status.BAD_REQUEST).json({ message: "Email and password are required" });
    }
    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(status.BAD_REQUEST).json({ message: "User already exists" });
        }

        if (role){
          const validRoles = ["superadmin", "admin", "employee", "user"];
          if (!validRoles.includes(role.toLowerCase())) {
            return res.status(status.FORBIDDEN).json({ message: "Invalid role specified" });
          }
        } else {
          return res.status(status.FORBIDDEN).json({ message: "Role is required" });
        }
        const hashedPassword = await bcrypt.hash(password, 13);
        const newUser = new User({firstName,
          lastName,
          email,
          password: hashedPassword,
          phone,
          role : role ? role.toLowerCase() : "user",
        });

        await newUser.save();
        const msg = "Login to get the token...!!"
        return res.status(status.CREATED).json({ message: "User registered successfully", userId : newUser._id ,msg });
    } catch (err) {
        console.error("Error during signup:", err);
        return res.status(status.SERVER_ERROR).json({ message: "Server error", error: err });
    }
});

// Route: Login
router.post("/login", validate(loginSchema), async (req , res) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(status.NOT_FOUND).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(status.UNAUTHORIZED).json({ message: "Invalid credentials" });
    }

    const now = new Date();

    const existingToken = await ActiveToken.findOne({
      email,
      expiresAt: { $gt: now }, // Only tokens not yet expired
    });

    if (existingToken) {
      return res.status(status.OK).json({
        message: "User already logged in",
        token: existingToken.token,
      });
    }

  const payload = {email: user.email, id: user._id, role: user.role};
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

    const issuedAt = now;
    const expiresAt = new Date(now.getTime() + 60 * 60 * 1000);

    const newToken = new ActiveToken({    
      email,
      token,
      issuedAt,
      expiresAt,
    });

    await newToken.save();

    res.status(status.OK).json({
      message: "Login successful",
      token,
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(status.SERVER_ERROR).json({ message: "Login failed" });
  }
});


// Forgot Password
router.post("/forgot-password", validate(forgotPasswordSchema), async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(status.UNAUTHORIZED).json({ message: "Authorization token is required" });
  }

  let decoded: any;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(status.FORBIDDEN).json({ message: "Invalid or expired JWT token" });
  }

  const { email } = req.body;

  // Ensure token email and request email match
  if (decoded.email !== email) {
    return res.status(status.FORBIDDEN).json({ message: "Email does not match JWT token" });
  }

  const user = await UserModel.findOne({ email });
  if (!user) {
    return res.status(status.NOT_FOUND).json({ message: "User not found" });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

  user.resetToken = resetToken;
  user.resetTokenExpiry = tokenExpiry;
  await user.save();

  return res.status(status.OK).json({
    message: "Reset token generated",
    resetToken,
    tokenExpiry,
  });
});

// Reset Password
router.post("/reset-password/:token", validate(resetPasswordSchema), async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  if (!token) {
    return res.status(status.BAD_REQUEST).json({ message: "Reset token is required" });
  }
  if (!newPassword) {
    return res.status(status.BAD_REQUEST).json({ message: "New password is required" });
  }
  const user = await UserModel.findOne({
    resetToken: token,
    resetTokenExpiry: { $gt: new Date() }, // valid token
  });

  if (!user) {
    return res.status(status.BAD_REQUEST).json({ message: "Invalid or expired token" });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 13);
  user.password = hashedPassword;
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();

  res.status(status.OK).json({ message: "Password reset successful" });
});

// Route: Profile
router.get("/profile", authenticateToken, async (req: CustomRequest, res: Response) => {
  try {
    const email = req.user.email;
    const user = await UserModel.findOne({ email }).select("-password -resetToken -resetTokenExpiry");

    if (!user) {
      return res.status(status.NOT_FOUND).json({ message: "User not found" });
    }

    res.status(status.OK).json({
      message: "Profile fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(status.SERVER_ERROR).json({ message: "Failed to fetch profile", error });
  }
});

// Route: Logout
router.post("/logout", authenticateToken, async (req: CustomRequest, res: Response) => {
    const token = req.token!;
    const decoded = jwt.decode(token) as { exp: number };

    if (!decoded || !decoded.exp) {
    return res.status(status.BAD_REQUEST).json({ message: "Invalid token" });
  }
  const expirytoken = await ActiveToken.findOne({ token: req.token });
  const expiry = expirytoken?.expiresAt.toISOString();
   return res.status(status.OK).json({
    message: "Logged out successfully",
    note: `Token remains active until "${expiry}" and will be auto-removed when expired.`
  });
});

//user can Able to update their own profile
// PUT /api/auth/profile
router.put("/profile", authenticateToken, async (req: CustomRequest, res: Response) => {
  const { firstName, lastName, phone } = req.body;    
  const email = req.user.email;
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(status.NOT_FOUND).json({ message: "User not found" });
    }
    // Update only provided fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;

    await user.save();
    res.status(status.OK).json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(status.SERVER_ERROR).json({ message: "Failed to update profile", error });
  }
});

export default router;


  
