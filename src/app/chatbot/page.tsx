import { Metadata } from "next";
import ChatbotClient from "./ChatbotClient";

export const metadata: Metadata = {
    title: "BuzzBot - BuzzFinder",
};

export default function ChatbotPage() {
    return <ChatbotClient />;
}
