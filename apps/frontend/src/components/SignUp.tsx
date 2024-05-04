import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { Link, useNavigate } from 'react-router-dom'; 
import { useState } from 'react';
import axios from 'axios';

function SignUp() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate(); 

    // login sends POST request to backend /acount/login
    // link that, once clicked, sends user to /signup page 

    // successful log in => go to home page
    // failed to log in => alert and remain on login 

    const handleSubmit = event => {
        event.preventDefault(); 
        
        // format user in object database expects 
        const user = {
            username, 
            password, 
            logStatus: true
        };

        axios.post("/api/account/signup", user) // send post request to add new user to database 
            .then(res => {
                console.log(res); 
                console.log(res.data);
                navigate("/") 
                // go to home page if successful 
            })
            .catch(error => {
                // alert if failed 
                console.error('There was an error!', error);
                alert("Failed to sign up. Please try again.");
            });


    }

  return (
    <div className="SignUp" style={{backgroundColor: "#e75480", padding: '500px', color: "white"}}> 
    <><h1 style={{padding: "15px"}}> Sign Up </h1>
    <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Username:</Form.Label>
              <Form.Control type="textarea" placeholder="Enter username" value={username} onChange={e => setUsername(e.target.value)}/>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password:</Form.Label>
              <Form.Control type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}/>
          </Form.Group>

          <Button variant="primary" type="submit">
              Sign Up
          </Button>

          <p style={{padding: '10px'}}> Already have an account? </p>
          <Link to="/login" style={{color: "blue"}}>Sign in here.</Link>

      </Form></>
      </div> 
  );
}

export default SignUp;
