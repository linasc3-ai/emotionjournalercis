import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom'; 
import { useState, useEffect } from 'react';
import axios from 'axios';
import useSWR from 'swr';
import EntryModal from "./addEntry"
import React from 'react';

interface JournalEntry {
  entryTitle: string;
  date: string;
  author: string;
  entryText: string;
  entryEmotion: {
      items: Array<{
          phrase: string;
          sentiment: 'Positive' | 'Negative' | 'Neutral';
      }>;
  };
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



    // retrieve JSON of question objects 
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
            return '#28a745'; // Green
          case 'Negative':
            return '#dc3545'; // Red
          case 'Neutral':
            return '#ffc107'; // Yellow
          default:
            return '#6c757d'; // Grey
        }
      };

    // handle clicking on card 
    const handleCardClick = (question) => {
        setDisplayedEntry(question); // update question to display based on click 
    }

  // eslint-disable-next-line unicorn/prefer-ternary
  if (loggedIn) { 
    return (
    <> 
 <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', alignItems: 'center', backgroundColor: "pink" }}>
    <div className="header" style={{ 
      width: '100%', 
      padding: '20px', 
      backgroundColor: '#A94064', 
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      color: "white", 
      textAlign: 'center' 
    }}>
      <h1 style={{ margin: 0 }}>MoodScribe</h1>
      <h3> Your all-in-one emotion journaling app </h3> 
      <h2> Hi {usersName}! </h2> 
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


        <div>
      {data && data.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {data.map((entry) => (
            <li key={entry.entryTitle + entry.entryDate} style={{ marginBottom: '10px' }}>
              <div className="card" style={{ padding: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h3>{entry.entryTitle}</h3>
                <p>{new Date(entry.entryDate).toLocaleDateString()} - by {entry.author}</p>
                <p>{entry.entryText}</p>
                {entry.entryEmotion && JSON.parse(entry.entryEmotion).items.map((item, index) => (
                  <p key={index} style={{ color: getColor(item.sentiment) }}>
                    {item.phrase} - {item.sentiment}
                  </p>
                ))}
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
            <div className="card" style={{ marginBottom: '20px' }}>
              {/*first display overall emotion score*/}
               {/*then display details of card color coded by sentiment*/} 
              <h5 className="card-title">{displayedEntry.entryTitle}</h5>
              <p><em>Author:</em> {displayedEntry.author}</p>
              <p><em>Date:</em> {displayedEntry.date}</p>
              <p>{displayedEntry.entryText}</p>
              
            </div> 
          </>
        ) : "Click a question to view details."}

    </div> 
    </div> 
    </div> 

    </>
    
    );  
  } else { // user is logged out
    return (
    <>
   <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', alignItems: 'center', backgroundColor: "pink" }}>
    <div className="header" style={{ 
      width: '100%', 
      padding: '20px', 
      backgroundColor: '#A94064', 
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      color: "white", 
      textAlign: 'center' 
    }}>
        <h1 style={{ margin: 0 }}>MoodScribe</h1>
      <h3> Your all-in-one emotion journaling app </h3> 
      </div> 

      <div style={{ 
        marginTop: '50px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center'
      }}>


    <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', marginTop: '20px', width: '90%', maxWidth: '1200px' }}>
      <div className='left-pane' style={{ 
        flex: 1, 
        backgroundColor: '#fff', 
        padding: '20px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)', 
        overflowY: 'auto', /* if there are many entries, enable scrolling */
        height: '600px', /* Fixed height for scroll */
      }}>

<Button variant="primary" onClick={routeChange} style={{ marginBottom: '20px', width: '200px' }}>
          Log in to start journaling!
        </Button>

        {data && data.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px' }}>
            {data.map((entry) => (
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
              <div key={entry.id} className="card" style={{ padding: '20px', width: '200px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', cursor: 'pointer'}} onClick={() => handleCardClick(entry)}>
                <h5 className="card-title">{entry.entryText}</h5>
              </div>
            ))}
          </div>
        ) : (
          <p>No entries yet. Log in to start journaling!</p>
        )}
    </div> 
        {/* conditionally display based on which question selected 
        if there is something selected, display it, otherwise tell them to select */}
        <div className="right-pane" style={{ 
      flex: '1', 
      backgroundColor: '#fff', 
      padding: '20px', 
      overflowY: 'auto' /* if content is too long, enable scrolling */
    }}>
                    {displayedEntry ? (
                        <div className="card">
                          <h5 className="card-title">{displayedEntry.entryTitle}</h5>
              <p><em>Author:</em> {displayedEntry.author}</p>
              <p><em>Date:</em> {displayedEntry.date}</p>
              <p>{displayedEntry.entryText}</p>
                        </div>
                    ) : "Click a question to view details."}
        </div>
        </div> 
        </div> 
        </div> 
        </>
        )} 
}

export default Home;