"use client";

import Image from "next/image";

import { useSession } from "next-auth/react";
import { useUser } from "@/context/UserContext";

import { useState } from "react";
import { updateUser } from "@/actions/User";
import { UserUpdateData } from "@/actions/User";
import FormInput from "../ui/FormInput";

export default function ProfileSettings() {
    const { user, setUser } = useUser();
    const [error, setError] = useState("");

    const [name, setName] = useState(user?.name ?? "");
    const [username, setUsername] = useState(user?.username ?? "");
    const [email, setEmail] = useState(user?.email);
    const [phoneNum, setPhoneNum] = useState(user?.phoneNum ?? "");
    const [description, setDescription] = useState(user?.description ?? "");
    const [profileImage, setProfileImage] = useState<File | null>(null);

    const { update } = useSession();

    if (user == null) {
        return;
    }

    async function uploadImage() {
        if (!profileImage) return null;

        const formdata = new FormData();

        formdata.append("file", profileImage);
        formdata.append(
            "upload_preset",
            process.env.NEXT_PUBLIC_UPLOAD_PRESET as string,
        );

        try {
            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUD_NAME}/image/upload`,
                {
                    method: "POST",
                    body: formdata,
                },
            );

            const data = await res.json();
            const image = {
                id: data["public_id"],
                url: data["secure_url"],
            };

            return image.url;
        } catch (error) {
            console.log(error);
        }
    }

    async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!user) return;

        const uploadedImageUrl = await uploadImage();
        const nextImage = uploadedImageUrl ?? user.image;

        const values: UserUpdateData = {
            name,
            username,
            phoneNum: phoneNum ?? undefined,
            description: description ?? undefined,
            image: nextImage ?? undefined,
        };

        const result = await updateUser(user._id.toString(), values);

        if (result.error) {
            setError(result.error);
            return;
        }

        const updatedUser = { ...user, ...values };
        setUser(updatedUser);

        alert("Profile updated successfully");

        await update({
            name: values.name,
            image: nextImage,
            username: values.username,
            phoneNum: values.phoneNum,
            description: values.description,
        });
    }

    return (
        <div className="space-y-8">
            <section>
                <h2 className="mb-4 text-lg font-semibold">
                    Profile Information
                </h2>

                {error && <p className="text-red-500">{error}</p>}

                <form onSubmit={handleSubmit} className="form">
                    <div className="mb-6 flex items-center gap-6">
                        <Image
                            src={
                                profileImage
                                    ? URL.createObjectURL(profileImage)
                                    : user.image || "/default-icon.svg"
                            }
                            alt="Profile"
                            width={96}
                            height={96}
                            className="h-20 w-20 object-cover rounded-full"
                        />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) setProfileImage(f);
                            }}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <FormInput
                            label="Full Name"
                            name="full-name"
                            placeholder="George P. Burdell"
                            value={name}
                            onInputChange={(e) => setName(e.target.value)}
                        />
                        <FormInput
                            label="Username"
                            name="username"
                            placeholder="@gburdell3"
                            value={username}
                            onInputChange={(e) => setUsername(e.target.value)}
                        />
                        <FormInput
                            label="Email"
                            type="email"
                            name="email"
                            placeholder="gburdell3@gatech.edu"
                            value={email}
                            onInputChange={(e) => setEmail(e.target.value)}
                        />
                        <FormInput
                            label="Phone Number"
                            name="phone-number"
                            placeholder="(404) 555-1234"
                            value={phoneNum || ""}
                            onInputChange={(e) => setPhoneNum(e.target.value)}
                        />
                    </div>

                    <FormInput
                        isTextarea
                        name="bio"
                        label="Bio"
                        rows={5}
                        placeholder="Tell people about yourself..."
                        value={description || ""}
                        onInputChange={(e) => setDescription(e.target.value)}
                    />

                    <div className="mt-6">
                        <button className="rounded-lg bg-buzz-blue px-5 py-2 font-medium text-background transition hover:opacity-90">
                            Save Changes
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}
