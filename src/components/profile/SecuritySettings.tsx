import { useUser } from "@/context/UserContext";
import DeleteProfileModal from "./DeleteProfileModal";
import UpdateProfileForm from "./UpdatePasswordForm";
import { useModal } from "@/context/ModalContext";

export default function SecuritySettings() {
    const { openModal } = useModal();
    const {user} = useUser();

    function handleOpenDeleteProfileModal() {
        openModal(<DeleteProfileModal />, {
            maxWidth: "2xl",
        });
    }

    if (!user) return;

    return (
        <div className="space-y-10">
            <UpdateProfileForm />

            <section className="rounded-lg bg-red-50/50 border border-dashed border-red-300 p-5">
                <h2 className="text-xl font-semibold text-red-600">
                    Danger Zone
                </h2>

                <p className="mt-2 text-sm text-foreground/80">
                    Permanently delete your account and all associated data.
                </p>

                <button
                    onClick={handleOpenDeleteProfileModal}
                    className="mt-4 rounded-md font-semibold px-4 py-1.5 text-white bg-red-600 hover:brightness-90"
                >
                    Delete Account
                </button>
            </section>
        </div>
    );
}
