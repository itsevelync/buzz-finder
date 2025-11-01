"use client";
import { Session } from "next-auth";
import Logout from "@/components/auth/Logout";
import UpdateProfileForm from "@/components/profile/UpdateProfileForm";
import React, { useState } from "react";

interface Props {
  session: Session | null;
}

async function handleDeleteAccount({ session }: Props) {
  if (!session?.user?._id) return;
  const confirmDelete = confirm("Are you sure you want to delete your account? This cannot be undone.");
  if (!confirmDelete) return;
  try {
    const res = await fetch(`/api/user?id=${session.user._id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) {
      alert(`Error: ${data.error}`);
      return;
    }
    alert("Account deleted successfully.");
    window.location.href = "/";
  } catch (err: any) {
    alert(`Error: ${err.message}`);
  }
}

export default function SettingsClient({ session }: Props) {
  const [emailToggle, setEmailToggle] = useState(false);
  const [pushToggle, setPushToggle] = useState(false);
  const [lightMode, setLightMode] = useState(true);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Settings</h1>

      {session?.user?._id && (
        <div className="bg-yellow-50 shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
          <UpdateProfileForm userID={session.user._id} />
          <Logout />
          <button className="mt-4 text-red-600" onClick={() => handleDeleteAccount({ session })}>Delete Account</button>
        </div>
      )}

      <div className="bg-yellow-50 shadow-md rounded-lg p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Notifications</h2>

        {/* Email Toggle */}
        <div className="flex items-center mt-4">
          <h3 className="text-lg font-semibold mr-2">Email Notifications:</h3>
          <button className={`rounded-md px-2 py-2 border ${emailToggle ? "bg-[#003056] text-white border-blue-500" : "bg-white text-black border-gray-300"}`} onClick={() => setEmailToggle((v) => !v)}>
            {emailToggle ? "On" : "Off"}
          </button>
        </div>

        {/* Push Toggle */}
        <div className="flex items-center mt-4">
          <h3 className="text-lg font-semibold mr-2">Push Notifications:</h3>
          <button className={`rounded-md px-2 py-2 border ${pushToggle ? "bg-[#003056] text-white border-blue-500" : "bg-white text-black border-gray-300"}`} onClick={() => setPushToggle((v) => !v)}>
            {pushToggle ? "On" : "Off"}
          </button>
        </div>
      </div>

      <div className="bg-yellow-50 shadow-md rounded-lg p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Display</h2>
        <div className="flex items-center mt-4">
          <h3 className="text-lg font-semibold mr-2">Light/Dark Mode:</h3>
          <button className={`rounded-md px-2 py-2 border ${lightMode ? "bg-[#003056] text-white border-blue-500" : "bg-white text-black border-gray-300"}`} onClick={() => setLightMode((v) => !v)}>
            {lightMode ? "On" : "Off"}
          </button>
        </div>
      </div>
    </div>
  );
}