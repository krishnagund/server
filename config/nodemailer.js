import nodemailer from 'nodemailer'; // for sneding the confirmation emails 

const transporter = nodemailer.createTransport(    // Create a transporter object using the default SMTP transport
    {
        host: 'smtp-relay.brevo.com', // SMTP server host
        port: 587, // SMTP server port
        auth :{
            user: process.env.SMTP_USER, // SMTP user from environment variables
            pass: process.env.SMTP_PASSWORD // SMTP password from environment variables
            
        }
    }
)

export default transporter;