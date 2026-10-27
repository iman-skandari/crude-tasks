import { createServer } from "node:http";
import next from "next";
import nextEnv from "@next/env";
import { WebSocket, WebSocketServer } from "ws";

const dev = !process.argv.includes("--prod");
nextEnv.loadEnvConfig(process.cwd(), dev);

const port = Number(process.env.PORT ?? 3000);
const hostname = process.env.HOSTNAME_BIND ?? "localhost";
const target = process.env.API_PROXY_TARGET ?? "https://ts.idicorp.ir";
const upstreamBase = target.replace(/^http/, "ws");

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

function reject(client) {
  if (client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify({ error: "Unauthorized" }));
  }
  client.close(1008);
}

function bridge(client) {
  let upstream = null;
  let authed = false;
  const queue = [];

  const timer = setTimeout(() => {
    if (!authed) reject(client);
  }, 3000);

  client.on("message", (data, isBinary) => {
    if (!authed) {
      let token = null;
      try {
        token = JSON.parse(data.toString()).token;
      } catch {
        token = null;
      }
      if (typeof token !== "string" || token.length === 0) {
        clearTimeout(timer);
        reject(client);
        return;
      }

      authed = true;
      clearTimeout(timer);

      upstream = new WebSocket(`${upstreamBase}/ws/echo`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      upstream.on("open", () => {
        for (const [chunk, binary] of queue) upstream.send(chunk, { binary });
        queue.length = 0;
      });

      upstream.on("message", (chunk, binary) => {
        if (client.readyState === WebSocket.OPEN) client.send(chunk, { binary });
      });

      upstream.on("unexpected-response", () => reject(client));
      upstream.on("error", () => client.close(1011));
      upstream.on("close", () => client.close());
      return;
    }

    if (upstream && upstream.readyState === WebSocket.OPEN) {
      upstream.send(data, { binary: isBinary });
    } else {
      queue.push([data, isBinary]);
    }
  });

  client.on("close", () => {
    clearTimeout(timer);
    if (upstream) upstream.terminate();
  });

  client.on("error", () => {
    if (upstream) upstream.terminate();
  });
}

await app.prepare();
const upgradeNext = app.getUpgradeHandler();
const wss = new WebSocketServer({ noServer: true });

const server = createServer((req, res) => {
  handle(req, res);
});

server.on("upgrade", (req, socket, head) => {
  const { pathname } = new URL(req.url ?? "/", "http://localhost");
  if (pathname === "/ws/echo") {
    wss.handleUpgrade(req, socket, head, (client) => bridge(client));
    return;
  }
  upgradeNext(req, socket, head);
});

server.listen(port, hostname, () => {
  console.log(`ready on http://${hostname}:${port} (${dev ? "development" : "production"})`);
});