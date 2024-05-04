import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { Link, useNavigate } from 'react-router-dom'; 
import { useState } from 'react';
import axios from 'axios';


function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate(); 

   // update for log in 

    const handleSubmit = event => {
        event.preventDefault(); 
        
        // format user in object database expects 
        const user = {
            username: username, 
            password: password
        };

        axios.post("/api/account/login", user) // send post request with username and password to attempt to log in 
            .then(res => {
                console.log(res); 
                console.log(res.data);
                navigate("/") 
                // go to home page if successful 
            })
            .catch(error => {
                // alert if failed 
                console.error('There was an error!', error);
                alert("Failed to log in. Please try again.");
            });


    }

  return (
    <div className="Login" style={{backgroundColor: "#e75480", padding: '500px', color: "white"}}> 
    <><h1 style={{marginBottom: '10px'}}> Log In </h1>
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
              Log in
          </Button>

          <p style={{marginTop: "10px"}}> Do not have an account? </p>
          <Link to="/signup" style={{color: "blue"}}>Sign up here.</Link>

      </Form></>
      </div> 
  );
}

export default Login;
