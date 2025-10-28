"use client";
import { auth } from "@/auth";
import Logout from "@/components/auth/Logout";
import UpdateProfileForm from "@/components/profile/UpdateProfileForm";
import React, { useState } from 'react';

export default async function Settings() {
    const [isToggled, setIsToggled] = useState(false);

    const session = await auth();

    const handleToggle = () => {
        setIsToggled(!isToggled);
    };

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
                    <button>Delete Account</button>
                </div>
            )}
            <div className="bg-white shadow-md rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">
                        Notifications
                    </h2>
                    <p>Manage your notifications here.</p>
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold">Email Notifications</h3>
                        <p>Receive updates and alerts via email.</p>
                        <button onClick={handleToggle}>
                            {isToggled ? "Off" : "On"}
                        </button>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold">Push Notifications</h3>
                        <p>Get real-time updates on your device.</p>
                        <button onClick={handleToggle}>
                            {isToggled ? "Off" : "On"}
                        </button>
                    </div>
                </div>
    <div className="m-4">
        <h1 className="text-4xl font-bold">Settings</h1>
        <div className="text-2xl font-semibold">
            <h2>Profile</h2>
                <li className="text-sm font-normal">Edit Profile Picture</li>
            <h2>Notifications</h2>
                <li className="text-sm font-normal">Email Notifications</li>
                <li className="text-sm font-normal">Push Notifications</li>
            <h2>Account</h2>
                <li className="text-sm font-normal">Change Password</li>
                <li className="text-sm font-normal">Delete Account</li>
            <h2>Display</h2>
                <li className="text-sm font-normal">Dark/Light mode toggle</li>
            <h2>Help</h2>
                <li className="text-sm font-normal">Report a Problem</li>
                <li className="text-sm font-normal">FAQs</li>
        </div>
    </div>
        </div>
    );
}
