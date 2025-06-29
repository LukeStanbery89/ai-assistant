import { useChatWebSocket } from "../hooks/useChatWebSocket";
import MessageHistory from "../components/chat/MessageHistory";
import ChatInput from "../components/chat/ChatInput";
import ConnectionStatus from "../components/chat/ConnectionStatus";

function Chat() {
    const {
        messages,
        connectionStatus,
        sendMessage,
        clearMessages,
        isConnected,
        error
    } = useChatWebSocket();

    return (
        <div className="flex-1 flex flex-col min-h-0">
            {/* Header */}
            <div className="bg-white/80 dark:bg-dark-900/80 backdrop-blur-md border-b border-gray-200 dark:border-dark-700 px-6 py-4 flex-shrink-0">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Assistant</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">Your intelligent conversation partner</p>
                    </div>

                    <div className="flex items-center space-x-4">
                        <ConnectionStatus status={connectionStatus} />

                        {messages.length > 0 && (
                            <button
                                onClick={clearMessages}
                                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-4 py-2 rounded-xl border border-gray-300 dark:border-dark-600 hover:bg-gray-50 dark:hover:bg-dark-800 transition-all duration-200 flex items-center space-x-2"
                                aria-label="Clear Chat"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span className="hidden sm:inline">Clear Chat</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-6 py-3 flex-shrink-0 animate-slide-up">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400 dark:text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 bg-gray-50 dark:bg-dark-950 min-h-0">
                <MessageHistory
                    messages={messages}
                    isLoading={false} // TODO: Add loading state when waiting for response
                />
            </div>

            {/* Input */}
            <div className="flex-shrink-0">
                <ChatInput
                    onSendMessage={sendMessage}
                    disabled={!isConnected}
                    placeholder={isConnected ? "Type your message..." : "Connecting..."}
                />
            </div>
        </div>
    );
}

export default Chat;