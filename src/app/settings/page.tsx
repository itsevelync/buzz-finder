import { auth } from "@/auth";
import Logout from "@/components/auth/Logout";
import UpdateProfileForm from "@/components/profile/UpdateProfileForm";

export default async function Settings() {
    const session = await auth();

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold">Settings</h1>
            {session?.user?._id && (
                <div className="bg-white shadow-md rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">
                        Account Settings
                    </h2>
                    <p>Manage your account preferences here.</p>
                    <div className="mt-6 bg-white shadow-md rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">
                            Update Profile
                        </h2>
                        <UpdateProfileForm userID={session.user._id} />
                    </div>
                    <Logout />
                </div>
            )}
        </div>
    );
}
