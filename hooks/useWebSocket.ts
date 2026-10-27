"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type WsStatus = "disconnected" | "connecting" | "connected";

interface Options {
  path: string;
  token?: string | null;
  sameOrigin?: boolean;
  onMessage?: (data: string) => void;
  onError?: (message: string) => void;
  onClose?: () => void;
}

function isReadyMessage(data: string): boolean {
  try {
    return JSON.parse(data)?.type === "ready";
  } catch {
    return false;
  }
}

export function useWebSocket({
  path,
  token,
  sameOrigin = false,
  onMessage,
  onError,
  onClose,
}: Options) {
  const socketRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef({ onMessage, onError, onClose });
  const [status, setStatus] = useState<WsStatus>("disconnected");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    handlersRef.current = { onMessage, onError, onClose };
  });

  const connect = useCallback(() => {
    const current = socketRef.current;
    if (current && current.readyState <= WebSocket.OPEN) return;

    const base = sameOrigin
      ? `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}`
      : (process.env.NEXT_PUBLIC_WS_URL ?? "");

    const socket = new WebSocket(`${base}${path}`);
    socketRef.current = socket;
    let handshakeDone = false;

    setStatus("connecting");
    setReady(false);

    socket.onopen = () => {
      if (socketRef.current !== socket) return;
      setStatus("connected");
      if (token) socket.send(JSON.stringify({ token }));
    };

    socket.onmessage = (event) => {
      if (socketRef.current !== socket) return;
      const data = typeof event.data === "string" ? event.data : "";
      if (!handshakeDone && isReadyMessage(data)) {
        handshakeDone = true;
        setReady(true);
        return;
      }
      handlersRef.current.onMessage?.(data);
    };

    socket.onerror = () => {
      if (socketRef.current !== socket) return;
      handlersRef.current.onError?.("خطا در برقراری ارتباط وب‌سوکت.");
    };

    socket.onclose = () => {
      if (socketRef.current !== socket) return;
      socketRef.current = null;
      setStatus("disconnected");
      setReady(false);
      handlersRef.current.onClose?.();
    };
  }, [path, token, sameOrigin]);

  const disconnect = useCallback(() => {
    const socket = socketRef.current;
    socketRef.current = null;
    socket?.close(1000);
    setStatus("disconnected");
    setReady(false);
    handlersRef.current.onClose?.();
  }, []);

  const send = useCallback((data: string): boolean => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return false;
    socket.send(data);
    return true;
  }, []);

  useEffect(() => {
    return () => {
      const socket = socketRef.current;
      socketRef.current = null;
      if (!socket) return;
      if (socket.readyState === WebSocket.CONNECTING) {
        socket.onopen = () => socket.close(1000);
      } else {
        socket.close(1000);
      }
    };
  }, []);

  return { status, ready, connect, disconnect, send };
}