import ExpiredToken from "../models/ExpiredTokens";

export const saveExpiredToken = async (token : String, expiresAt : Date) => {
    await ExpiredToken.create({token,  expiresAt});

};

export const isTokenExpired = async(token : String) : Promise<boolean> =>{
    const existing = await ExpiredToken.findOne({token});
    return !!existing;  
}

