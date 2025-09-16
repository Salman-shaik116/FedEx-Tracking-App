import mongoose,{ Schema , Document } from "mongoose";

interface IRegistration extends Document {
    user : mongoose.Types.ObjectId;
    event : mongoose.Types.ObjectId;
    registrationId : number; 
};

const registrationSchema = new Schema<IRegistration>({

    user : {type : Schema.ObjectId, ref : "User", required : true },
    event : {type : Schema.ObjectId, ref : "Event" ,required : true},
    registrationId : { type : Number, required : true, unique : true },
});

const Registration = mongoose.model<IRegistration>("Registration",registrationSchema);

export default Registration;