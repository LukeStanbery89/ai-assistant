import { useChatWebSocket } from '../hooks/useChatWebSocket';
import MessageHistory from '../components/chat/MessageHistory';
import ChatInput from '../components/chat/ChatInput';
import ConnectionStatus from '../components/chat/ConnectionStatus';

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
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-white border-b px-6 py-4 flex-shrink-0">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">AI Assistant</h1>
                        <p className="text-sm text-gray-600">Your intelligent conversation partner</p>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        <ConnectionStatus status={connectionStatus} />
                        
                        {messages.length > 0 && (
                            <button 
                                onClick={clearMessages}
                                className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded border border-gray-300 hover:bg-gray-50"
                            >
                                Clear Chat
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="bg-red-50 border-b border-red-200 px-6 py-3 flex-shrink-0">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 bg-gray-50 overflow-hidden">
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