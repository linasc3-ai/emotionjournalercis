import 'bootstrap/dist/css/bootstrap.min.css';
import Home from './components/Home';
import Login from './components/Login';
import SignUp from './components/SignUp';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './app.css';
import Chatbot from './components/chatbot'

function App() {

  return (

    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/moodbot" element={<Chatbot />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
