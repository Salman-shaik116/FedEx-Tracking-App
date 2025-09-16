import express from "express";
import User from "../models/user";
import Event from "../models/event";
import Registration from "../models/registration";
import authenticateToken, { CustomRequest } from "../middleware/authMiddleware";
import authorizeRole from "../middleware/roleMiddleware";
import status from "../utils/http_codes"; 

const router = express.Router();

// Overview route for superadmin to get analytics
// Provides total users, events, registrations, and top 5 events by registration count
// This route aggregates data from User, Event, and Registration models

router.get("/overview", authenticateToken, authorizeRole(["superadmin"]), async (_req: CustomRequest, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const userRoles = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);

    const totalEvents = await Event.countDocuments();
    const totalRegistrations = await Registration.countDocuments();

    const topEvents = await Registration.aggregate([
      { $group: { _id: "$event", totalRegistrations: { $sum: 1 } } },
      { $sort: { totalRegistrations: -1 } },
      { $limit: 3 },
      {
        $lookup: {
          from: "events",
          localField: "_id",
          foreignField: "_id",
          as: "eventDetails"
        }
      },
      {
        $unwind: "$eventDetails"
      },
      {
        $project: {
          _id: 0,
          eventId: "$eventDetails._id",
          title: "$eventDetails.title",
          totalRegistrations: 1
        }
      }
    ]);

    res.json({
      stats: {
        users: { total: totalUsers, byRole: userRoles },
        events: totalEvents,
        registrations: totalRegistrations,
        top3Events: topEvents
      }
    });
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(status.SERVER_ERROR).json({ message: "Internal Server Error" });
  }
});

// Route to get recent activity for the last 7 days
// This route provides counts of new users, events, and registrations created in the last 7 days
router.get("/activity", authenticateToken, authorizeRole(["superadmin"]), async (_req: CustomRequest, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const newUsers = await User.find({ createdAt: { $gte: sevenDaysAgo } });
    const newEvents = await Event.find({ date: { $gte: sevenDaysAgo } });
    const newRegistrations = await Registration.find({ createdAt: { $gte: sevenDaysAgo } });

    res.json({
      recentActivity: {
        newUsers: newUsers.length,
        newEvents: newEvents.length,
        newRegistrations: newRegistrations.length
      }
    });
  } catch (err) {
    console.error("Activity error:", err);
    res.status(status.SERVER_ERROR).json({ message: "Internal Server Error" });
  }
});


export default router;
