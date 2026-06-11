import { ChatUserSummary, ConversationSummary } from "@/lib/chat";
import {
    Dispatch,
    SetStateAction,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import Image from "next/image";

type ChatNewConversationSearchProps = {
    users: ChatUserSummary[];
    conversationItems: ConversationSummary[];
    pendingConversation: ConversationSummary | null;
    currentUser: ChatUserSummary;
    setPendingConversation: Dispatch<
        SetStateAction<ConversationSummary | null>
    >;
    setActiveConversationId: Dispatch<SetStateAction<string | null>>;
};

export default function ChatNewConversationSearch({
    users,
    conversationItems,
    pendingConversation,
    currentUser,
    setPendingConversation,
    setActiveConversationId,
}: ChatNewConversationSearchProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUserIndex, setSelectedUserIndex] = useState(0);
    const searchOptionRefs = useRef<(HTMLButtonElement | null)[]>([]);

    const sortedUsers = useMemo(
        () =>
            [...users].sort((left, right) =>
                left.name.localeCompare(right.name),
            ),
        [users],
    );

    const filteredUsers = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        const existingPartnerIds = new Set(
            conversationItems.map((item) => item.partner?._id),
        );

        return sortedUsers.filter((user) => {
            if (existingPartnerIds.has(user._id)) {
                return false;
            }

            return (
                user.name.toLowerCase().includes(query) ||
                user.username.toLowerCase().includes(query)
            );
        });
    }, [searchTerm, sortedUsers, conversationItems]);

    const visibleUsers = useMemo(() => {
        const pendingParticipantId = pendingConversation
            ? (pendingConversation.participants.find(
                  (p) => p.userId !== currentUser._id,
              )?.userId ?? null)
            : null;

        if (!pendingParticipantId) {
            return filteredUsers;
        }

        return filteredUsers.filter(
            (user) => user._id !== pendingParticipantId,
        );
    }, [currentUser._id, filteredUsers, pendingConversation]);

    useEffect(() => {
        setSelectedUserIndex(0);
    }, [searchTerm]);

    useEffect(() => {
        if (visibleUsers.length === 0) {
            setSelectedUserIndex(0);
            return;
        }

        setSelectedUserIndex((current) =>
            Math.min(current, visibleUsers.length - 1),
        );
    }, [visibleUsers.length]);

    useEffect(() => {
        if (!searchTerm.trim() || visibleUsers.length === 0) {
            return;
        }

        const option = searchOptionRefs.current[selectedUserIndex];

        option?.scrollIntoView({
            block: "nearest",
        });
    }, [searchTerm, selectedUserIndex, visibleUsers.length]);

    const hasSearchQuery = searchTerm.trim().length > 0;
    const selectedSearchUser = visibleUsers[selectedUserIndex] ?? null;

    const selectSearchUser = (userId: string) => {
        void startConversation(userId);
        setSearchTerm("");
        setSelectedUserIndex(0);
    };

    const startConversation = async (participantId: string) => {
        if (participantId === currentUser._id) {
            return;
        }

        // Create a temporary pending conversation locally. The real conversation
        // is created on send to avoid calling the conversations API until the
        // user actually sends the first message.
        const pendingId = `pending-${participantId}`;
        const partner = users.find((u) => u._id === participantId) ?? null;

        const pendingConversation: ConversationSummary = {
            _id: pendingId,
            participants: [
                { userId: currentUser._id.toString(), lastReadAt: new Date() },
                { userId: participantId.toString(), lastReadAt: new Date() },
            ],
            lastMessageAt: "",
            partner,
            lastMessage: null,
        };

        setPendingConversation(pendingConversation);
        setActiveConversationId(pendingId);
    };

    return (
        <>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                New conversation
            </p>
            <div className="relative mt-2">
                <input
                    name="search-users"
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    onKeyDown={(event) => {
                        if (!hasSearchQuery || visibleUsers.length === 0) {
                            return;
                        }

                        if (event.key === "ArrowDown") {
                            event.preventDefault();
                            setSelectedUserIndex((current) =>
                                current >= visibleUsers.length - 1
                                    ? 0
                                    : current + 1,
                            );
                            return;
                        }

                        if (event.key === "ArrowUp") {
                            event.preventDefault();
                            setSelectedUserIndex((current) =>
                                current <= 0
                                    ? visibleUsers.length - 1
                                    : current - 1,
                            );
                            return;
                        }

                        if (event.key === "Enter") {
                            event.preventDefault();
                            const user = selectedSearchUser ?? visibleUsers[0];

                            if (user) {
                                selectSearchUser(user._id);
                            }
                        }
                    }}
                    placeholder="Find a user by name or username"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-buzz-gold focus:bg-white focus:ring-2 focus:ring-buzz-gold/20"
                />

                {hasSearchQuery && (
                    <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
                        {visibleUsers.length === 0 ? (
                            <div className="rounded-lg bg-slate-50 px-4 py-5 text-sm text-slate-500">
                                No people match your search.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {visibleUsers.map((user, index) => (
                                    <button
                                        key={user._id}
                                        ref={(element) => {
                                            searchOptionRefs.current[index] =
                                                element;
                                        }}
                                        type="button"
                                        onClick={() => {
                                            selectSearchUser(user._id);
                                        }}
                                        onMouseEnter={() =>
                                            setSelectedUserIndex(index)
                                        }
                                        className={`flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition ${
                                            index === selectedUserIndex
                                                ? "border-buzz-gold bg-buzz-gold/10"
                                                : "border-transparent bg-slate-50 hover:border-buzz-gold/40 hover:bg-white"
                                        }`}
                                    >
                                        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-buzz-blue/10 text-sm font-semibold text-buzz-blue">
                                            {user.image ? (
                                                <Image
                                                    src={user.image}
                                                    alt={user.name}
                                                    width={50}
                                                    height={50}
                                                    className="h-full w-full rounded-full object-cover"
                                                />
                                            ) : (
                                                <span>
                                                    {user.name
                                                        .slice(0, 1)
                                                        .toUpperCase()}
                                                </span>
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-semibold text-slate-800">
                                                {user.name}
                                            </p>
                                            <p className="truncate text-sm text-slate-500">
                                                @{user.username}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
