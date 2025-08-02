import express, { Router } from 'express';
import cors from 'cors';
import path from 'path';
import { createServer } from 'http';
import WebSocket, { Server as WebSocketServer } from 'ws';

interface Options {
  port: number;
  host: string;
  public_path: string;
  routes: Router;
}

export class Server {
  public readonly app = express();
  private readonly port: number;
  private readonly host: string;
  private readonly publicPath: string;
  private readonly routes: Router;

  constructor(options: Options) {
    const { port, host, routes, public_path } = options;
    this.port = port;
    this.host = host;
    this.publicPath = public_path;
    this.routes = routes;
  }

  async start() {
    // Middlewares
    this.app.use(cors({ origin: '*' }));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Static
    this.app.use(express.static(this.publicPath));

    // Health check
    this.app.get('/health', (_req, res) => res.status(200).send('OK'));

    // Routes
    this.app.use(this.routes);

    // SPA fallback
    this.app.use((_req, res) => {
      res.sendFile(
        path.resolve(this.publicPath, 'index.html')
      );
    });
    // HTTP + WebSocket
    const server = createServer(this.app);
    const wss = new WebSocketServer({ server });

    wss.on('connection', (ws: WebSocket) => {
      ws.send(JSON.stringify({ type: 'WELCOME', message: 'WebSocket iniciado', ts: Date.now() }));
    });

    server.listen(this.port, this.host, () => {
      console.log(`✅ Servidor corriendo en "http://${this.host}:${this.port}"`);
    });
  }
}