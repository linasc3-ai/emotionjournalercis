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

        // send back all data after creating the new object
        // we need to use the id in the analysis route 
        res.status(201).send({
            _id: newEntry._id,
            entryTitle: newEntry.entryTitle,
            entryText: newEntry.entryText,
            entryDate: newEntry.entryDate,
            author: newEntry.author,
            message: "Successfully added entry."
        });

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
    const {entryTitle, entryText} = req.body; 

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
        // Find the journal entry by _id
        const entry = await JournalEntry.findOne({ entryTitle: entryTitle });

        // if no journal entry with that ID, send 404 error 
        if (!entry) {
            return res.status(404).send({ message: "Entry not found." });
        }

        // Send the request to the sentiment analysis API
        const response = await axios.request(options);

        if (response.data) {
            // Update the entry with the sentiment analysis data
            entry.general_sentiment = response.data.google.general_sentiment; 
            entry.general_sentiment_rate = response.data.google.general_sentiment_rate;
            entry.emotionData = response.data.google.items;
              
            await entry.save(); // Save the updated entry
            res.status(200).json(entry); // Respond with the updated entry data and send 200 status code 
        } else {
            res.status(500).send({ message: "Failed to store analyzed sentiment." });
        }
    } catch (error) {
        console.error("Failed to process sentiment analysis:", error);
        next(error); // Pass the error to the next middleware error handler 
    }
});

// new route to streamline process of getting counts of each type of emotion 
router.get('/sentiment-count', async (req, res, next) => {
    try {
        // use built in count documents in mongo to count number of entries for each of the 3 sentiment categories 
        const positiveCount = await JournalEntry.countDocuments({ general_sentiment: 'Positive' });
        const negativeCount = await JournalEntry.countDocuments({ general_sentiment: 'Negative' });
        const neutralCount = await JournalEntry.countDocuments({ general_sentiment: 'Neutral' });

        // send this data back to frontend 
        res.status(200).json({
            positive: positiveCount,
            negative: negativeCount,
            neutral: neutralCount
        });
    } catch (error) {
        console.error('Error getting sentiment counts:', error);
        next(error);
    }
});

export default router;