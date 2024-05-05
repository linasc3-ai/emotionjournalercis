import React from 'react';

// recieve a number of journal sessions as a props 
// eslint-disable-next-line react/prop-types
function NumberCard({ sessionCount }) {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: "20px"
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '70px',
              width: '200px',
              backgroundColor: 'lightblue',
              boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',
              borderRadius: '8px',
              fontSize: '24px',
              color: '#333'
            }}>
        <p> {sessionCount} Sessions </p> 
        </div> 
      </div>
    );
  }
  
  export default NumberCard;