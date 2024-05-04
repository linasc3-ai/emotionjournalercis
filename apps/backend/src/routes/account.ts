// handle user login 

import express from 'express';
import User from '../models/user';
import requireAuth from '../middlewares/require-auth'; 

// create router
const router = express.Router(); 

// post route for signup with body of username and password 
router.post('/signup', async (req, res, next) => {
    const {username, password} = req.body; 

    // make sure username and password exist
    if (!username || !password) {
        return res.status(400).send({message: "You must provide a username and password."});
        // 400 bc bad request due to client error
    }

    // now let's actually try to add the user
    try { 
        const sameUser = await User.findOne({username}); // look for user with matching username as this user 
        if (sameUser) { // if this username is already taken, send bad request client error message telling them to get another username 
            return res.status(401).send({message: 'User with this name already exists.'});
        }
        const newUser = new User({username, password, logStatus: true}); // if user doesn't exist already, we can create new one!
        await newUser.save(); // save the user in database
        // let user know it succeeded
        if (req.session) { // if user signup succeeded, they should also be added to the session 
            req.session.user = {id: newUser._id.toString(), username: newUser.username, logStatus: newUser.logStatus};
            res.status(201).send({message: "Successfully created user"})
        }
    } catch (error) {
        // handle any errors
        next(error); // throw error with next(error)
    }
})

// post route for login with body of username and password 

router.post('/login', async(req, res, next) => {
    const {username, password} = req.body; 

    const user = await User.findOne({username}); 
     // make sure user exists 
     if (!user) {
        res.status(401).send({message: "User does not exist"});
        // 401 bc bad request due to client error
    } else if (req.session?.user?.username) {
        // if already a session for this user, they are alraedy logged in 
        res.status(201).send({message: "User is already logged in."})
    } else { 
    try {
        // check that password is correct 
        // match stores true / false 
        const match = await user.checkPassword(password); // check if password is correct, derived from the schema method we defined  

        if (match) { // if password does match, generate a session upon successful login 
            user.logStatus = true; 
            await user.save(); 

            if (req.session) { 
                req.session.user = {id: user._id.toString(), username: user.username, logStatus: true};
                res.status(200).send("Login successful.");
            }
        } else {
            // wrong password 
            res.status(401).send("Wrong password.");
        }
    } catch (error) {
        next(error); // pass error to centralized handler 
    }
    } 
})

// post route for logout 
// need requireAuth because user must be logged in before logging out (check that user is defined in session object)
router.post('/logout', requireAuth, (req, res, next) => {
    // clear session so no user info retained in it 
   try { req.session = null; 
    // send response indicating logged out 
    res.send({message: "Successfully logged out"}); 
   } catch (error) {
    next(error);
   }
});

router.get('/auth/status', (req, res) => {
    if (req.session && req.session.user) {
        // User is logged in
        res.status(200).send({
            loggedIn: true,
            user: {
                id: req.session.user.id,
                username: req.session.user.username
            }
        });
    } else {
        // User is not logged in
        res.status(200).send({ loggedIn: false });
    }
});



export default router; 