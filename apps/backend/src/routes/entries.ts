// handle journal entries 

import express from 'express';
import JournalEntry from '../models/entry';
import requireAuth from '../middlewares/require-auth'
import axios, { AxiosRequestConfig } from 'axios'; // require axios for use with sentiment analysis API 

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
        console.log(newEntry)
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
// utilizes EDEN API text sentiment analysis
// https://app.edenai.run/bricks/text/sentiment-analysis 

router.post('/analysis', async (req, res, next) => {

    // need the id to be able to identify which post to add the emotion data to 
    const {_id, entryText} = req.body; 

    // url is url to which post request is sent 
    // method specifies this is a post request 
    // headers - set header to provide the authorization aka the API key needed by eden
    // send the body of the post request
    // providers specifies the sentiment analysis providers to use
    // provide the actual text to analyze 
    const options: AxiosRequestConfig = {
        method: 'POST',
        url: 'https://api.edenai.run/v2/text/sentiment_analysis',
        headers: {
            authorization: process.env.EDEN_API_KEY ?? '',
        },
        data: {
            providers: ['google'],  
            // pass in users journal entry to API 
            text: entryText,
            language: 'en'
        }
    };

    // send the actual HTTP request in options object 
    // axios is promise-based HTTP client for making requests from node.js
    // using axios to interact with extenral API 
    // wait for response, whci his either resolved or rejected
    // if resolved, store in response variable
    // if successful, give 200 ok 

    
    try { 
        
        const entry = await JournalEntry.findById(_id); // need to use mongo's FindById method to search our questions to see if one matches specified id 

        if (!entry) { 
    // if we couldn't find the entry matching the id, then we need to return not found error 
    return res.status(404).send({message: "Entry not found."});

    }
        // receive response from eden API 
        const response = await axios.request(options); 

        // // store emotion data ... but fix because we need to store only the string part to match the data type 
        // entry.entryEmotion = response; 
        // await entry.save(); // save changes to this entry in mongo 

        res.status(200).json(response.data); 
        // send data as json response 

        // otherwise, catch error and pass into error handler 
    } catch (error) { 
        next(error); 
    }
}); 

export default router;