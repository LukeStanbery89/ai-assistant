import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import type { ConversationMessage } from "../../../../shared/types";

interface MessageHistoryProps {
    messages: ConversationMessage[];
    isLoading?: boolean;
}

function MessageHistory({ messages, isLoading = false }: MessageHistoryProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    if (0 === messages.length && !isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center text-gray-500 dark:text-gray-400 max-w-md">
                    <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-3xl flex items-center justify-center">
                        <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Start a conversation</h3>
                    <p className="text-sm leading-relaxed">Send a message to begin chatting with your AI assistant. Ask questions, get help, or just have a friendly conversation.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto px-4 py-8 scrollbar-hide">
            <div className="max-w-4xl mx-auto min-h-full">
                {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                ))}

                {isLoading && (
                    <div className="flex justify-start mb-6 animate-fade-in">
                        <div className="max-w-xs">
                            <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 text-gray-900 dark:text-gray-100 px-5 py-3 rounded-3xl rounded-bl-lg shadow-sm">
                                <div className="flex items-center space-x-1">
                                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
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