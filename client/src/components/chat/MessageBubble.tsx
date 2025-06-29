import type { ConversationMessage } from '../../../../shared/types';

interface MessageBubbleProps {
    message: ConversationMessage;
}

function MessageBubble({ message }: MessageBubbleProps) {
    const isUser = 'user' === message.type;
    const isSystem = 'system' === message.type;
    
    const formatTime = (timestamp: Date) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (isSystem) {
        return (
            <div className="flex justify-center my-4">
                <div className="bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-full max-w-md text-center">
                    {message.content}
                </div>
            </div>
        );
    }

    return (
        <div className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl ${isUser ? 'ml-auto' : 'mr-auto'}`}>
                <div
                    className={`px-4 py-2 rounded-2xl ${
                        isUser
                            ? 'bg-blue-500 text-white rounded-br-md'
                            : 'bg-gray-100 text-gray-900 rounded-bl-md'
                    }`}
                >
                    <div className="break-words whitespace-pre-wrap">
                        {message.content}
                    </div>
                </div>
                
                <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
                    <span>{formatTime(message.timestamp)}</span>
                    {message.metadata?.error && (
                        <span className="text-red-500 ml-2">Error</span>
                    )}
                    {message.metadata?.processingTime && (
                        <span className="ml-2">
                            ({message.metadata.processingTime}ms)
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MessageBubble;