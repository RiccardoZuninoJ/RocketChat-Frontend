import Head from 'next/head'
import Image from 'next/image'
import io from 'socket.io-client'
const ENDPOINT = "http://rocky-journey-09604.herokuapp.com:4000"
import { useEffect, useState, useRef } from 'react'
import Navigation from './components/Navigation'
import { InputGroup, FormControl, Button, Form } from 'react-bootstrap'
import Message from './components/Message'
const NodeRSA = require('node-rsa');

export default function SendTo() {


  const [loading, setLoading] = useState(true)

  const encryptRsa = new NodeRSA({ b: 512 })
  encryptRsa.generateKeyPair()
  const [messages, setMessages] = useState([])
  const [socket, setSocket] = useState(null)
  const [socketID, setSocketID] = useState(null)
  const [publicKey, setPublicKey] = useState(null)
  const [privateKey, setPrivateKey] = useState(null)

  const messageText = useRef(null)
  const pubKeyRef = useRef(null)
  const sendToId = useRef(null)

  useEffect(() => {
    const socket = io(ENDPOINT)
    setSocket(socket)
    socket.on("connect", () => {
      console.log("Connected")
      console.log(socket.id)
      setSocketID(socket.id)
      // Get public key
      const publicKey = encryptRsa.exportKey('public');
      // Get private key
      const privateKey = encryptRsa.exportKey('private');
      setPublicKey(publicKey)
      setPrivateKey(privateKey)
      //Send the public key to the server
      socket.emit("publicKey", publicKey);
      setLoading(false)
    })

    socket.on("msg", data => {
      console.log(data)
      //Decrypt the message using the private key

      const decryptedMessage = encryptRsa.decrypt(data.text, 'utf8')
      console.log(decryptedMessage)
      data.text = decryptedMessage;
      setMessages(messages => [...messages, data])
    })
    return () => {
      socket.disconnect()
    }
  }, [])
  const bottomRef = useRef(null)

  const sendMessage = (e) => {
    e.preventDefault()
    const message = messageText.current.value
    const sendTo = sendToId.current.value
    // Encrypt the message with the public key of the recipient
    //Get the public key of the recipient from the server
    socket.emit('get_public_key', { to: sendTo })
    socket.on('public_key_ack', data => {
      //Encrypt the message with the public key of the recipient with NodeRSA
      const encrypt = new NodeRSA(data.replace(/\\n/g, ''));
      const encryptedMessage = encrypt.encrypt(message, 'base64');
      socket.emit('msg', { from: socketID, to: sendTo, text: encryptedMessage })
      messageText.current.value = ''
      //Add the message to the messages array
      setMessages(messages => [...messages, { from: socketID, to: sendTo, text: message }])
    })
  }

  useEffect(() => {
    if (!loading)
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {

  }, [])

  //if loading show a spinner

  return (

    <main >
      {loading ? <div className="mx-auto spinner-border text-primary" role="status">

      </div> : (
        <div>
          <Navigation socketID={socketID}></Navigation>
          <div>

            <div className="mx-auto mb-4" style={{ height: "70vh", overflow: "auto", paddingLeft: '10%', paddingRight: '10%' }} id="messages">
              <h5>Send to</h5>
              <Form.Control type="text" ref={sendToId} placeholder="Enter SocketID of recipient" />
              <br />
              <div className="col mb-4" >
                {messages.map((message, index) => {
                  if (message.from === socketID) {
                    return (
                      <Message key={index} msg={message} sent={message.from === socketID}></Message>
                    )
                  }
                  else {
                    return (
                      <Message key={index} msg={message} sent={message.from === socketID}></Message>
                    )
                  }
                })}
                <div ref={bottomRef}></div>
              </div>
            </div>
          </div>

          <div fixed="bottom" style={{ maxHeight: "10vh" }} className="bg-primary fixed-bottom px-4 pt-4 pb-4 justify-content-center">
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
          </div>
        </div>)
      }
    </main >
  )

}
