import userModel from "../models/userModel.js";

export const getUserData =async (req,res)=>{
    try{
         const userId = req.userId; // extracting userId from the request body
          
         const user = await userModel.findById(userId)// finding the user by userId 

         if(!user){
            return res.json({success:false,message : "User not found"})
         }
         res.json({
            success:true,
            userData : {
                name : user.name,
                isAccountVerified : user.isAccountVerified
            }
         })
    }
    catch(error){
        return res.json({success:false,message : error.message})
    }

}
