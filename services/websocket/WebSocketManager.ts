import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { parse } from 'url';

interface ClientConnection {
  ws: WebSocket;
  userId?: string;
  jobId?: string;
  subscriptions: Set<string>;
}

export class WebSocketManager {
  private static instance: WebSocketManager;
  private wss: WebSocketServer | null = null;
  private clients: Map<string, ClientConnection> = new Map();

  private constructor() {}

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  initialize(server: any): void {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws'
    });

    this.wss.on('connection', (ws: WebSocket, request: IncomingMessage) => {
      const clientId = this.generateClientId();
      const url = parse(request.url || '', true);
      const userId = url.query.userId as string;
      const jobId = url.query.jobId as string;

      const client: ClientConnection = {
        ws,
        userId,
        jobId,
        subscriptions: new Set()
      };

      this.clients.set(clientId, client);

      if (jobId) {
        client.subscriptions.add(`job:${jobId}`);
      }

      if (userId) {
        client.subscriptions.add(`user:${userId}`);
      }

      ws.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(clientId, message);
        } catch (error) {
          console.error('Invalid WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        this.clients.delete(clientId);
        console.log(`Client ${clientId} disconnected`);
      });

      ws.on('error', (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
        this.clients.delete(clientId);
      });

      this.sendToClient(clientId, {
        type: 'connected',
        clientId,
        timestamp: new Date().toISOString()
      });

      console.log(`Client ${clientId} connected`);
    });

    console.log('WebSocket server initialized');
  }

  private handleMessage(clientId: string, message: any): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    switch (message.type) {
      case 'subscribe':
        if (message.channel) {
          client.subscriptions.add(message.channel);
          this.sendToClient(clientId, {
            type: 'subscribed',
            channel: message.channel,
            timestamp: new Date().toISOString()
          });
        }
        break;

      case 'unsubscribe':
        if (message.channel) {
          client.subscriptions.delete(message.channel);
          this.sendToClient(clientId, {
            type: 'unsubscribed',
            channel: message.channel,
            timestamp: new Date().toISOString()
          });
        }
        break;

      case 'ping':
        this.sendToClient(clientId, {
          type: 'pong',
          timestamp: new Date().toISOString()
        });
        break;
    }
  }

  private sendToClient(clientId: string, message: any): void {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  broadcastJobProgress(jobId: string, progress: number, status: string, details?: any): void {
    const message = {
      type: 'job_progress',
      jobId,
      progress,
      status,
      details,
      timestamp: new Date().toISOString()
    };

    this.broadcastToChannel(`job:${jobId}`, message);
  }

  broadcastJobCompleted(jobId: string, results: any): void {
    const message = {
      type: 'job_completed',
      jobId,
      results,
      timestamp: new Date().toISOString()
    };

    this.broadcastToChannel(`job:${jobId}`, message);
  }

  broadcastJobFailed(jobId: string, error: string): void {
    const message = {
      type: 'job_failed',
      jobId,
      error,
      timestamp: new Date().toISOString()
    };

    this.broadcastToChannel(`job:${jobId}`, message);
  }

  private broadcastToChannel(channel: string, message: any): void {
    for (const [clientId, client] of this.clients) {
      if (client.subscriptions.has(channel)) {
        this.sendToClient(clientId, message);
      }
    }
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getConnectedClients(): number {
    return this.clients.size;
  }

  shutdown(): void {
    if (this.wss) {
      this.wss.close();
      this.clients.clear();
      console.log('WebSocket server shut down');
    }
  }
}