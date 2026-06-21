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
        <div className="space-y-8">
            <UpdateProfileForm />

            <section className="rounded-lg border border-red-200 bg-red-50 p-5">
                <h2 className="text-lg font-semibold text-red-600">
                    Danger Zone
                </h2>

                <p className="mt-2 text-sm text-red-500">
                    Permanently delete your account and all associated data.
                </p>

                <button
                    onClick={handleOpenDeleteProfileModal}
                    className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                >
                    Delete Account
                </button>
            </section>
        </div>
    );
}
