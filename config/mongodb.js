// in this file we are writing the code to connect to the MongoDB database using mongoose
import mongoose from "mongoose";
   
const connectDB = async () => {

mongoose.connection.on( "connected",()=> 
console.log("Database connected"))

    await mongoose.connect(`${process.env.MONGODB_URI}/mern-auth`);
}


export default connectDB; // exporting the connectDB function so it can be used in other files
// this function will be used to connect to the MongoDB database when the server starts  in the server.js file