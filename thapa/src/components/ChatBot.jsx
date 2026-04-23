import React, { useState, useEffect, useRef } from 'react';
import './ChatBot.css';

// Simple Offline Knowledge Base for the ChatBot
const getOfflineResponse = (message) => {
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg.includes('safe')) {
        return `**Yes, vaccines are exceptionally safe.** 
        
They undergo rigorous testing and clinical trials before being approved for use. Severe side effects are extremely rare. The benefits of preventing dangerous diseases far outweigh the minimal risks of vaccination.`;
    }
    
    if (lowerMsg.includes('multiple') || lowerMsg.includes('once')) {
        return `**Yes, it is completely safe for a child to get multiple vaccines at the same time.**
        
Scientific data shows that getting several vaccines at once does not cause any chronic health problems. A baby's immune system is strong enough to handle the immune challenge of multiple vaccines. It also means fewer office visits and less anxiety for the child!`;
    }
    
    if (lowerMsg.includes('miss') || lowerMsg.includes('late')) {
        return `**Don't worry if you miss a dose!**
        
If your child misses a vaccine dose, you do not need to restart the entire series. Just contact your pediatrician or healthcare provider to schedule the next dose as soon as possible to get back on track.`;
    }

    if (lowerMsg.includes('side effect') || lowerMsg.includes('fever') || lowerMsg.includes('pain')) {
        return `**Mild side effects are normal.**
        
Common side effects include:
• Soreness or redness where the shot was given
• A mild fever
• Fussiness or tiredness

These usually go away on their own within a few days. You can use a cool, damp cloth to help with soreness. If the fever is high or you are concerned, please contact your doctor.`;
    }

    if (lowerMsg.includes('hi') || lowerMsg.includes('hello')) {
        return "Hello! I am VaxiCare AI (Offline Mode). How can I help you with your child's vaccinations today?";
    }

    return `I'm a specialized offline assistant for VaxiCare. I can answer common questions about:
• Vaccine safety
• Receiving multiple vaccines
• What to do if you miss a dose
• Common side effects

Could you please rephrase your question using some of those keywords?`;
};

const ChatBot = ({ isOpen, onClose, initialMessage }) => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am VaxiCare AI. How can I help you with your vaccination queries today?' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Handle incoming initial message from props
    useEffect(() => {
        if (isOpen && initialMessage) {
            handleSend(initialMessage);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, initialMessage]);

    const handleSend = async (textToSend = input) => {
        if (!textToSend.trim()) return;

        // Add user message
        const newMessages = [...messages, { role: 'user', content: textToSend }];
        setMessages(newMessages);
        setInput('');
        setIsTyping(true);

        // Simulate network delay for a more natural feel
        setTimeout(() => {
            const aiReply = getOfflineResponse(textToSend);
            setMessages(prev => [...prev, { role: 'assistant', content: aiReply }]);
            setIsTyping(false);
        }, 1000);
    };

    if (!isOpen) return null;

    return (
        <div className="vx-chatbot-overlay" onClick={onClose}>
            <div className="vx-chatbot-window" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="vx-chat-header">
                    <div className="vx-chat-header-left">
                        <div className="vx-chat-avatar">
                            <span className="material-symbols-outlined">smart_toy</span>
                        </div>
                        <div>
                            <div className="vx-chat-title">VaxiCare AI</div>
                            <div className="vx-chat-subtitle">
                                <span className="vx-online-dot"></span> Offline Assistant
                            </div>
                        </div>
                    </div>
                    <div className="vx-chat-header-actions">
                        <button className="vx-icon-btn" onClick={onClose}>
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                <div className="vx-disclaimer">
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>info</span>
                    Local mode active. No data is sent to the internet.
                </div>

                {/* Messages Area */}
                <div className="vx-chat-messages">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`vx-message-row ${msg.role === 'user' ? 'vx-row-user' : 'vx-row-ai'}`}>
                            {msg.role === 'assistant' && (
                                <div className="vx-msg-avatar">
                                    <span className="material-symbols-outlined">smart_toy</span>
                                </div>
                            )}
                            <div className={`vx-chat-bubble ${msg.role === 'user' ? 'vx-bubble-user' : 'vx-bubble-ai'}`}>
                                {msg.role === 'assistant' ? (
                                    <div className="vx-ai-content">
                                        {msg.content.split('\n').map((line, i) => {
                                            if (line.trim().startsWith('•')) {
                                                return <div key={i} className="vx-ai-bullet">{line.replace('•', '').trim()}</div>;
                                            }
                                            return (
                                                <p key={i} className="vx-ai-para">
                                                    {line.split('**').map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}
                                                </p>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    msg.content
                                )}
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="vx-message-row vx-row-ai">
                            <div className="vx-msg-avatar">
                                <span className="material-symbols-outlined">smart_toy</span>
                            </div>
                            <div className="vx-chat-bubble vx-bubble-ai">
                                <div className="vx-typing-indicator">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Suggested Questions */}
                <div className="vx-chat-input-area" style={{ paddingTop: '8px' }}>
                    {messages.length < 3 && (
                        <div className="vx-suggestions">
                            <div className="vx-suggestions-label">Suggested</div>
                            <div className="vx-suggestions-grid" style={{ marginBottom: '10px' }}>
                                <button className="vx-suggestion-pill" onClick={() => handleSend("Are vaccines safe?")}>Are vaccines safe?</button>
                                <button className="vx-suggestion-pill" onClick={() => handleSend("What if I miss a dose?")}>Missed a dose?</button>
                            </div>
                        </div>
                    )}

                    {/* Input */}
                    <div className="vx-input-row">
                        <input
                            type="text"
                            className="vx-chat-input"
                            placeholder="Type a question..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button 
                            className={`vx-send-btn ${!input.trim() ? 'vx-send-disabled' : ''}`}
                            onClick={() => handleSend()}
                            disabled={!input.trim()}
                        >
                            <span className="material-symbols-outlined">send</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatBot;
