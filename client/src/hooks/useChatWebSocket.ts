import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatWebSocketService, type ConnectionStatus } from '../services/ChatWebSocketService';
import type { ConversationMessage } from '../../../shared/types';

export interface UseChatWebSocketReturn {
    messages: ConversationMessage[];
    connectionStatus: ConnectionStatus;
    sendMessage: (message: string) => Promise<void>;
    clearMessages: () => void;
    isConnected: boolean;
    isConnecting: boolean;
    error: string | null;
}

export function useChatWebSocket(url: string = 'ws://localhost:3000'): UseChatWebSocketReturn {
    const [messages, setMessages] = useState<ConversationMessage[]>([]);
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
        connected: false,
        connecting: false
    });
    const [error, setError] = useState<string | null>(null);
    const serviceRef = useRef<ChatWebSocketService | null>(null);

    useEffect(() => {
        // Create WebSocket service
        serviceRef.current = new ChatWebSocketService({ url });

        // Set up listeners
        const unsubscribeMessage = serviceRef.current.onMessage((message) => {
            setMessages(prev => [...prev, message]);
            setError(null);
        });

        const unsubscribeError = serviceRef.current.onError((errorMessage) => {
            setError(errorMessage);
        });

        const unsubscribeConnection = serviceRef.current.onConnectionChange((status) => {
            setConnectionStatus(status);
            if (status.error) {
                setError(status.error);
            } else if (status.connected) {
                setError(null);
            }
        });

        // Connect
        serviceRef.current.connect();

        // Cleanup on unmount
        return () => {
            unsubscribeMessage();
            unsubscribeError();
            unsubscribeConnection();
            
            if (serviceRef.current) {
                serviceRef.current.disconnect();
                serviceRef.current = null;
            }
        };
    }, [url]);

    const sendMessage = useCallback(async (message: string): Promise<void> => {
        if (!serviceRef.current) {
            throw new Error('WebSocket service not available');
        }

        if (!connectionStatus.connected) {
            throw new Error('Not connected to server');
        }

        try {
            // Add user message to local state immediately
            const userMessage: ConversationMessage = {
                id: `user-${Date.now()}`,
                type: 'user',
                content: message,
                timestamp: new Date(),
                sessionId: 'browser-session', // TODO: Get from service
                userId: 'browser-user',
                clientType: 'browser'
            };

            setMessages(prev => [...prev, userMessage]);
            
            // Send to server
            serviceRef.current.sendMessage(message);
            setError(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, [connectionStatus.connected]);

    const clearMessages = useCallback(() => {
        setMessages([]);
        setError(null);
    }, []);

    return {
        messages,
        connectionStatus,
        sendMessage,
        clearMessages,
        isConnected: connectionStatus.connected,
        isConnecting: connectionStatus.connecting,
        error
    };
}