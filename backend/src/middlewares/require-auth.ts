// cooke session powered authentication of username 

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