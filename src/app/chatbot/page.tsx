import { Metadata } from "next";
import ChatbotClient from "./ChatbotClient";

export const metadata: Metadata = {
    title: "BuzzBot",
};

export default function ChatbotPage() {
    return <ChatbotClient />;
}
