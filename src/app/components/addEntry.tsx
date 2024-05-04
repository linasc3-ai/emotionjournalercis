"use client";

import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';

interface EntryModalProps {
    show: boolean;
    handleClose: () => void;
  }

const EntryModal: React.FC<EntryModalProps> = ({ show, handleClose }) => {
  const [entry, setEntry] = useState("");
  const [entryTitle, setEntryTitle] = useState("");

  const submitEntry = (e) => {
    e.preventDefault();

    // try to post question 
    axios.post('/api/entries/add', { entryTitle: entryTitle, entryText: entry}).then(res => {
      console.log(res); 
      console.log(res.data);
  }).catch(error => {
      console.error('Error submitting entry!', error);
      alert("Failed to submit entry. Please try again.");
  });
      // Close the modal after submission
      handleClose();

      // clear form for next user input 
      setEntry('');
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
              onChange={(e) => setEntry(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="entryTitleInput">
            <Form.Label>Entry Text</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your journal entry here"
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
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