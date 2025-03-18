
import { useEffect, useRef, useState, useCallback } from "react"
import { mockAPI } from "@/service/api"
import {UseWebSocketProps} from "@/types/dashboard"

export function useWebSocket({
  url,
  onMessage,
  reconnectInterval = 3000,
  maxReconnectAttempts = 5,
  filters,
  timeRange,
  merchantId,
  
}: UseWebSocketProps) {
  const [lastMessage, setLastMessage] = useState<any>(null)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("disconnected")
  const socketRef = useRef<WebSocket | null>(null)
  const onMessageRef = useRef(onMessage)
  const filtersRef = useRef(filters)
  const timeRangeRef = useRef(timeRange)

  // Update the refs when dependencies change
  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  useEffect(() => {
    filtersRef.current = filters

    // If the socket is connected, send the updated filters
    if (socketRef.current && connectionStatus === "connected") {
      socketRef.current.send(
        JSON.stringify({
          type: "updateFilters",
          filters,
        }),
      )
    }
  }, [filters, connectionStatus])

  useEffect(() => {
    timeRangeRef.current = timeRange

    // If the socket is connected, send the updated timeRange
    if (socketRef.current && connectionStatus === "connected") {
      try {
        socketRef.current.send(
          JSON.stringify({
            type: "updateTimeRange",
            timeRange: timeRange, // Send the timeRange value directly
          }),
        )
      } catch (error) {
        console.error("Error sending timeRange update:", error)
      }
    }
  }, [timeRange, connectionStatus])

  useEffect(() => {
    let isMounted = true
    setConnectionStatus("connecting")

    // Connect to the WebSocket with initial filters and timeRange
    socketRef.current = mockAPI.connectWebSocket({
      url,
      filters,
      timeRange,
      onMessage: (data: any) => {
        if (!isMounted) return

        setLastMessage(data)
        if (onMessageRef.current) {
          onMessageRef.current(data)
        }
      },
      reconnectInterval,
      maxReconnectAttempts,
      merchantId
    })

    // Set connected status after a short delay to simulate connection time
    const timer = setTimeout(() => {
      if (isMounted) {
        setConnectionStatus("connected")
      }
    }, 500)

    // Cleanup
    return () => {
      isMounted = false
      clearTimeout(timer)
      if (socketRef.current) {
        socketRef.current.close()
      }
    }
  }, [url, reconnectInterval, maxReconnectAttempts, filters, timeRange])

  const sendMessage = useCallback(
    (data: any) => {
      if (socketRef.current && connectionStatus === "connected") {
        socketRef.current.send(JSON.stringify(data))
      } else {
        console.error("Cannot send message, WebSocket is not connected")
      }
    },
    [connectionStatus],
  )

  return {
    sendMessage,
    lastMessage,
    connectionStatus,
  }
}

