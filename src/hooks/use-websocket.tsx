import { useEffect, useRef, useState, useCallback } from "react";
import { mockAPI } from "@/service/api";
import { UseWebSocketProps } from "@/types/dashboard";
import { useStore } from "@/lib/store";

export function useWebSocket({
  onMessage,
  reconnectInterval = 3000,
  maxReconnectAttempts = 5,
  filters,
  timeRange,
  merchantId,
}: UseWebSocketProps) {
  const [lastMessage, setLastMessage] = useState<any>(null);
  const { connectionStatus, setConnectionStatus, refreshInterval } = useStore();
  const socketRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);
  const filtersRef = useRef(filters);
  const timeRangeRef = useRef(timeRange);

  // Update the refs when dependencies change
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    filtersRef.current = filters;
    if (socketRef.current && connectionStatus === "connected") {
      socketRef.current.send(
        JSON.stringify({
          type: "updateFilters",
          filters,
        })
      );
    }
  }, [filters, connectionStatus]);

  useEffect(() => {
    timeRangeRef.current = timeRange;
    if (socketRef.current && connectionStatus === "connected") {
      try {
        socketRef.current.send(
          JSON.stringify({
            type: "updateTimeRange",
            timeRange,
          })
        );
      } catch (error) {
        console.error("Error sending timeRange update:", error);
      }
    }
  }, [timeRange, connectionStatus]);

  useEffect(() => {
    let isMounted = true;
    setConnectionStatus("connecting");

    socketRef.current = mockAPI.connectWebSocket({
      filters,
      timeRange,
      onMessage: (data: any) => {
        if (!isMounted) return;
        setLastMessage(data);
        if (onMessageRef.current) {
          onMessageRef.current(data);
        }
      },
      reconnectInterval,
      maxReconnectAttempts,
      merchantId,
      refreshInterval,
    });

    const timer = setTimeout(() => {
      if (isMounted) {
        setConnectionStatus("connected");
      }
    }, 500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      setConnectionStatus("disconnected");
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [reconnectInterval, maxReconnectAttempts, merchantId, refreshInterval]);

  
  useEffect(() => {
    if (connectionStatus !== "disconnected") {
      return;
    }
    socketRef.current?.close();
    setConnectionStatus("disconnected");
  }, [connectionStatus]);

  const sendMessage = useCallback(
    (data: any) => {
      if (socketRef.current && connectionStatus === "connected") {
        socketRef.current.send(JSON.stringify(data));
      } else {
        console.error("Cannot send message, WebSocket is not connected");
      }
    },
    [connectionStatus]
  );

  return {
    sendMessage,
    lastMessage,
    connectionStatus,
  };
}