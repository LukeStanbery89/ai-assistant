import { useState, useRef, useEffect, type KeyboardEvent } from 'react';

interface ChatInputProps {
    onSendMessage: (message: string) => Promise<void>;
    disabled?: boolean;
    placeholder?: string;
}

function ChatInput({ 
    onSendMessage, 
    disabled = false, 
    placeholder = "Type your message..." 
}: ChatInputProps) {
    const [input, setInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        // Auto-focus the input when component mounts
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    }, []);

    const handleSubmit = async () => {
        const message = input.trim();
        if (!message || isSubmitting || disabled) {
            return;
        }

        setIsSubmitting(true);
        
        try {
            await onSendMessage(message);
            setInput('');
            
            // Reset textarea height and refocus on next tick
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
                // Use setTimeout to ensure DOM updates are complete before focusing
                setTimeout(() => {
                    if (textareaRef.current) {
                        textareaRef.current.focus();
                    }
                }, 0);
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            // Still focus on error for better UX
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.focus();
                }
            }, 0);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if ('Enter' === e.key) {
            if (e.shiftKey) {
                // Allow Shift+Enter for new lines
                return;
            } else {
                // Send message on Enter
                e.preventDefault();
                handleSubmit();
            }
        }
    };

    const handleInputChange = (value: string) => {
        setInput(value);
        
        // Auto-resize textarea
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    const canSend = input.trim().length > 0 && !isSubmitting && !disabled;

    return (
        <div className="border-t border-gray-200 dark:border-dark-700 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md px-4 py-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-start space-x-4">
                    <div className="flex-1 relative">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => handleInputChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            disabled={disabled || isSubmitting}
                            rows={1}
                            className={`w-full px-5 py-4 border border-gray-300 dark:border-dark-600 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-all duration-200 scrollbar-hide ${
                                disabled || isSubmitting 
                                    ? 'bg-gray-100 dark:bg-dark-800 cursor-not-allowed text-gray-400 dark:text-gray-500' 
                                    : 'bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100 shadow-sm hover:shadow-md'
                            }`}
                            style={{
                                minHeight: '56px',
                                maxHeight: '120px'
                            }}
                        />
                        
                        {(disabled || isSubmitting) && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-50/75 dark:bg-dark-800/75 rounded-2xl backdrop-blur-sm">
                                <div className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                    {isSubmitting ? 'Sending...' : 'Disconnected'}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <button
                        onClick={handleSubmit}
                        disabled={!canSend}
                        className={`min-w-14 h-14 px-4 rounded-2xl font-medium transition-all duration-200 shadow-sm flex items-center justify-center flex-shrink-0 ${
                            canSend
                                ? 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                                : 'bg-gray-300 dark:bg-dark-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        }`}
                        type="button"
                        style={{ height: '56px' }}
                        onMouseDown={(e) => e.preventDefault()} // Prevent focus loss when clicking button
                        aria-label="Send"
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                        )}
                    </button>
                </div>
                
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                    Press <kbd className="px-2 py-1 bg-gray-100 dark:bg-dark-800 rounded text-gray-600 dark:text-gray-300 font-mono text-xs">Enter</kbd> to send, <kbd className="px-2 py-1 bg-gray-100 dark:bg-dark-800 rounded text-gray-600 dark:text-gray-300 font-mono text-xs">Shift+Enter</kbd> for new line
                </div>
            </div>
        </div>
    );
}

export default ChatInput;