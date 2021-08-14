import express from 'express'
import http from 'http'
import WebSocket from 'ws'
import { pool } from './pg'
import sql_string from 'sqlstring'
import cors from 'cors'

const start_server = async () => {
    const app = express()
    app.use(cors())
    app.use(express.json({ limit: '50mb' }))
    app.use(express.urlencoded({ extended: true, limit: '50mb' }))

    const server = http.createServer(app)

    const wss = new WebSocket.Server({ server })

    wss.on('connection', ws => {
        // Someone connected
        console.log('New user connected')
        ws.send('Welcome new client')

        // Receive message from any client
        ws.on('message', async msg => {
            try {
                const new_pictures = JSON.parse(msg)
                console.log('Received message: ', new_pictures.map(el => ({gallery_id: el.gallery_id, base_64: el.base_64.slice(0,10)})))

                await Promise.all(new_pictures.map(async new_picture => {
                    const { gallery_id, base_64 } = new_picture
                    if (!gallery_id || !base_64) {
                        return 'must have gallery_id and base_64'
                    }

                    const result = await pool
                        .query(
                            `
                    INSERT INTO pictures(gallery_id, base_64)
                    VALUES (${sql_string.escape(gallery_id)}, ${sql_string.escape(base_64)});
                    `
                        )

                    console.log('inserted', result)

                }))
                wss.clients.forEach(client => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send('THIS IS A BROADCAST')
                    }
                })
            } catch (error) {
                debugger
            }
        })
    })

    app.get('/', (req, res) => res.send('Hello world'))
    app.get('/gallery', async (req, res) => {
        console.log('fetching')
        const response = await pool.query(`select * from pictures where gallery_id = ${sql_string.escape(req.query.gallery_id)}`)
        res.send(response.rows)
    })

    server.listen(3004, () => console.log('Listening on port 3004'))
}

start_server()
