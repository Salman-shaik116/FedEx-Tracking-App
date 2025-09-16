import express  from "express";
import mongoose from "mongoose";
import authenticateToken, {CustomRequest} from "../middleware/authMiddleware";
import authorizeRole from "../middleware/roleMiddleware";
import Event, { IEvent } from "../models/event";
import Registration from "../models/registration";
import status from "../utils/http_codes";


const router = express.Router();

// ***1. User Roles***

// User can register for event
router.post("/register/:eventId", authenticateToken, authorizeRole(["user"]), async (req: CustomRequest, res) => {
    const userId = req.user.id;
    const eventParam = req.params.eventId;

    try {
        // Resolve event either by Mongo _id or by numeric EventId
        let event: IEvent | null = null;
        if (mongoose.Types.ObjectId.isValid(eventParam)) {
            event = await Event.findById(eventParam);
        } else if (!Number.isNaN(Number(eventParam))) {
            event = await Event.findOne({ EventId: Number(eventParam) });
        } else {
            return res.status(status.BAD_REQUEST).json({ message: "Invalid event identifier" });
        }

        if (!event) {
            return res.status(status.NOT_FOUND).json({ message: "Event not found...!!" });
        }

        // Use the resolved event _id to avoid cast errors
        const alreadyRegistered = await Registration.findOne({ user: userId, event: event._id });
        if (alreadyRegistered) {
            return res.status(status.BAD_REQUEST).json({ message: "Already Registered..!!" });
        }

        const registrationId = Math.floor(Math.random() * 1000000);
        const newRegistration = new Registration({
            user: userId,
            event: event._id,
            registrationId,
        });
        await newRegistration.save();

        return res.status(status.OK).json({ message: "Registered successfully..!!", newRegistration });
    } catch (error) {
        console.error("Registration Error : ", error);
        return res.status(status.SERVER_ERROR).json({ message: "something went wrong..!!", Error: error });
    }
});

// user Can view their own registrations

router.get("/myregistrations",authenticateToken,authorizeRole(["user"]), async(req : CustomRequest , res) =>{
    try {
        const registrations = await Registration.find({user : req.user.id}).populate("event");
        return res.status(status.OK).json({ message : "Here are your Registrations : ", registrations});
    } catch (error) {
        console.error("Error fetching registrations : ",error);
        return res.status(status.SERVER_ERROR).json({message : "Error fetching your registrations :", Error : error});
    }

});

// user Can cancel their own registrations
router.delete("/myregistrations/:registrationId", authenticateToken, authorizeRole(["user"]), async (req: CustomRequest, res) => {
    const registrationParam = req.params.registrationId;
    try {
        let registration: any = null;
        if (mongoose.Types.ObjectId.isValid(registrationParam)) {
            registration = await Registration.findById(registrationParam);
        } else if (!Number.isNaN(Number(registrationParam))) {
            registration = await Registration.findOne({ registrationId: Number(registrationParam) });
        } else {
            return res.status(status.BAD_REQUEST).json({ message: "Invalid registration identifier" });
        }

        if (!registration) {
            return res.status(status.NOT_FOUND).json({ message: "Registration not found" });
        }
        if (registration.user.toString() !== req.user.id) {
            return res.status(status.FORBIDDEN).json({ message: "You can only cancel your own registrations" });
        }
        await Registration.findByIdAndDelete(registration._id);
        return res.status(status.OK).json({ message: "Registration cancelled successfully" });
    } catch (error) {
        console.error("Error cancelling registration:", error);
        return res.status(status.SERVER_ERROR).json({ message: "Failed to cancel registration", error });
    }
});

// ***2. Employer Roles***

//  Can view registrations specific to their own events
//  Cannot view user registrations outside their own events
router.get("/employer-registrations/:eventId", authenticateToken, authorizeRole(["employer"]), async (req: CustomRequest, res) => {
    const rawEventId = req.params.eventId;
    try {
        let event: IEvent | null = null;
        if (mongoose.Types.ObjectId.isValid(rawEventId)) {
            event = await Event.findById(rawEventId);
        } else if (!Number.isNaN(Number(rawEventId))) {
            event = await Event.findOne({ EventId: Number(rawEventId) });
        } else {
            return res.status(status.BAD_REQUEST).json({ message: "Invalid event identifier" });
        }

        if (!event) {
            return res.status(status.NOT_FOUND).json({ message: "Event not found" });
        }
        if (event.createdBy.toString() !== req.user.id && !["admin", "superadmin"].includes(req.user.role)) {
            return res.status(status.FORBIDDEN).json({ message: "You are not authorized to view this event's registrations" });
        }
        const registrations = await Registration.find({ event: event._id }).populate("user");
        return res.status(status.OK).json({ registrations });
    } catch (error) {
        console.error("Error fetching registrations for event:", error);
        return res.status(status.SERVER_ERROR).json({ message: "Failed to fetch registrations for this event", error });
    }
});

// ***3. Admin  and  Superadmin Roles***

// Admin and superadmin is able to view all registrations across all events
router.get("/all-registrations", authenticateToken, authorizeRole(["admin", "superadmin"]), async (_req: CustomRequest, res) => {
    try {
        const registrations = await Registration.find().populate("user").populate("event");
        return res.status(status.OK).json({ total :registrations.length, data : registrations,  });
    } catch (error) {
        console.error("Error fetching all registrations:", error);
        return res.status(status.SERVER_ERROR).json({ message: "Failed to fetch all registrations", error });
    }
});

//superadmin Can update any registrations even if not created by them
router.put("/all-registrations/:registrationId", authenticateToken, authorizeRole(["superadmin"]), async (req: CustomRequest, res) => {
    const registrationParam = req.params.registrationId;
    const updateData = req.body;

    try {
        let registration: any = null;
        if (mongoose.Types.ObjectId.isValid(registrationParam)) {
            registration = await Registration.findById(registrationParam);
        } else if (!Number.isNaN(Number(registrationParam))) {
            registration = await Registration.findOne({ registrationId: Number(registrationParam) });
        } else {
            return res.status(status.BAD_REQUEST).json({ message: "Invalid registration identifier" });
        }

        if (!registration) {
            return res.status(status.NOT_FOUND).json({ message: "Registration not found" });
        }
        const updatedRegistration = await Registration.findByIdAndUpdate(registration._id, updateData, { new: true });
        return res.status(status.OK).json({ message: "Registration updated successfully", updatedRegistration });
    } catch (error) {
        console.error("Error updating registration:", error);
        return res.status(status.SERVER_ERROR).json({ message: "Failed to update registration", error });
    }
});

//superadmin Can  delete any events even if not created by them

router.delete("/all-registrations/:registrationId", authenticateToken, authorizeRole(["superadmin"]), async (req: CustomRequest, res) => {
    const registrationParam = req.params.registrationId;
    try {
        let registration: any = null;
        if (mongoose.Types.ObjectId.isValid(registrationParam)) {
            registration = await Registration.findById(registrationParam);
        } else if (!Number.isNaN(Number(registrationParam))) {
            registration = await Registration.findOne({ registrationId: Number(registrationParam) });
        } else {
            return res.status(status.BAD_REQUEST).json({ message: "Invalid registration identifier" });
        }

        if (!registration) {
            return res.status(status.NOT_FOUND).json({ message: "Registration not found" });
        }
        await Registration.findByIdAndDelete(registration._id);
        return res.status(status.OK).json({ message: "Registration deleted successfully" });
    } catch (error) {
        console.error("Error deleting registration:", error);
        return res.status(status.SERVER_ERROR).json({ message: "Failed to delete registration", error });
    }
});



export default router;