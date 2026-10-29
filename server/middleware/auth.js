import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Not authorized, no token" });
        }

        const token = authHeader.split(" ")[1];      // Splits Bearer and token then choose, token idx 1
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.userId = decoded.id;              // I set user id here for getUser in authController.
        next();                       // If authent.n fails, next() is never called, so getUser doesn't run.
    } catch (error) {
        console.error("Auth middleware error:", error.message);
        return res.status(401).json({
            success: false, 
            message: "Not authorized, token failed" 
        });
    }
};

export default auth;









{/*
    Your login function gives the user a JWT; your authentication middleware checks that JWT on future requests.

    next = Passes control to the next middleware or route handler.

    After verification, decoded contains the payload and JWT metadata, including the expiration information.

    Authorization → The credentials used to authenticate the request.

    Q- Where does req.headers.authorization come from?
        Whenever your frontend sends a request to your backend, it can include HTTP headers containing additional information.

    Simple term explainations:
        req.headers → Contains the HTTP headers sent with a request.
        req.headers.authorization → Retrieves the Authorization header, if present.
        Bearer → Identifies the authentication scheme used to send the token.
        Frontend → Adds the JWT to requests that require authentication.
        startsWith("Bearer ") → Checks the expected header format.
        jwt.verify() → Verifies the token's signature and expiration.
        next() → Allows the request to proceed after successful authentication.

    Complete Flow:
        Step 1: User logs in
        Step 2: Backend verifies the credentials
        Step 3: Backend returns a JWT
        Step 4: Frontend sends a request for the profile
        Step 5: Authentication middleware reads the header
        If verification succeeds, the middleware continues to the route handler.
*/}