import { useModal } from "@/context/ModalContext";
import { LuShare2 } from "react-icons/lu";
import ShareModal from "./ShareModal";

export default function SharePostButton() {
    const { openModal } = useModal();
    function openShareModal() {
        openModal(<ShareModal />);
    }

    return (
        <button
            onClick={openShareModal}
            className="sm:ml-auto flex items-center gap-2 text-sm text-foreground-90 hover:text-foreground hover:bg-foreground/3 border border-foreground/30 rounded px-3 py-1.5 transition"
        >
            <LuShare2 /> Share Post
        </button>
    );
}
