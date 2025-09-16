import express from "express";
import authenticateToken, {CustomRequest} from "../middleware/authMiddleware";
import status from "../utils/http_codes";
import Event from "../models/event";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const router = express.Router();

// Create a new event
// Only  superadmin and employer can create events
router.post("/create-Event", authenticateToken,  (req : CustomRequest , res) =>{
    try{
        const {title, description, date, location} = req.body;
        const role = req.user?.role;
        const userId = req.user?.id;

        if(!title || !description || !location || !date){
            return res.status(status.NOT_FOUND).json({
                message : "Event details are requied please give them"
            });
        };
        
        // Allowed roles
        const allowedRoles = ["employer", "superadmin"];

        if(!allowedRoles.includes(role)){
            console.log("Decoded user from token:", req.user);
            console.log("User role from token:", req.user.role);
            return res.status(status.FORBIDDEN).json({
                Message : "You are not authorized to create events....!!"
            });
        };
        // validate event date
        const parsedDate = dayjs(date, "DD/MM/YYYY", true);
        if (!parsedDate.isValid()) {
            return res.status(400).json({ error: "Invalid date format. Use DD/MM/YYYY" });
        }

        const eventId = Math.floor(Math.random() * 1000000);

        const newEvent = new Event({
            title,
            description,
            date: parsedDate.toDate(),
            location,
            createdBy : userId,
            EventId : eventId
        });

        newEvent.save();
        return res.status(status.OK).json({
            message : "Event created successfully.........", Event : newEvent
        });
    } catch(error) {
        console.error("Error creating event...",error);
        return res.status(status.SERVER_ERROR).json({ message : "Failed to create event" , Error : error});
    }
});

// ***1. User Roles***

// user can view all available events
// GET /events/available-events
// Fetch all available events for registration

router.get("/available-events",authenticateToken,async (_req , res) => {
    try {
        const events = await Event.find();
        res.status(status.OK).json({ events });
    } catch (error) {
        console.error("Error fetching available events:", error);
        res.status(status.SERVER_ERROR).json({ message: "Failed to fetch available events" });
    }
});

// ***2.Employer Roles***

// employer can only see their own events
router.get("/employer-events/:eventId", authenticateToken, async (req : CustomRequest , res) => {
    try {
        const eventId = req.params.eventId;
        const userId = req.user.id;

        // Check if event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(status.NOT_FOUND).json({ message: "Event not found" });
        }

        // Check if user is authorized to view this event
        if (event.createdBy.toString() !== userId && !["admin", "superadmin"].includes(req.user.role)) {
            return res.status(status.FORBIDDEN).json({ message: "You are not authorized to view this event" });
        }

        res.status(status.OK).json({ event });
    } catch (error) {
        console.error("Error fetching event:", error);
        res.status(status.SERVER_ERROR).json({ message: "Failed to fetch event", error });
    }
});

//  employer can update their own events

router.put("/employer-events/:eventId", authenticateToken, async (req : CustomRequest , res) => {
    try {
        const eventId = req.params.eventId;
        const {title, description, date, location} = req.body;
        const userId = req.user.id;

        // Check if event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(status.NOT_FOUND).json({ message: "Event not found" });
        }

        // Check if user is authorized to update this event
        if (event.createdBy.toString() !== userId) {
            return res.status(status.FORBIDDEN).json({ message: "You are not authorized to update this event" });
        }

        // Update event details
        event.title = title ;
        event.description = description ;
        event.date = date ;
        event.location = location ;

        await event.save();
        res.status(status.OK).json({ message: "Event updated successfully", event });
    } catch (error) {
        console.error("Error updating event:", error);
        res.status(status.SERVER_ERROR).json({ message: "Failed to update event", error });
    }
});

// employer can delete their own events

router.delete("/employer-events/:eventId", authenticateToken, async (req : CustomRequest , res) => {
    try {
        const eventId = req.params.eventId;
        const userId = req.user.id;

        // Check if event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(status.NOT_FOUND).json({ message: "Event not found" });
        }

        // Check if user is authorized to delete this event
        if (event.createdBy.toString() !== userId) {
            return res.status(status.FORBIDDEN).json({ message: "You are not authorized to delete this event" });
        }

        await event.deleteOne();
        res.status(status.OK).json({ message: "Event deleted successfully" });
    } catch (error) {
        console.error("Error deleting event:", error);
        res.status(status.SERVER_ERROR).json({ message: "Failed to delete event", error });
    }
});

// ***3. Admin Roles and Superadmin Roles***

// Admin and superadmin is able to view all events
router.get("/all-events", authenticateToken, async (_req, res) => {
    try {
        const events = await Event.find();
        res.status(status.OK).json({ events });
    } catch (error) {
        console.error("Error fetching all events:", error);
        res.status(status.SERVER_ERROR).json({ message: "Failed to fetch all events", error });
    }
});

//superadmin Can update any events even if not created by them
router.put("/all-events/:eventId", authenticateToken, async (req: CustomRequest, res) => {
    const eventId = req.params.eventId;
    const { title, description, date, location } = req.body;

    try {
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(status.NOT_FOUND).json({ message: "Event not found" });
        }

        // Update event details
        event.title = title;
        event.description = description;
        event.date = date;
        event.location = location;

        await event.save();
        res.status(status.OK).json({ message: "Event updated successfully", event });
    } catch (error) {
        console.error("Error updating event:", error);
        res.status(status.SERVER_ERROR).json({ message: "Failed to update event", error });
    }
});

//superadmin Can  delete any events even if not created by them

router.delete("/all-events/:eventId", authenticateToken, async (req: CustomRequest, res) => {
    const eventId = req.params.eventId;
    try {
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(status.NOT_FOUND).json({ message: "Event not found" });
        }
        await event.deleteOne();
        res.status(status.OK).json({ message: "Event deleted successfully" });
    } catch (error) {
        console.error("Error deleting event:", error);
        res.status(status.SERVER_ERROR).json({ message: "Failed to delete event", error });
    }
});

export default router;