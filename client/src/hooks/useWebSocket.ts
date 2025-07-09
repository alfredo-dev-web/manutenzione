import { useEffect, useRef, useState } from 'react';
import { queryClient } from '@/lib/queryClient';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        // Invalidate relevant queries based on message type
        switch (message.type) {
          case 'TASK_CREATED':
          case 'TASK_UPDATED':
          case 'TASK_DELETED':
          case 'TASK_ASSIGNED':
          case 'TASK_COMPLETED':
            queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
            queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
            break;
          case 'TEAM_UPDATED':
            queryClient.invalidateQueries({ queryKey: ['/api/teams'] });
            queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  return { isConnected };
}
