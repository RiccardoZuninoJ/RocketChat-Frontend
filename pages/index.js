import Head from 'next/head'
import Image from 'next/image'
import io from 'socket.io-client'
const ENDPOINT = "http://127.0.0.1:4001"
import { useEffect, useState, useRef } from 'react'
import Navigation from './components/Navigation'
import { InputGroup, FormControl, Button, Form } from 'react-bootstrap'
import { disconnect } from 'process'
import Message from './components/Message'

export default function Home() {
  const [messages, setMessages] = useState([])
  const [socket, setSocket] = useState(null)
  const [socketID, setSocketID] = useState(null)

  const messageText = useRef(null)

  useEffect(() => {
    const socket = io(ENDPOINT)
    setSocket(socket)
    socket.on("connect", () => {
      console.log("Connected")
      console.log(socket.id)
      setSocketID(socket.id)
    })
    socket.on("msg_broadcast", data => {
      console.log(data)
      setMessages(messages => [...messages, data])
    })
    return () => {
      socket.disconnect()
    }
  }, [])

  const sendMessage = (e) => {
    e.preventDefault()
    socket.emit('msg_broadcast_sent', { from: socketID, text: messageText.current.value })
    messageText.current.value = ''
  }

  return (
    <div>
      <Navigation socketID={socketID}></Navigation>
      <div className="container">
        <h5>Broadcast Room</h5>
        {messages.map((message, index) => {
          if (message.from === socketID) {
            return (
              <Message msg={message} sent={message.from === socketID}></Message>

            )
          }
          else {
            return (
              <Message msg={message} sent={message.from === socketID}></Message>
            )
          }
        })}
      </div>
      <div fixed="bottom" className="bg-primary fixed-bottom px-4 pt-4 justify-content-center">
        <Form onSubmit={(e) => sendMessage(e)}>
          <InputGroup>
            <InputGroup.Text id="basic-addon1">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-chat-left-text" viewBox="0 0 16 16">
                <path d="M0 1a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V1zm1 0v14h14V1H1z" />
                <path d="M4 6.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5z" />
                <path d="M4 9.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5z" />
                <path d="M4 12.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5z" />
                <path d="M2.5 4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1h-10a.5.5 0 0 1-.5-.5z" />
              </svg>
            </InputGroup.Text>
            <FormControl
              as="textarea"
              ref={messageText}
              placeholder="Message text"
              type='text'
              aria-label="Message text"
              aria-describedby="basic-addon1"
            />
            <Button variant="success" type="submit">
              Send
            </Button>
          </InputGroup><br></br>
        </Form>
        <p className="text-center text-white fw-bold">Built by Riccardo Zunino with ❤️</p>
      </div>
    </div >
  )
}
