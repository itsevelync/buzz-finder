"use client";

import React, { useEffect, useState, useRef } from 'react';
import { pusherClient } from '@/lib/pusherClient';
import { IMessage } from '@/model/message.model';
import { useChatStore } from '@/hooks/useChatStore';
import { Channel } from 'pusher-js';

interface ChatWindowProps {
    conversationId: string;
    currentUserId: string;
}

export function ChatWindow({ conversationId, currentUserId }: ChatWindowProps) {
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);


    const { messages, addMessage, setInitialMessages } = useChatStore();
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // Fetch  messages
useEffect(() => {
    const fetchMessages = async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`/api/messages/${conversationId}`);
            const data: IMessage[] = await res.json();
            setInitialMessages(data);
        } catch (error) {
            console.error('Failed to fetch messages', error);
        } finally {
            setIsLoading(false);
        }
    };
    fetchMessages();
}, [conversationId, setInitialMessages]);

  // Subscribe to Pusher channel
useEffect(() => {
    if (!conversationId) return;

    const channel: Channel = pusherClient.subscribe(conversationId);

    const handleNewMessage = (message: IMessage) => {
        addMessage(message);
    };
    
    channel.bind('new-message', handleNewMessage);

    return () => {
    channel.unbind('new-message', handleNewMessage);
    pusherClient.unsubscribe(conversationId);
    };
}, [conversationId, addMessage]);

  // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

  // Handle new message
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    try {
    await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        text: newMessage,
        senderId: currentUserId,
        conversationId: conversationId,
        }),
    });
    setNewMessage('');
    } catch (error) {
    console.error('Failed to send message', error);
    }
  };

return (
    <div className="flex flex-col h-[500px] w-full max-w-lg border border-[#003057] rounded-lg bg-white text-[#262626] font-['Mona_Sans',_sans-serif] shadow-lg">
    
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoading && <div className="text-center text-gray-500">Loading messages...</div>}
            
            {!isLoading && messages.map((message) => {
            const isSender = message.senderId === currentUserId;
            return (
                <div key={message._id} className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
                    <div
                        className={`p-3 rounded-lg max-w-[80%] shadow-sm ${
                            isSender 
                            ? 'bg-[#003057] text-white'
                            : 'bg-gray-200 text-[#262626]'
                        }`}
                    >
                        <p className="break-words">{message.text}</p>
                    </div>
                </div>
            );
            })}
            <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="flex p-4 border-t border-[#003057]">
            <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 p-2 border border-[#003057] rounded-l-md text-[#262626] bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#b3a369] focus:border-transparent"
            />
            <button
                type="submit"
                className="p-2 px-4 bg-[#b3a369] text-[#003057] rounded-r-md font-semibold hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-[#b3a369] focus:ring-offset-2 transition-colors duration-200"
                >
                Send
            </button>
        </form>
    </div>
  );
}