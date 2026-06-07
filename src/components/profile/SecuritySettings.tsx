import { useState } from "react";
import DeleteProfileModal from "./DeleteProfileModal";
import UpdateProfileForm from "./UpdatePasswordForm";

export default function SecuritySettings() {
    const [deleteAcctModalOpen, setDeleteAcctModalOpen] = useState(false);

    return (
        <>
            <div className="space-y-8">
                <UpdateProfileForm />

                <section className="rounded-xl border border-red-200 bg-red-50 p-5">
                    <h2 className="text-lg font-semibold text-red-600">
                        Danger Zone
                    </h2>

                    <p className="mt-2 text-sm text-red-500">
                        Permanently delete your account and all associated data.
                    </p>

                    <button
                        onClick={() => setDeleteAcctModalOpen(true)}
                        className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                    >
                        Delete Account
                    </button>
                </section>
            </div>
            {deleteAcctModalOpen && (
                <DeleteProfileModal
                    onClose={() => setDeleteAcctModalOpen(false)}
                />
            )}
        </>
    );
}
