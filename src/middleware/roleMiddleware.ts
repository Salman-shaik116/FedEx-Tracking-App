import { Response , NextFunction} from "express";
import status from "../utils/http_codes";
import { CustomRequest } from "./authMiddleware";



const authorizeRole = (allowedRoles : string[]) =>{
    
    return (req : CustomRequest, res : Response, next : NextFunction) =>{
        const user = req.user;

        if(!user){
            return res.status(status.FORBIDDEN).json({message : "User not authenticated...!!"});
        }

        if(!allowedRoles.includes(user.role)) {
            return res.status(status.FORBIDDEN).json({
                message : `Access denied  for role : ${user.role}`
            });
        };
        next();
    };
    
};

export default authorizeRole;
