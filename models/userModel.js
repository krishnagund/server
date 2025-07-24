// in this file we are defining schemas and models for the user collection in the MongoDB database using mongoose

import mongoose from "mongoose"; // Importing mongoose to interact with MongoDB

const userSchema = new mongoose.Schema({ // constructer for creating a schema for the user collection
  
    name : {type : String,required : true}, // name field of type String and required
    email : {type : String,required : true,unique : true}, // email field of type String, required and unique
    password : {type : String,required : true}, // password field of type String and required
    verifyOtp : {type : String,default : ''}, // verifyOtp field of type String with a default value of an empty string
    verifyOtpExpireAt : {type : Number,default : 0}, // verifyOtpExpireAt field of type Number with a default value of 0
    isAccountVerified : {type : Boolean,default : false}, // isVerified field of type Boolean with a default value of false false because the account is not verified initially
    resetOtp :{type : String,default : ''}, // resetOtp field of type String with a default value of an empty string
    resetOtpExpireAt : {type : Number,default : 0}, // resetOtpExpireAt field of type Number with a default value of 0
})


const userModel = mongoose.models.user || mongoose.model('user',userSchema); // creating a model named 'user' using the userSchema  and checking if the model already exists to avoid overwriting it so it will use the existing model if it exists or create a new one if it doesn't

export default userModel;   // so we use this usermdoel to store the data in the mongodb collection
