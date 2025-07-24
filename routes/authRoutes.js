import express from 'express';
const authRouter = express.Router(); // creating a new router instance for authentication routes
import { register, login, logout, sendVerifyOtp, verifyEmail,isAuthenticated, sendResetOtp, resetPassword } from '../controllers/authController.js'; // importing the register and login controller functions
import userAuth from '../middleware/userAuth.js'; // importing the userAuth middleware for authentication checks

authRouter.post('/register', register); // defining a POST route for user registration
authRouter.post('/login', login); // defining a POST route for user login
authRouter.post('/logout', logout); // defining a GET route for user logout
authRouter.post('/send-verify-otp',userAuth,sendVerifyOtp);// defining a POST route for sending verification OTP, protected by userAuth middleware
authRouter.post('/verify-account',userAuth,verifyEmail); // defining a POST route for verifying user account, protected by userAuth middleware
authRouter.get('/is-auth',userAuth,isAuthenticated); // defining a POST route to check if the user is authenticated, protected by userAuth middleware
authRouter.post('/send-reset-otp',sendResetOtp); // defining a POST route for sending reset OTP, protected by userAuth middleware
authRouter.post('/reset-password',resetPassword);
export default authRouter; 




// we have to add this authrouter file in server.js file cause server.js is the main entry point of the application

