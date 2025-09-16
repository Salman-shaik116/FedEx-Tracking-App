import mongoose, {Schema , Document} from "mongoose";

export interface IEvent extends Document{
    title : string;
    description : string;
    date : Date;
    location : string;
    createdBy : mongoose.Types.ObjectId;
    EventId : number;
}

const createdByType = mongoose.Schema.Types.ObjectId;

const EventSchema = new Schema<IEvent>({
    title : {type : String, required : true},
    description : {type : String},
    date : {type : Date, required : true},
    location : {type : String, required : true},
    createdBy : {type : createdByType, ref : "User", required : true},
    EventId : {type : Number, required : true, unique : true}
});

const Event = mongoose.model<IEvent>("Event",EventSchema);

export default Event;


