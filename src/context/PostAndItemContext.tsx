"use client";

import { archiveOldItems } from "@/actions/ItemFilter";
import { PlainItem } from "@/model/Item";
import { LostItemPost } from "@/model/LostItemPost";
import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react";

type PostAndItemContextType = {
    items: PlainItem[];
    lostItemPosts: LostItemPost[];
    loading: boolean;
    error: boolean;

    addItem: (item: PlainItem) => void;
    updateItem: (id: string, updates: Partial<PlainItem>) => void;
    deleteItem: (id: string) => void;

    addLostItemPost: (item: LostItemPost) => void;
    updateLostItemPost: (id: string, updates: Partial<LostItemPost>) => void;
    deleteLostItemPost: (id: string) => void;

    refresh: () => Promise<void>;
};

const PostAndItemContext = createContext<PostAndItemContextType | undefined>(
    undefined,
);

export function PostAndItemProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<PlainItem[]>([]);
    const [lostItemPosts, setLostItemPosts] = useState<LostItemPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const refresh = async () => {
        try {
            setLoading(true);
            setError(false);

            const [itemRes, lostItemPostsRes] = await Promise.all([
                fetch("/api/items"),
                fetch("/api/lost-item-posts"),
            ]);

            if (!itemRes.ok || !lostItemPostsRes.ok) {
                throw new Error("Failed to fetch data");
            }

            const [itemsData, lostItemPostsData] = await Promise.all([
                itemRes.json(),
                lostItemPostsRes.json(),
            ]);

            setItems(archiveOldItems(itemsData));
            setLostItemPosts(lostItemPostsData);
        } catch (error) {
            console.error(error);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh();
    }, []);

    const addItem = (item: PlainItem) => {
        setItems((prev) => [...prev, item]);
    };

    const updateItem = (id: string, updates: Partial<PlainItem>) => {
        setItems((prev) =>
            prev.map((item) =>
                item._id === id ? { ...item, ...updates } : item,
            ),
        );
    };

    const deleteItem = (id: string) => {
        setItems((prev) => prev.filter((item) => item._id !== id));
    };

    const addLostItemPost = (post: LostItemPost) => {
        setLostItemPosts((prev) => [...prev, post]);
    };

    const updateLostItemPost = (id: string, updates: Partial<LostItemPost>) => {
        setLostItemPosts((prev) =>
            prev.map((post) =>
                post._id.toString() === id ? { ...post, ...updates } : post,
            ),
        );
    };

    const deleteLostItemPost = (id: string) => {
        setLostItemPosts((prev) =>
            prev.filter((post) => post._id.toString() !== id),
        );
    };

    return (
        <PostAndItemContext.Provider
            value={{
                items,
                lostItemPosts,
                loading,
                error,
                addItem,
                updateItem,
                deleteItem,
                addLostItemPost,
                updateLostItemPost,
                deleteLostItemPost,
                refresh,
            }}
        >
            {children}
        </PostAndItemContext.Provider>
    );
}

export function usePostAndItem() {
    const context = useContext(PostAndItemContext);

    if (!context) {
        throw new Error(
            "usePostAndItem must be used within PostAndItemProvider",
        );
    }

    return context;
}
