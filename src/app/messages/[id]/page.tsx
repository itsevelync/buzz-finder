"use client";

import { useChat } from "@/context/ChatContext";
import ChatWindow from "@/components/chat/ChatWindow";

export default function ConversationPage() {
    const {
        conversationItems,
        currentUser,
        activeConversationId,
        setActiveConversationId,
        refreshConversations,
        setConversationList,
        pendingConversation,
        setPendingConversation,
        messageCache,
        setMessageCache,
    } = useChat();

    return (
        <div className="absolute right-0 z-50 flex h-full flex-col bg-slate-50 transition-transform duration-300 ease-in-out w-full md:static flex-1 translate-x-0 md:z-0">
            <ChatWindow
                conversationItems={conversationItems}
                currentUser={currentUser}
                activeConversationId={activeConversationId}
                setActiveConversationId={setActiveConversationId}
                refreshConversations={refreshConversations}
                setConversationList={setConversationList}
                pendingConversation={pendingConversation}
                setPendingConversation={setPendingConversation}
                messageCache={messageCache}
                setMessageCache={setMessageCache}
            />
        </div>
    );
}
