// use npm install @chatscope/chat-ui-kit-react to build out UI interface for chatbot
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import {useState, useEffect} from 'react';
import useSWR from 'swr';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css'; // import chatbot styling 
// import specific UI elements 
import {MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator} from '@chatscope/chat-ui-kit-react'
import {MessageDirection} from "@chatscope/use-chat";
import process from 'process';
import Button from 'react-bootstrap/Button';

window.process = process;

function Chatbot() {

    const navigate = useNavigate(); 

    // Use SWR's isLoading or error for Conditional Rendering: to control the rendering logic.
    
    // states
    const [messages, setMessages] = useState([]);
    const [sessionCount, setCount] = useState(0);

    const routeChange = () => {
        const newCount = sessionCount + 1; 
        setCount(newCount); // update the count 
        navigate("/", { state: { sessionCount: newCount } });// send count back so we can display it 
    }

    const { data, error, isValidating } = useSWR('/api/entries/fetch', fetcher, { revalidateOnFocus: false });

    function fetcher(url) {
        return axios.get(url).then(res => res.data);
    }

    const apiKey = "sk-proj-gKQAIgiuVYYkf6bWhXIlT3BlbkFJ6Kkc1Z3qG6S9qMqM8eqs"
    const [typing, setTyping] = useState(false)

    // wait for message 
    // when message sent, create message object 
    const handleSend = async (message) => {
        const newMessage = {
            message: message, // input text 
            sender: "user",
            direction: MessageDirection.Outgoing, // show message on the right,
            position: "single" // default 
        }
        // update messages state

        // create new messages array, it holds all the old messages in state currently aka ...messages 
        // as well as the new message on top 
        const newMessages = [...messages, newMessage];
        setMessages(newMessages);
        
        // set a typing indicator for chat gpt before we actually process result 
        setTyping(true);

        // process message to chatgpt and get response 
        // process with new message 
        await processMessageToChatGPT(newMessages); 
    }

    useEffect(() => {
        if (data && !isValidating) {
            // Setup your chat with initial data
            const initialMessage = {
                message: "Hello, I am MoodBot!",
                sender: "ChatGPT",
                direction: MessageDirection.Outgoing, 
                position: "single"
            };
            setMessages([initialMessage]);
        }
    }, [data, isValidating]);

    if (error) return <div>Error getting entries...</div>;
    if (!data || isValidating) return <div>Loading...</div>;

    // // retrieve JSON of entries objects to pass into gpt 
    // const fetcher = async (url: string) => {
    //     const res = await axios.get(url);
    //     return res.data;
    //   };

    // // destructure JSON object to retrieve data returned from fetcher 
    // const { data } = useSWR('/api/entries/fetch', fetcher, { refreshInterval: 2000 })
    // console.log(data)

    // pass in all messages from chat
    // update here to pass in all journal entry content 
    async function processMessageToChatGPT(chatMessages) {
        // need to reformat data in way chatgpt understands

        const apiMessages = chatMessages.map((messageObject) => {
            let role = "" 
            role = messageObject.sender === "ChatGPT" ? "assistant" : "user";
            return {role: role, content: messageObject.message}})
        // array of objects in format API wants 

        const systemMessage = { 
            role: "system", 
            // gives context for how chat gpt responds 
            content: `Act like a mental health therapist using your knowledge of this persons past journal entries ${data}`
             // prompt that defines how language comes out of chatgpt
        }
        
        const apiRequestBody = {
            "model": "gpt-3.5-turbo",
            "messages": [
                systemMessage, // put system message in front of all messages so it always has that context 
                ...apiMessages // contains all the messages 
            ]
        }

        console.log(`Bearer ${apiKey}`)

        await fetch("https://api.openai.com/v1/chat/completions", {
            // parameters for request
            method: "POST", 
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(apiRequestBody)
        }).then((data) => {
            // return data as json 
            return data.json();
        }).then((data) => {
            console.log(data)
            console.log(data.choices[0].message.content) // the response message itself 
            setMessages( // the past messages and the new message 
            // add new message into messages 
                [...chatMessages, {
                    message: data.choices[0].message.content, 
                    sender: "ChatGPT",
                    direction: MessageDirection.Incoming, 
                    position: "single"
                }]
            );
            setTyping(false); // we got API response, so no longer typing 
        });
    }
    
    // every message in array gets message component 
    // when user submits message, call handleSend 
    return (
    <div style={{position: "relative", height: "1000px", width: "1000px", backgroundColor: "lightblue", padding: "20px"}}>
        <h2> Welcome to Moodbot! </h2> 
        <p> Moodbot is here to help you better reflect on what you have written in your journal entries. </p> 
        <p> Simply start discussing anything you have written, and Moodbot is here to discuss for however long you need!</p> 

        <Button className="primary" onClick={routeChange} style={{ marginBottom: '20px', width: '200px' }}>
          Done Journaling 
        </Button>   

        <MainContainer> 
            <ChatContainer> 
                <MessageList
                    scrollBehavior="smooth"
                    typingIndicator={typing ? <TypingIndicator content="MoodBot is typing"/> : null}
                    >
                    {messages.map((message, index) => {
                        return <Message key={index} model={{
                            message: message.message,
                            sender: message.sender,
                            direction: message.direction,
                            position: 'single'
                        }} /> 
})}
                </MessageList> 
                <MessageInput placeholder="Type message here" onSend={handleSend}/> 
            </ChatContainer> 
        </MainContainer> 
    </div>

    )
}

export default Chatbot;