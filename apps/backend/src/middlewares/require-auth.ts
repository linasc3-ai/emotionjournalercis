// install cookie-session 
// can help us access session associated with the request 
// handles session data on client side using cookies ... gives us way to not have to store the session details on the server 
// executed before HTTP request handled by route handler 
// you have a HTTP request (e.g. post), give it to a route to handle 
// before that, execute middlewares 
// routes can result in changes to the database entries 

import { Request, Response, NextFunction } from 'express';

function requireAuth(req: Request, res: Response, next: NextFunction) {
  // check to see if user is defined in session object 
    const potentialUser = req.session?.user?.username;

    // if null or not empty string 
    if (!potentialUser || potentialUser === "") {
        // no username in session = not logged in 
        next(new Error("Unauthorized: You must be logged in.")); // throw an error 
    } else {
        // allow request to continue without any error parameters passed
        next(); 
    }
}

export default requireAuth; 