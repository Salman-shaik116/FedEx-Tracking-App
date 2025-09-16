import ActiveToken from "../models/ActiveTokens";
import ExpiredToken from "../models/ExpiredTokens";

export async function cleanupExpiredTokensOnStartup() {
  try {
    const now = new Date();

    // Find all expired tokens
    const expiredTokens = await ActiveToken.find({ expiresAt: { $lte: now } });

    if (expiredTokens.length > 0) {
      console.log(` Found ${expiredTokens.length} expired tokens. Moving to expired list...`);

      // Insert expired tokens into ExpiredToken collection
      const formattedExpired = expiredTokens.map((t) => ({
        email: t.email,
        token: t.token,
        issuedAt: t.issuedAt,
        expiresAt: t.expiresAt,
        expiredAt: now,
      }));

      await ExpiredToken.insertMany(formattedExpired);

      // Remove from active tokens
      const tokenValues = expiredTokens.map((t) => t.token);
      await ActiveToken.deleteMany({ token: { $in: tokenValues } });

      console.log(`Cleanup completed successfully.`);
    } else {
      console.log(` No expired tokens found.`);
    }
  } catch (error) {
    console.error("Error during cleanup:", error);
  }
}

export async function cleanupExpiredTokensOnRunning() {
  const now = new Date();

  try {
    // 1. Find all expired tokens
    const expiredTokens = await ActiveToken.find({ expiresAt: { $lte: now } });

    if (expiredTokens.length === 0) return;

    // 2. Move each to ExpiredTokens collection
    const toInsert = expiredTokens.map((tokenDoc) => ({
      email: tokenDoc.email,
      token: tokenDoc.token,
      expiredAt: tokenDoc.expiresAt,
      reason: "Token expired", // Optional
    }));

    await ExpiredToken.insertMany(toInsert);

    // 3. Delete from ActiveTokens
    const ids = expiredTokens.map((t) => t._id);
    await ActiveToken.deleteMany({ _id: { $in: ids } });

    console.log(`Moved ${expiredTokens.length} expired token(s) to ExpiredTokens.`);
  } catch (error) {
    console.error("Error during token cleanup:", error);
  }
}