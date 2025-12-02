
import React, { useState, useEffect, useRef } from 'react';
import { Narrative, ChatMessage } from '../types';
import { createNarrativeChat } from '../services/geminiService';
import { Chat, GenerateContentResponse } from "@google/genai";
import { SendIcon, SparklesIcon, XIcon, ChatIcon, LoadingSpinner } from './icons/GeneralIcons';
import { PlanRenderer } from './PlanRenderer';
import { generateId } from '../utils/generateId';
import clsx from 'clsx';

interface AnalystCopilotProps {
    narrative: Narrative;
    onClose: () => void;
}

export const AnalystCopilot: React.FC<AnalystCopilotProps> = ({ narrative, onClose }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chatSession, setChatSession] = useState<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const chat = createNarrativeChat(narrative);
        setChatSession(chat);
        
        // Add initial greeting
        setMessages([{
            id: generateId(),
            role: 'model',
            text: `I'm ready to analyze the "${narrative.title}" narrative with you. How can I assist your investigation?`,
            timestamp: new Date()
        }]);
    }, [narrative]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || !chatSession || isLoading) return;

        const userMessage: ChatMessage = {
            id: generateId(),
            role: 'user',
            text: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Optimistic update for UI responsiveness
            const loadingId = generateId();
            setMessages(prev => [...prev, { id: loadingId, role: 'model', text: '', isThinking: true }]);

            const result = await chatSession.sendMessageStream({ message: userMessage.text });
            
            let fullText = '';
            
            for await (const chunk of result) {
                const c = chunk as GenerateContentResponse;
                if (c.text) {
                    fullText += c.text;
                    setMessages(prev => prev.map(msg => 
                        msg.id === loadingId 
                            ? { ...msg, text: fullText, isThinking: false } 
                            : msg
                    ));
                }
            }

        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { 
                id: generateId(), 
                role: 'model', 
                text: "I encountered an error processing your request. Please try again." 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-background shadow-2xl border-l border-border z-40 transform transition-transform duration-300 ease-in-out flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-background-secondary">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <SparklesIcon className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-text-primary">Analyst Copilot</h2>
                        <p className="text-xs text-text-secondary">Context-Aware Investigation</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 text-text-secondary hover:text-text-primary rounded-full hover:bg-background-hover transition-colors">
                    <XIcon className="h-5 w-5" />
                </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
                {messages.map((msg) => (
                    <div 
                        key={msg.id} 
                        className={clsx(
                            "flex flex-col max-w-[85%]", 
                            msg.role === 'user' ? "self-end items-end" : "self-start items-start"
                        )}
                    >
                        <div className={clsx(
                            "px-4 py-3 rounded-2xl text-sm shadow-sm",
                            msg.role === 'user' 
                                ? "bg-primary text-white rounded-br-none" 
                                : "bg-background-card border border-border text-text-primary rounded-bl-none"
                        )}>
                            {msg.isThinking && !msg.text ? (
                                <div className="flex gap-1 h-5 items-center px-1">
                                    <span className="w-1.5 h-1.5 bg-text-secondary/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-1.5 h-1.5 bg-text-secondary/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-1.5 h-1.5 bg-text-secondary/50 rounded-full animate-bounce"></span>
                                </div>
                            ) : (
                                <PlanRenderer text={msg.text} />
                            )}
                        </div>
                        <span className="text-[10px] text-text-disabled mt-1 px-1">
                           {msg.role === 'model' ? 'Copilot' : 'You'}
                        </span>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-background border-t border-border">
                <form onSubmit={handleSend} className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about this narrative..."
                        className="w-full pl-4 pr-12 py-3 bg-background-secondary border border-border rounded-xl text-sm text-text-primary placeholder-text-secondary focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none transition-all"
                        disabled={isLoading}
                    />
                    <button 
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isLoading ? <LoadingSpinner className="h-4 w-4" /> : <SendIcon className="h-4 w-4" />}
                    </button>
                </form>
            </div>
        </div>
    );
};
