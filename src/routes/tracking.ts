import express, { Request, Response } from "express";
import authenticateToken from "../middleware/authMiddleware";
import { trackShipment } from "../services/fedexservice";
import status from "../utils/http_codes";

const router = express.Router();

router.get("/:trackingNumber", authenticateToken, async (req: Request, res: Response) => {
    const trackingNumber: string = req.params.trackingNumber;
    if (!trackingNumber) return res.status(status.BAD_REQUEST).json({ message: "Tracking number required" });

    try {
        const trackingInfo = await trackShipment(trackingNumber);
        res.status(status.OK).json(trackingInfo);
    } catch (error: any) {
        res.status(status.SERVER_ERROR).json({ error: error.message });
    }
    return res;
});

export default router;
