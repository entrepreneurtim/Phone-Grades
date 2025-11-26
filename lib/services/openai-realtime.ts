import WebSocket from 'ws';
import { EventEmitter } from 'events';

export class OpenAIRealtimeService extends EventEmitter {
    private ws: WebSocket;
    private isOpen = false;

    constructor(private apiKey: string) {
        super();
        this.ws = new WebSocket('wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01', {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'OpenAI-Beta': 'realtime=v1',
            },
        });

        this.ws.on('open', () => {
            console.log('Connected to OpenAI Realtime API');
            this.isOpen = true;
            this.initializeSession();
        });

        this.ws.on('message', (data: Buffer) => {
            try {
                const event = JSON.parse(data.toString());
                this.handleEvent(event);
            } catch (e) {
                console.error('Error parsing OpenAI message:', e);
            }
        });

        this.ws.on('error', (e) => {
            console.error('OpenAI WebSocket error:', e);
        });

        this.ws.on('close', () => {
            console.log('OpenAI WebSocket closed');
            this.isOpen = false;
        });
    }

    private initializeSession() {
        const sessionUpdate = {
            type: 'session.update',
            session: {
                voice: 'alloy', // or 'shimmer', 'echo'
                instructions: `You are a potential new patient calling a dental practice. 
        You are friendly but slightly hesitant. 
        Your goal is to ask about new patient availability, insurance (Delta Dental), and pricing.
        Do not commit to booking immediately. Ask follow-up questions.
        Keep responses concise and natural.`,
                input_audio_format: 'g711_ulaw',
                output_audio_format: 'g711_ulaw',
                turn_detection: {
                    type: 'server_vad',
                }
            },
        };
        this.send(sessionUpdate);
    }

    private handleEvent(event: any) {
        switch (event.type) {
            case 'response.audio.delta':
                // Received audio from OpenAI
                if (event.delta) {
                    this.emit('audio', event.delta);
                }
                break;
            case 'response.audio_transcript.done':
                this.emit('transcript', { speaker: 'ai', text: event.transcript });
                break;
            case 'conversation.item.input_audio_transcription.completed':
                this.emit('transcript', { speaker: 'user', text: event.transcript });
                break;
            case 'error':
                console.error('OpenAI Error:', event.error);
                break;
        }
    }

    sendAudio(base64Audio: string) {
        if (!this.isOpen) return;

        this.send({
            type: 'input_audio_buffer.append',
            audio: base64Audio,
        });
    }

    private send(data: any) {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
    }

    close() {
        this.ws.close();
    }
}
