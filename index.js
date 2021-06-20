const express = require('express')
const app = express()
const server = require('http').createServer(app)
const WebSocket = require('ws')

const wss = new WebSocket.Server({ server })

wss.on('connection', (ws) => {
    // Someone connected
    console.log('New user connected')
    ws.send('Welcome new client')

    // Receive message from any client
    ws.on('message', (message) => {
        console.log('Received message: ', message)
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send('THIS IS A BROADCAST')
            }
        })
    })
})

app.get('/', (req,res) => res.send('Hello world'))

server.listen(3004, () => console.log('Listening on port 3004'))