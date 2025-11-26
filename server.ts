import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { WebSocketServer, WebSocket } from 'ws';
import { OpenAIRealtimeService } from './lib/services/openai-realtime';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = process.env.PORT || 3000;

// Map to store active calls and their client connections
const activeCalls = new Map<string, {
    twilioWs?: WebSocket;
    clientWs?: WebSocket;
    openAIService?: OpenAIRealtimeService;
    streamSid?: string;
}>();

app.prepare().then(() => {
    const server = createServer((req, res) => {
        const parsedUrl = parse(req.url!, true);
        handle(req, res, parsedUrl);
    });

    const wss = new WebSocketServer({ server });

    wss.on('connection', (ws, req) => {
        const parsedUrl = parse(req.url!, true);
        const pathname = parsedUrl.pathname;
        const callId = parsedUrl.query.callId as string;

        console.log(`New WebSocket connection: ${pathname} for callId: ${callId}`);

        if (pathname === '/api/webhook/media-stream') {
            handleTwilioStream(ws, callId);
        } else if (pathname === '/api/call/stream') {
            handleClientStream(ws, callId);
        } else {
            ws.close();
        }
    });

    server.listen(PORT, () => {
        console.log(`> Ready on http://localhost:${PORT}`);
    });
});

function handleTwilioStream(ws: WebSocket, callId: string) {
    let callData = activeCalls.get(callId) || {};
    callData.twilioWs = ws;

    // Initialize OpenAI Service
    // Note: In production, you should handle API key securely and maybe not instantiate for every connection if not needed immediately
    const openAIService = new OpenAIRealtimeService(process.env.OPENAI_API_KEY!);
    callData.openAIService = openAIService;

    activeCalls.set(callId, callData);

    // Handle audio from OpenAI -> Twilio & Client
    openAIService.on('audio', (audioDelta: string) => {
        // Send to Twilio
        if (ws.readyState === WebSocket.OPEN && callData.streamSid) {
            const audioResponse = {
                event: 'media',
                streamSid: callData.streamSid,
                media: {
                    payload: audioDelta
                }
            };
            ws.send(JSON.stringify(audioResponse));
        }

        // Send to Client (for monitoring)
        const clientWs = activeCalls.get(callId)?.clientWs;
        if (clientWs?.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({
                type: 'audio',
                data: audioDelta
            }));
        }
    });

    // Handle transcripts
    openAIService.on('transcript', (transcript) => {
        const clientWs = activeCalls.get(callId)?.clientWs;
        if (clientWs?.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({
                type: 'transcript',
                data: transcript
            }));
        }
    });

    ws.on('message', (message: string) => {
        try {
            const msg = JSON.parse(message);

            if (msg.event === 'start') {
                console.log(`Twilio stream started for call: ${callId}`);
                callData.streamSid = msg.start.streamSid;
                activeCalls.set(callId, callData);

                // Notify client
                const clientWs = activeCalls.get(callId)?.clientWs;
                if (clientWs?.readyState === WebSocket.OPEN) {
                    clientWs.send(JSON.stringify({ type: 'status', data: { status: 'in-progress' } }));
                }
            } else if (msg.event === 'media') {
                // Send audio to OpenAI
                openAIService.sendAudio(msg.media.payload);

                // Also broadcast user audio to client for waveform
                const clientWs = activeCalls.get(callId)?.clientWs;
                if (clientWs?.readyState === WebSocket.OPEN) {
                    // We might want to distinguish user vs AI audio for the waveform, 
                    // but for now just sending it is fine.
                }
            } else if (msg.event === 'stop') {
                console.log(`Twilio stream stopped for call: ${callId}`);
                openAIService.close();
                const clientWs = activeCalls.get(callId)?.clientWs;
                if (clientWs?.readyState === WebSocket.OPEN) {
                    clientWs.send(JSON.stringify({ type: 'status', data: { status: 'completed' } }));
                }
            }
        } catch (error) {
            console.error('Error processing Twilio message:', error);
        }
    });

    ws.on('close', () => {
        console.log(`Twilio stream closed for call: ${callId}`);
        openAIService.close();
        const callData = activeCalls.get(callId);
        if (callData) {
            callData.twilioWs = undefined;
            callData.openAIService = undefined;
            if (!callData.clientWs) {
                activeCalls.delete(callId);
            }
        }
    });
}

function handleClientStream(ws: WebSocket, callId: string) {
    let callData = activeCalls.get(callId) || {};
    callData.clientWs = ws;
    activeCalls.set(callId, callData);

    // Send initial status
    ws.send(JSON.stringify({ type: 'status', data: { status: 'connected' } }));

    ws.on('close', () => {
        console.log(`Client stream closed for call: ${callId}`);
        const callData = activeCalls.get(callId);
        if (callData) {
            callData.clientWs = undefined;
            if (!callData.twilioWs) {
                activeCalls.delete(callId);
            }
        }
    });
}
