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
            <div className="flex justify-center my-6">
                <div className="bg-gray-100 dark:bg-dark-800 text-gray-600 dark:text-gray-400 text-sm px-6 py-3 rounded-2xl max-w-md text-center shadow-sm border border-gray-200 dark:border-dark-700">
                    {message.content}
                </div>
            </div>
        );
    }

    return (
        <div className={`flex mb-6 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl ${isUser ? 'ml-auto' : 'mr-auto'}`}>
                <div
                    className={`px-5 py-3 rounded-3xl shadow-sm ${
                        isUser
                            ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-br-lg'
                            : 'bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-dark-700 rounded-bl-lg'
                    }`}
                >
                    <div className="break-words whitespace-pre-wrap leading-relaxed">
                        {message.content}
                    </div>
                </div>
                
                <div className={`text-xs text-gray-500 dark:text-gray-400 mt-2 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
                    <span>{formatTime(message.timestamp)}</span>
                    {message.metadata?.error && (
                        <span className="text-red-500 dark:text-red-400 ml-2 font-medium">Error</span>
                    )}
                    {message.metadata?.processingTime && (
                        <span className="ml-2 text-gray-400 dark:text-gray-500">
                            ({message.metadata.processingTime}ms)
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MessageBubble;