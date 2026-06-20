"use client";

import { useChat } from "@/context/ChatContext";
import ChatConversationsList from "./ChatConversationsList";
import ChatNewConversationSearch from "./ChatNewConversationSearch";
import { LuSquarePen, LuX } from "react-icons/lu";

export default function ChatSidebarShell() {
    const {
        users,
        conversationItems,
        pendingConversation,
        currentUser,
        setPendingConversation,
        setActiveConversationId,
        isSearching,
        setIsSearching,
    } = useChat();

    return (
        <aside className="flex h-full w-full md:w-1/3 lg:w-95 flex-col bg-background md:border-r md:border-buzz-blue/10">
            <div className="border-b border-buzz-blue/10 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-buzz-blue">
                        Messages
                    </h1>
                    <button
                        onClick={() => setIsSearching(!isSearching)}
                        className="p-2 rounded-full hover:bg-buzz-blue/5 text-buzz-blue transition-colors"
                        aria-label={
                            isSearching ? "Close search" : "New message"
                        }
                    >
                        {isSearching ? (
                            <LuX className="h-6 w-6" />
                        ) : (
                            <LuSquarePen className="h-6 w-6" />
                        )}
                    </button>
                </div>

                {isSearching && (
                    <div className="animate-in fade-in duration-200 mt-4">
                        <ChatNewConversationSearch
                            users={users}
                            conversationItems={conversationItems}
                            pendingConversation={pendingConversation}
                            currentUser={currentUser}
                            setPendingConversation={setPendingConversation}
                            setActiveConversationId={setActiveConversationId}
                            setIsSearching={setIsSearching}
                        />
                    </div>
                )}
            </div>

            <ChatConversationsList
                conversationItems={conversationItems}
                activeConversationId={useChat().activeConversationId}
                setActiveConversationId={setActiveConversationId}
            />
        </aside>
    );
}
