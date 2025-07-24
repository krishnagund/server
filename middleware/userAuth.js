// so actully we need this folder and file for taking user id from the token and checking if the user is authenticated or not and that wil we get from the token in the cookie
import jwt from 'jsonwebtoken'; // importing the jsonwebtoken library for token verification

const userAuth = (req, res, next) => {
    const {token} = req.cookies; // extracting the token from the cookies in the request

    if(!token){   
        return res.json({success: false, message: "Unauthorized login again"}); // if no token is found, return unauthorized response
    }
   try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

    if(tokenDecode.id){
        req.userId = tokenDecode.id; 
        next();
    }else{
        return res.json({ success: false, message: "Not Authorized. Login Again" });
    }

} catch (error) {
    return res.json({ success: false, message: error.message });
}

}


export default userAuth; // exporting the userAuth middleware to be used in other parts of the application