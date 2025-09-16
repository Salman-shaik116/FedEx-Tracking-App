import mongoose from "mongoose";

const ExpiredTokenSchema = new mongoose.Schema({

  email: { type: String, required: true },
  token: { type: String, required: true },
  issuedAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true },
  expiredAt: { type: Date, required: true },
  reason: { type: String },
});


const ExpiredToken = mongoose.model('ExpiredToken',ExpiredTokenSchema);

export default ExpiredToken