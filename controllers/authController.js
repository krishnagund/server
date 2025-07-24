// in this we can create diffrent controller functions like register, login, verifyOtp, resetPassword, etc. for the user authentication process

import bcrypt from 'bcryptjs'; // used for hashing passwords
import jwt from 'jsonwebtoken'; // used for creating and verifying JSON Web Tokens
import userModel from '../models/userModel.js'; // importing the userModel to interact with the user collection in the MongoDB database
import transporter from '../config/nodemailer.js';
import { EMAIL_VERIFY_TEMPLATE,PASSWORD_RESET_TEMPLATE } from '../config/emailTemplates.js'; // importing the nodemailer transporter to send emails
export const register = async(req,res) =>{
    console.log("req.body:", req.body);
    const {name,email,password} = req.body ;

   if(!name || !email || !password){
       return res.json({success : false , message : "missing details"})
    }


         try {

            const existingUser = await userModel.findOne({email}); // checking if the user already exists in the database
            if(existingUser){
                return res.json({success : false , message : "user already exists"})
            }

            const hashedPassword = await bcrypt.hash(password,10);

            const user = new userModel ({name,email,password:hashedPassword}); // creating a new user object with the provided details
            await user.save();
 
            const token = jwt.sign({id : user._id},process.env.JWT_SECRET,{expiresIn : '7d'}); // creating a JWT token for the user

            res.cookie('token',token,{httpOnly : true,secure : process.env.NODE_ENV === 'production',sameSite:process.env.NODE_ENV === 'production' ? 'none' : 'strict',maxAge : 7*24*60*60*1000}); // setting the token as a cookie in the response
             
            //sending a confirmation email to the user
            const mailOPtions ={
                from : process.env.SENDER_EMAIL, // sender's email address from environment variables
                to : email, // recipient's email address
                subject : 'Welcome to Our Service', // subject of the email
                text: `Welcome to our service, we are glad to have you onboard! and you have succesfully crated email with this email id : ${email}`, // plain text body of the email
            }
            await transporter.sendMail(mailOPtions); // sending the email using the transporter object

            return res.json({success : true})

         }
         catch (error) {
            res.json({success : false , message : error.message})
         }
}

export const login = async(req,res) =>{
    const {email,password} = req.body;

    if(!email || !password){
        return res.json({success : false , message : "email and password are required"})
    }

    try{
        const user = await userModel.findOne({email}); // finding the user by email

        if(!user){
            return res.json({success : false , message : "user not found"})
        }

        const isMatch = await bcrypt.compare(password,user.password); // comparing the provided password with the hashed password in the database

        if(!isMatch){
            return res.json({success : false , message : "invalid password"})
        }

        const token = jwt.sign({id : user._id},process.env.JWT_SECRET,{expiresIn : '7d'}); // creating a JWT token for the user
        res.cookie('token',token,{httpOnly : true,secure : process.env.NODE_ENV === 'production',sameSite:process.env.NODE_ENV === 'production' ? 'none' : 'strict',maxAge : 7*24*60*60*1000}); // setting the token as a cookie in the response
    
        return res.json({success : true})
    }
    catch(error){
        res.json({success : false , message : error.message})
    }
}

export const logout = async(req,res) => {
    try {
        res.clearCookie('token',{httpOnly : true,secure : process.env.NODE_ENV === 'production',sameSite:process.env.NODE_ENV === 'production' ? 'none' : 'strict'}); // clearing the token cookie to log out the user
        return res.json({success : true , message : "logged out successfully"})
    }
    catch (error) {
        res.json({success : false , message : error.message})
    }
}
// Function to send verification OTP to the user
export const sendVerifyOtp = async(req,res) => {
    try{
         const userId = req.userId; // extracting userId from the request body
         const user = await userModel.findById(userId); //
         if(user.isAccountVerified){
            return res.json({success : false , message : "account already verified"})
         }

        const otp= String (Math.floor(100000 + Math.random()*900000)) // generating a random 6-digit OTP

        user.verifyOtp = otp; // setting the generated OTP to the user's verifyOtp field
        user.verifyOtpExpireAt = Date.now() + 24*60*60*1000; // setting the OTP expiration time to 10 minutes from now

        await user.save(); // saving the updated user document to the database

        const mailOptions = {
            from: process.env.SENDER_EMAIL, // sender's email address from environment variables
            to: user.email, // recipient's email address
            subject: 'Verify Your Account', // subject of the email
            //text: `Your verification OTP is ${otp}. It is valid for 24 hours.`,
            html : EMAIL_VERIFY_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email) // plain text body of the email with the OTP
        }

        await transporter.sendMail(mailOptions); // sending the email using the transporter object

        return res.json({success : true , message : "OTP sent successfully"}) // sending a success response

    }
    catch(error){
        res.json({success : false , message : error.message})
    }
}


export const verifyEmail = async(req,res) => {
    const userId = req.userId; // extracting userId from the request body
    const {otp} = req.body; // extracting userId and otp from the request body

    if(!userId || !otp){
        return res.json({success : false , message : "userId and otp are required"})
    }

    try{
            const user = await userModel.findById(userId); // finding the user by userId

            if(!user){
                return res.json({success: false , message : "user not found"})
            }

            if(user.verifyOtp === '' || user.verifyOtp !== otp){
                return res.json({success : false , message : "invalid OTP"})
            }

            if(user.verifyOtpExpireAt < Date.now()){
                return res.json({success : false , message : "OTP has expired"})
            }

            user.isAccountVerified = true; // setting the isAccountVerified field to true
            user.verifyOtp = ''; // clearing the verifyOtp field
            user.verifyOtpExpireAt = 0; // clearing the verifyOtpExpireAt field

            await user.save(); // saving the updated user document to the database

            return res.json({success:true,message:"Email verified"})
    }
    catch (error) {
        res.json({success : false , message : error.message}) // sending an error response if any exception occurs

    }
}

//check user is authenticated or not
export const isAuthenticated = (req, res) => {
    try{
return res.json({success : true }) // returning the authenticated user details
    }catch(error){
        res.json({success : false , message : error.message})
    }   
}

// send password reset OTP

export const sendResetOtp = async(req,res) => {
    const {email} = req.body; // extracting email from the request body

    if(!email){ 
        return res.json({success : false , message : "email is required"})
    }

    try{
          const user = await userModel.findOne({email}); // finding the user by email
          if(!user){
            return res.json({success : false , message : "user not found"})
          }
            const otp= String (Math.floor(100000 + Math.random()*900000)) // generating a random 6-digit OTP

        user.resetOtp = otp; // setting the generated OTP to the user's verifyOtp field
        user.resetOtpExpireAt = Date.now() + 15*60*1000; // setting the OTP expiration time to 10 minutes from now

        await user.save(); // saving the updated user document to the database

        const mailOptions = {
            from: process.env.SENDER_EMAIL, // sender's email address from environment variables
            to: user.email, // recipient's email address
            subject: 'Password reset Otp', // subject of the email
           // text: `Your OTP for reseting your password is ${otp}. Use this to reset your password.` ,
            html:PASSWORD_RESET_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)
        }

        await transporter.sendMail(mailOptions); // sending the email using the transporter object

       return res.json({success : true , message : "OTP sent successfully"})
    }
    catch(error){
        res.json({success : false , message : error.message}) // sending an error response if any exception occurs
    }
}


// reset user password

export const resetPassword = async(req,res) => {
    const {email,otp,newPassword} = req.body; // extracting email, otp, and newPassword from the request body
    if(!email || !otp || !newPassword){
        return res.json({success : false , message : "email, otp and new password are required"})
    }

    try{
        const user = await userModel.findOne({email}); // finding the user by email 
        if(!user){
            return res.json({success : false , message : "user not found"})
        }
        if(user.resetOtp === '' || user.resetOtp !== otp){
            return res.json({success : false , message : "invalid OTP"})
        }

        if(user.resetOtpExpireAt < Date.now()){
            return res.json({success : false , message : "OTP has expired"})
        }

        const hashedPassword = await bcrypt.hash(newPassword,10); // hashing the new password

        user.password = hashedPassword; // setting the new hashed password to the user's password field
        user.resetOtp = ''; // clearing the resetOtp field
        user.resetOtpExpireAt = 0; // clearing the resetOtpExpireAt field

        await user.save(); // saving the updated user document to the database

        return res.json({success : true , message : "Password reset successfully"}) // sending a success response
    }
    catch(error){
        return res.json({success : false , message : error.message}) // sending an error response if any exception occurs

    }
}