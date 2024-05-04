import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFaceSmile, faFaceSadTear, faFaceMeh } from '@fortawesome/free-regular-svg-icons'; // Import specific icons

// eslint-disable-next-line react/prop-types
function SentimentCard({ sentimentName, percentage, color }) {
    const cardStyles = {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: color,
      borderRadius: '10px',
      color: 'white',
      padding: '10px 10px',
      margin: '20px',
      width: '300px',
      fontSize: '16px'
    };

    const getIcon = (sentimentName) => {
        switch (sentimentName) {
          case 'Positive':
              return faFaceSmile; // Return the actual icon object
          case 'Negative':
              return faFaceSadTear;
          case 'Neutral':
              return faFaceMeh;
          default:
              return null; // Return null if no icon matches
        }
    };

    return (
        <div style={cardStyles}>
          <span><FontAwesomeIcon icon={getIcon(sentimentName)} /> {sentimentName}</span>
          <span>{percentage}%</span>
        </div>
    );
};

export default SentimentCard;
