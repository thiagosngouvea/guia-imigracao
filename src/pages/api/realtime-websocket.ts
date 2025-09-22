import { NextApiRequest } from 'next';
import { WebSocketServer } from 'ws';
import WebSocket from 'ws';

export default function handler(req: NextApiRequest, res: any) {
  if (req.method === 'GET') {
    // Verificar se já existe um servidor WebSocket
    if (res.socket.server.wss) {
      console.log('WebSocket server already exists');
      res.end();
      return;
    }

    // Criar servidor WebSocket
    const wss = new WebSocketServer({ 
      noServer: true,
      path: '/api/realtime-websocket'
    });
    
    res.socket.server.wss = wss;

    // Configurar upgrade do servidor HTTP
    res.socket.server.on('upgrade', (request: any, socket: any, head: any) => {
      const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;
      
      if (pathname === '/api/realtime-websocket') {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit('connection', ws, request);
        });
      } else {
        socket.destroy();
      }
    });

    wss.on('connection', (clientWs) => {
      console.log('Client connected to WebSocket');
      let openaiWs: WebSocket | null = null;

      clientWs.on('message', async (message) => {
        try {
          const data = JSON.parse(message.toString());
          
          if (data.type === 'init_session') {
            console.log('Initializing OpenAI Realtime session');
            
            // Conectar ao OpenAI Realtime
            const url = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01";
            openaiWs = new WebSocket(url, {
              headers: {
                Authorization: "Bearer " + process.env.OPENAI_API_KEY,
                "OpenAI-Beta": "realtime=v1"
              },
            });

            openaiWs.on('open', () => {
              console.log('Connected to OpenAI Realtime API');
              
              // Configurar sessão com dados do cliente
              const sessionConfig = {
                type: "session.update",
                session: {
                  modalities: ["text", "audio"],
                  instructions: data.language === 'pt' 
                    ? `Você é um oficial consular americano experiente conduzindo uma entrevista de visto ${data.scenario.visaType}. 
                       Seu objetivo é avaliar se o candidato é elegível para o visto.
                       
                       Cenário: ${data.scenario.name}
                       Nível: ${data.scenario.difficulty}
                       
                       Instruções:
                       - Seja profissional mas amigável
                       - Faça perguntas de acompanhamento quando necessário
                       - Forneça feedback construtivo sobre as respostas
                       - Se a resposta for inadequada, oriente como melhorar
                       - Mantenha o foco no tipo de visto específico
                       - Responda em português brasileiro
                       - Seja conciso mas informativo
                       
                       Pergunta atual (${data.questionIndex + 1}): ${data.scenario.questions.pt[data.questionIndex] || 'Entrevista concluída'}`
                    : `You are an experienced U.S. consular officer conducting a ${data.scenario.visaType} visa interview.
                       Your goal is to assess if the applicant is eligible for the visa.
                       
                       Scenario: ${data.scenario.name}
                       Level: ${data.scenario.difficulty}
                       
                       Instructions:
                       - Be professional but friendly
                       - Ask follow-up questions when necessary
                       - Provide constructive feedback on answers
                       - If an answer is inadequate, guide how to improve
                       - Stay focused on the specific visa type
                       - Respond in English
                       - Be concise but informative
                       
                       Current question (${data.questionIndex + 1}): ${data.scenario.questions.en[data.questionIndex] || 'Interview completed'}`,
                  voice: "alloy",
                  input_audio_format: "pcm16",
                  output_audio_format: "pcm16",
                  input_audio_transcription: {
                    model: "whisper-1"
                  },
                  turn_detection: {
                    type: "server_vad",
                    threshold: 0.5,
                    prefix_padding_ms: 300,
                    silence_duration_ms: 500
                  },
                  tools: [],
                  tool_choice: "none",
                  temperature: 0.7,
                  max_response_output_tokens: 500
                }
              };
              
              openaiWs?.send(JSON.stringify(sessionConfig));
            });

            openaiWs.on('message', (openaiMessage) => {
              // Repassar mensagem da OpenAI para o cliente
              clientWs.send(openaiMessage.toString());
            });

            openaiWs.on('error', (error) => {
              console.error('OpenAI WebSocket error:', error);
              clientWs.send(JSON.stringify({
                type: 'error',
                error: 'OpenAI connection error'
              }));
            });

            openaiWs.on('close', () => {
              console.log('OpenAI WebSocket closed');
              clientWs.send(JSON.stringify({
                type: 'error',
                error: 'OpenAI connection closed'
              }));
            });

          } else {
            // Repassar mensagem para OpenAI
            if (openaiWs && openaiWs.readyState === WebSocket.OPEN) {
              openaiWs.send(message.toString());
            } else {
              clientWs.send(JSON.stringify({
                type: 'error',
                error: 'Not connected to OpenAI'
              }));
            }
          }
        } catch (error) {
          console.error('Error processing message:', error);
          clientWs.send(JSON.stringify({
            type: 'error',
            error: 'Message processing error'
          }));
        }
      });

      clientWs.on('close', () => {
        console.log('Client disconnected');
        if (openaiWs) {
          openaiWs.close();
          openaiWs = null;
        }
      });

      clientWs.on('error', (error) => {
        console.error('Client WebSocket error:', error);
        if (openaiWs) {
          openaiWs.close();
          openaiWs = null;
        }
      });
    });

    console.log('WebSocket server initialized');
  }
  
  res.end();
}

export const config = {
  api: {
    externalResolver: true,
  },
};
