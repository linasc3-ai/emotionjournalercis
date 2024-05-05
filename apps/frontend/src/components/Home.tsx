import Button from 'react-bootstrap/Button';
import { useNavigate, useLocation } from 'react-router-dom'; 
import { useState, useEffect } from 'react';
import axios from 'axios';
import useSWR from 'swr';
import EntryModal from "./addEntry"
import React from 'react';
import SentimentCard from './sentimentCard'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook } from '@fortawesome/free-solid-svg-icons';
import SentimentCountCard from "./sentimentCount"
import SentimentTrendsChart from "./sentimentTrendsChart"
import NumberCard from "./numberCard"

interface JournalEntry {
  entryTitle: string;
  entryDate: Date;
  author: string;
  general_sentiment: string; 
  general_sentiment_rate: number; 
  entryText: string;
  emotionData: EntryEmotionItem[];
}

interface EntryEmotionItem {
  segment: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  sentiment_rate: number 
}


function Home() {
    // state for whether user is logged in or loggd out 
    const [loggedIn, setLoggedIn] = useState(false)

    // only one question will be selected at any given time for display, so add state 
    const [displayedEntry, setDisplayedEntry] = useState<JournalEntry | null>(null);

    // state for whether to show modal
    const [showModal, setModalShow] = useState(false);

    // state for username 
    const [usersName, setUsersName] = useState("");

    const navigate = useNavigate(); 

    // receive number of ession counts from chatbot 
    const location = useLocation();
    const sessionCount = location.state || 0;

    // every time page renders, check whether user is logged in 
    // and update state to decide whether or not we should show 
    // certain view 
      
    useEffect(() => {
        const fetchAuthStatus = async () => {
            try {
                const response = await axios.get('/api/account/auth/status');
                setLoggedIn(response.data.loggedIn);
                setUsersName(response.data.user.username);
            } catch (error) {
                console.error('Error fetching auth status:', error);
            }
        };
    
        fetchAuthStatus();
    }, []);

    // navigate to log in when you click the log in button 
    const routeChange = () => {
        navigate("/login")
    }

    // send open modal, then you also need to handle modal by sending post request to add new question 
    const addNewEntry = () => {
        setModalShow(true) // when user clicks button, trigger modal to show 
    }

    // handle logging out 
    const handleLogOut = async () => {
        setLoggedIn(false);
        try {
            const res = await axios.post("/api/account/logout");
            console.log(res);
            console.log(res.data);
        } catch (error) {
            console.error('There was an error!', error);
            setLoggedIn(true);
        }
    };



    // retrieve JSON of entries objects 
    const fetcher = async (url: string) => {
        const res = await axios.get(url);
        return res.data;
      };

    // destructure JSON object to retrieve data returned from fetcher 
    const { data } = useSWR('/api/entries/fetch', fetcher, { refreshInterval: 2000 })

    // refreshInterval will automatically fetch every 2 seconds 

       // function to determine text color based on sentiment 
       const getColor = (sentiment) => {
        switch (sentiment) {
            case 'Positive':
                return 'green';
            case 'Negative':
                return 'red';
            case 'Neutral':
                return 'yellow';
            default:
                return 'black'; // Default color if no sentiment is detected
        }
    };

    // handle clicking on card 
    const handleCardClick = (entry) => {
        setDisplayedEntry(entry); // update question to display based on click 
    }

  // eslint-disable-next-line unicorn/prefer-ternary
  if (loggedIn) { 
    return (
    <> 
 <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', alignItems: 'center', backgroundColor: "lightblue" }}>
    <div className="header" style={{ 
      width: '100%', 
      padding: '20px', 
      backgroundColor: '#0A2472', 
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      color: "white", 
      textAlign: 'center' 
    }}>
       <h1 style={{ margin: 0 }}>
       <FontAwesomeIcon icon={faBook} /> MoodScribe 
    </h1>
      <h4 style={{padding: "20px"}}> Your all-in-one emotion journaling app. </h4> 
      <h5> Hi {usersName}! </h5> 
      <Button variant="primary" onClick={handleLogOut} style={{ marginTop: '10px' }}>
        Log Out
      </Button>
    </div>

    <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', marginTop: '20px', width: '90%', maxWidth: '1200px' }}>
      <div className='left-pane' style={{ 
        flex: 1, 
        backgroundColor: '#fff', 
        padding: '20px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)', 
        overflowY: 'auto', /* if there are many entries, enable scrolling */
        height: '600px', /* Fixed height for scroll */
      }}>

    <Button variant="primary" onClick={addNewEntry} style={{ marginBottom: '20px' }}>
          Add New Journal Entry 
        </Button>

        <p> Click to view entry details. </p> 

        <div>
         {data && data.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {data.map((entry) => (
                      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions, jsx-a11y/no-noninteractive-element-interactions
                        <li key={`${entry.entryTitle}-${entry.entryDate}`} style={{ marginBottom: '10px' }} onClick={() => handleCardClick(entry)}>
                            <div className="card" style={{ padding: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                <h3>{entry.entryTitle}</h3>
                                <p>{new Date(entry.entryDate).toLocaleDateString()} - by {entry.author}</p>
                                <div style={{ marginTop: '10px', fontWeight: 'bold', overflow: 'hidden' }}>
    <SentimentCard sentimentName={entry.general_sentiment} percentage={entry.general_sentiment_rate} color={getColor(entry.general_sentiment)} />
</div>

                                </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No journal entries yet. Add a new journal entry to begin!</p>
            )}
        </div>

        {/* only show the modal when state is true, also closing makes modal not show by setting state to false*/}
        <EntryModal
        show={showModal}
        handleClose={() => setModalShow(false)}
      />

    </div>

    <div className="right-pane" style={{ 
        flex: 2, 
        backgroundColor: '#fff', 
        padding: '20px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)', 
        overflowY: 'auto', /* if content is too long, enable scrolling */
        height: '600px', /* Fixed height for scroll */
      }}>
        {/* display selected entry */}
        
        {displayedEntry ? (
          <>
             <div className="card" style={{ padding: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                <h3>{displayedEntry.entryTitle}</h3>
                                <p>{new Date(displayedEntry.entryDate).toLocaleDateString()} - by {displayedEntry.author}</p>
                                
                                <div style={{ marginTop: '10px' }}>
                                <h5> <em> Written Entry </em> </h5> 
                                {displayedEntry.emotionData && displayedEntry.emotionData.map((item, index) => (
                                    <b key={index} style={{ color: getColor(item.sentiment) }}>
                                        {item.segment} 
                                    </b>
                                ))}
                                </div> 
                                <div style={{ marginTop: '30px' }}>
                                  <h5> <em> Overall Entry Sentiment </em> </h5> 
                                  <p> This tells you how positive or negative this journal entry is! </p> 
                                  <div className="card-content" style={{ padding: '10px', overflow: 'hidden' }}>
    <SentimentCard sentimentName={displayedEntry.general_sentiment} percentage={displayedEntry.general_sentiment_rate} color={getColor(displayedEntry.general_sentiment)} />
</div>

                                </div>
                            </div>
          </>
        ) : "Click an entry to view further emotion details."}

      {/* also in right pane, let's display chart of emotions over time */}
    <div style={{padding: "20px"}}>
    <SentimentCountCard />
    </div> 
    <div style={{padding: "20px"}}>
    <SentimentTrendsChart/> 
    </div> 
    <div style={{padding: "20px"}}>
    <h5> # Journaling Sessions </h5>
    <NumberCard sessionCount={sessionCount}/> 
    </div>

    </div> 
    </div> 
    </div> 

    </>
    
    );  
  } else { // user is logged out
    return (
    <>
   <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', alignItems: 'center', backgroundColor: "lightblue" }}>
    <div className="header" style={{ 
      width: '100%', 
      padding: '20px', 
      backgroundColor: '#0A2472', 
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      color: "white", 
      textAlign: 'center' 
    }}>
       <h1 style={{ margin: 0 }}>
       <FontAwesomeIcon icon={faBook} /> MoodScribe 
    </h1>
    <h4 style={{padding: "20px"}}> Your all-in-one emotion journaling app. </h4> 
      </div> 

      <div style={{ 
        marginTop: '50px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center'
      }}>


    <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', marginTop: '20px', width: '90%', maxWidth: '1200px' }}>
      <div className="newPane" style={{ 
        flex: 1, 
        backgroundColor: '#fff', 
        padding: '20px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)', 
        overflowY: 'auto', /* if there are many entries, enable scrolling */
        height: '600px', /* Fixed height for scroll */
      }}>

<Button className="primary" onClick={routeChange} style={{ marginBottom: '20px', width: '200px' }}>
          Log in to start journaling!
        </Button>    
  
      <h4> What is MoodScribe? </h4> 
                   <p> MoodScribe is here to help you be more in-tune with your emotions. Unlike other journaling apps, it can help you identify
                    your emotional triggers by identifying negative and positive words in your writings. It also shows you summary graphs, 
                    so you can see how your emotions have changed over time! </p>
        </div>
        </div>  
        </div> 
        </div> 
        </>
        )} 
}

export default Home;