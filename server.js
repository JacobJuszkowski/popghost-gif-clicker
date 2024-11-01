// server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let globalCounter = 0;

app.use(express.json());

app.post('/increment-global-counter', (req, res) => {
    globalCounter++;
    broadcastGlobalCounter();
    res.json({ globalCount: globalCounter });
});

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// If no route matches, serve the main index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/get-global-counter', (req, res) => {
    res.json({ globalCount: globalCounter });
});

wss.on('connection', (ws) => {
    console.log('New client connected');
    // Send the current global count immediately upon connection
    ws.send(JSON.stringify({ globalCount: globalCounter }));

    ws.on('close', () => console.log('Client disconnected'));
});

function broadcastGlobalCounter() {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ globalCount: globalCounter }));
        }
    });
}

// const PORT = process.env.PORT || 3000;
// server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
module.exports = app;  // Export the app instead of calling app.listen()
