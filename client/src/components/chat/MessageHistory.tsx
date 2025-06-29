import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import type { ConversationMessage } from '../../../../shared/types';

interface MessageHistoryProps {
    messages: ConversationMessage[];
    isLoading?: boolean;
}

function MessageHistory({ messages, isLoading = false }: MessageHistoryProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    if (0 === messages.length && !isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500">
                    <div className="text-4xl mb-4">💬</div>
                    <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
                    <p className="text-sm">Send a message to begin chatting with your AI assistant</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="max-w-4xl mx-auto">
                {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                ))}
                
                {isLoading && (
                    <div className="flex justify-start mb-4">
                        <div className="max-w-xs">
                            <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-2xl rounded-bl-md">
                                <div className="flex items-center space-x-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
}

export default MessageHistory;