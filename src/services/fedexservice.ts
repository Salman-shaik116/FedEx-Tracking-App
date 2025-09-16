import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

let fedexToken: string;

async function getFedExToken(): Promise<string> {
    const url = `${process.env.FEDEX_BASE_URL}/oauth/token`;
    const payload = new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.FEDEX_CLIENT_ID!,
        client_secret: process.env.FEDEX_CLIENT_SECRET!,
    });

    try {
        const response = await axios.post(url, payload.toString(), {
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        });
        fedexToken = response.data.access_token;
        return fedexToken;
    } catch (error: any) {
        console.error("FedEx Token Error:", error.response?.data || error.message);
        throw new Error("Failed to authenticate with FedEx API");
    }
}

export async function trackShipment(trackingNumber: string): Promise<any> {
    if (!fedexToken) await getFedExToken();

    const url = `${process.env.FEDEX_BASE_URL}/track/v1/trackingnumbers`;
    try {
        const response = await axios.post(url,
            { trackingInfo: [{ trackingNumberInfo: { trackingNumber } }], includeDetailedScans: true },
            { headers: { Authorization: `Bearer ${fedexToken}`, "Content-Type": "application/json" } }
        );
        return response.data;
    } catch (error: any) {
        console.error("Tracking Error:", error.response?.data || error.message);
        throw new Error("Tracking request failed.");
    }
}
