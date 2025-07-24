import express from 'express'; // used for creating the server and handling requests
import cors from 'cors'; // used for enabling CORS and allowing cross-origin requests meaning requests from different origins
import 'dotenv/config' ;  // used for loading environment variables from a .env file
import cookieParser from 'cookie-parser'; // used for parsing cookies in requests meaning it allows us to read cookies sent by the client
import connectDB from './config/mongodb.js'; // importing the connectDB function from the mongodb.js file to connect to the MongoDB database
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import bodyParser from 'body-parser';


const app = express(); // used for parsing the body of incoming requests
const port = process.env.PORT || 4000;

connectDB(); // calling the connectDB function to connect to the MongoDB database when the server starts

const allowedOrigins = ['http://localhost:5173']; // defining the allowed origins for CORS
app.use(express.json()); // used for parsing JSON bodies in requests
app.use(cookieParser()); // used for parsing cookies in requests
app.use(bodyParser.urlencoded({ extended: true })); // used for parsing URL-encoded bodies in requests
app.use(cors({origin:allowedOrigins,credentials:true}));



// Api enpoints
app.get('/',(req,res) => 
 res.send('API working')
); 

app.use('/api/auth',authRouter) // using the authRouter for handling authentication routes
app.use('/api/user',userRouter)



app.listen(port,()=> console.log(`server started on the port : ${port}`)); // starts the server and listens on the specified port