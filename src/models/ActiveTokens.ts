import mongoose from "mongoose";

const ActiveTokenSchema = new mongoose.Schema({
    email : {type : String, required : true},
    token : {type : String, required : true},
    issuedAt : {type : Date, required : true, toISOString: true},
    expiresAt: { type: Date, required: true, toISOString: true },
});

const ActiveToken = mongoose.model('ActiveToken', ActiveTokenSchema);

export default ActiveToken;