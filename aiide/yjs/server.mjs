import { WebSocketServer } from "ws";
import * as http from "http";
import setupWSConnection from "y-websocket/bin/utils";

const server = http.createServer();
const wss = new WebSocketServer({ server });

wss.on("connection", (conn, req) =>
  setupWSConnection(conn, req, {
    gc: true,
  }),
);

server.listen(1234, () => console.log("yjs ws on :1234"));
