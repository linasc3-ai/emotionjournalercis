// handle journal entries 

import express from 'express';
import JournalEntry from '../models/entry';
import requireAuth from '../middlewares/require-auth'
import axios from 'axios';  // require axios for use with sentiment analysis API 

// create router
const router = express.Router(); 

// route for ADDING an entry 
// must be logged in to add journal entry 
router.post('/add', requireAuth, async (req, res, next) => {
    
    const {entryTitle, entryText} = req.body; 

    // receive from the request the question details 
    // includes title, text 
    // first make sure req.session isn't null before trying to access
    if (!req.session) {
        return res.status(401).send({message: "Session is not initialized"});
    }

     // get date from cookie session also 
    // if date null, add new date to req.session 
    if (!req.session.date) {
        req.session.date = new Date().toISOString();  // Store the date when the journal entry is being created
      }

    const entryDate = req.session.date

    // get author from cookie session
    const author = req.session?.user?.username

    // make sure the details exist 
    if (!entryTitle || !entryText || ! author) {
        return res.status(400).send({message: "You must provide all journal entry details and/or be signed in."});
        // if they don't exist, 400 bc bad request due to client error
    }

    // now let's actually try to add the entry 

    try { 
        const newEntry = new JournalEntry({entryTitle, entryDate, entryText, author}); 
        await newEntry.save(); // save the entry in database
        // let user know it succeeded
        res.status(201).send({message: "Successfully added entry."})
    } catch (error) {
        // handle any errors
        next(error);
    }
}) 


// route for fetching all journal entries 
router.get('/fetch', async (req, res, next) => {

    try { 
        const entries = await JournalEntry.find({}); // pull anything that is of JournalEntry model 
        res.status(200).json(entries); // if successful, indicate so by returning all entries in JSON format 
    } catch (error) { 
        // if error getting questions, indicate so to user with server side error message 
        next(error); 
    }
}) 

// router for getting emotion data for entry 
// utilizes EDEN API 
router.post('/analysis', async (req, res, next) => {
    const {entryText} = req.body; 

    const options = { 
        method: 'POST', 
        url: 'https://api.edenai.run/v2/text/sentiment_analysis',
        headers: {
            authorization: process.env.EDEN_API_KEY,
        }, 
        data: {
            providers: 'ibm, google', 
            // pass in user's journal entry text in to API 
            text: entryText,
            language: 'en'
        }
    }; 

    try { 
        // receive response from eden API 
        const response = await axios.request(options); 
        res.status(200).json(response.data); 
        // send data as json response 
    } catch (error) { 
        next(error); 
    }
}); 

export default router;