import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';

interface EntryModalProps {
    show: boolean;
    handleClose: () => void;
  }


const EntryModal: React.FC<EntryModalProps> = ({ show, handleClose }) => {
  const [entryTextInfo, setEntryText] = useState("");
  const [entryTitle, setEntryTitle] = useState("");

  const submitEntry = (e) => {
    e.preventDefault();

    // try to post a journal entry  
    axios.post('/api/entries/add', { entryTitle: entryTitle, entryText: entryTextInfo })
      .then(res => {
        console.log(res.data);
      
        // perform analysis on emotion data using the id of the newly added object and the text of the actual journal entry 
        return axios.post('/api/entries/analysis', { entryTitle: entryTitle, entryText: entryTextInfo });
      })
      .then(analysisRes => {
        console.log(analysisRes.data);
        // print the sentiment analysis data in the console 
      })
      .catch(error => {
        console.error('Error submitting entry!', error);
        // error handling 
        alert("Failed to submit entry. Please try again.");
      });

      // Close the modal after submission
      handleClose();

      // clear form for next user input 
      setEntryText('');
      setEntryTitle('');
  }

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add New Journal Entry</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={submitEntry}>
          <Form.Group className="mb-3" controlId="entryTitleInput">
            <Form.Label>Entry Title</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your journal entry title here"
              value={entryTitle}
              onChange={(e) => setEntryTitle(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="entryTitleInput">
            <Form.Label>Entry Text</Form.Label>
            <Form.Control
              as="textarea" 
              rows={8} 
              type="text"
              placeholder="Enter your journal entry here"
              value={entryTextInfo}
              onChange={(e) => setEntryText(e.target.value)}
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            Submit Entry
          </Button>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EntryModal;