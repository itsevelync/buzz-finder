"use client";

import Image from "next/image";
import type { User } from "@/model/User";

import { useSession } from "next-auth/react";
import { useUser } from "@/context/UserContext";

import { useState } from "react";
import { updateUser } from "@/actions/User";
import { UserUpdateData } from "@/actions/User";

interface EditProfileModalProps {
    onClose: () => void;
    user: User;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export default function EditProfileModal({
    onClose,
    user,
    setUser,
}: EditProfileModalProps) {
    const { setUser: setSharedUser } = useUser();
    const [error, setError] = useState("");
    const [name, setName] = useState(user?.name ?? "");
    const [username, setUsername] = useState(user?.username ?? "");
    const [phoneNum, setPhoneNum] = useState(user?.phoneNum ?? "");
    const [description, setDescription] = useState(user?.description ?? "");
    const [img, setImg] = useState<File | null>(null);
    const { update } = useSession();

    if (user == null) {
        return;
    }

    async function uploadImage() {
        if (!img) return null;

        const formdata = new FormData();

        formdata.append("file", img);
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

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const uploadedImageUrl = await uploadImage();
        const nextImage = uploadedImageUrl ?? user.image;

        const values: UserUpdateData = {
            name,
            username,
            phoneNum: phoneNum ?? undefined,
            description: description ?? undefined,
            image: nextImage ?? undefined,
        };

        const result = await updateUser(user._id, values);

        if (result.error) {
            setError(result.error);
            return;
        }

        const updatedUser = { ...user, ...values };

        setUser(updatedUser);
        setSharedUser(updatedUser);

        await update({
            name: values.name,
            image: nextImage,
            username: values.username,
            phoneNum: values.phoneNum,
            description: values.description,
        });

        onClose();
    }

    return (
        <div className="fixed z-100 flex items-center justify-center inset-0 bg-gray-600/50 h-full w-full">
            <div className="bg-white p-6 rounded-lg w-100">
                <h2 className="text-lg font-medium mb-4 text-buzz-blue">
                    Edit Profile
                </h2>

                {error && <p className="text-red-500">{error}</p>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="border p-2 rounded"
                        placeholder="Name"
                    />

                    <input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="border p-2 rounded"
                        placeholder="Username"
                    />

                    <input
                        value={phoneNum || ""}
                        onChange={(e) => setPhoneNum(e.target.value)}
                        className="border p-2 rounded"
                        placeholder="Phone Number"
                    />

                    <input
                        value={description || ""}
                        onChange={(e) => setDescription(e.target.value)}
                        className="border p-2 rounded"
                        placeholder="Description"
                    />

                    <div className="relative w-24 h-24">
                        <Image
                            unoptimized
                            src={
                                img
                                    ? URL.createObjectURL(img)
                                    : user.image || "/default-icon.svg"
                            }
                            alt="Profile"
                            width={96}
                            height={96}
                            className="w-24 h-24 rounded-full object-cover border"
                        />

                        <label className="absolute inset-0 flex items-center justify-center cursor-pointer rounded-full">
                            <span className="bg-white text-buzz-blue font-semibold px-2 py-1 rounded">
                                Edit
                            </span>
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full"
                                onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) setImg(f);
                                }}
                            />
                        </label>
                    </div>

                    <div className="flex justify-end gap-5">
                        <button type="button" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
