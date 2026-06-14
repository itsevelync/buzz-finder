"use client";

import Image from "next/image";
import { useSession } from "next-auth/react";
import { useUser } from "@/context/UserContext";
import { useState, ChangeEvent, ClipboardEvent, useEffect } from "react";
import { updateUser } from "@/actions/User";
import { UserUpdateData } from "@/actions/User";
import FormInput from "../ui/FormInput";
import { toast } from "react-toastify";

export default function ProfileSettings() {
    const { user, setUser } = useUser();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Formats digits only into (XXX) XXX-XXXX (Strictly for US numbers)
    const formatUSPhoneNumber = (value: string): string => {
        const digits = value.replace(/\D/g, "");
        const slicedDigits = digits.slice(0, 10);

        if (slicedDigits.length <= 3) return slicedDigits;
        if (slicedDigits.length <= 6) {
            return `(${slicedDigits.slice(0, 3)}) ${slicedDigits.slice(3)}`;
        }
        return `(${slicedDigits.slice(0, 3)}) ${slicedDigits.slice(3, 6)}-${slicedDigits.slice(6)}`;
    };

    // Existing fields
    const [name, setName] = useState(user?.name ?? "");
    const [username, setUsername] = useState(user?.username ?? "");
    const [email, setEmail] = useState(user?.email ?? "");
    const [hideEmail, setHideEmail] = useState(user?.hideEmail ?? false);
    const [description, setDescription] = useState(user?.description ?? "");
    const [profileImage, setProfileImage] = useState<File | null>(null);

    // Advanced Phone State Integration
    const usNumber =
        (user?.phoneNum &&
            user.phoneNum.length === 11 &&
            user.phoneNum.startsWith("1")) ||
        !user?.phoneNum;
    const [phoneNumber, setPhoneNumber] = useState(
        usNumber
            ? formatUSPhoneNumber((user?.phoneNum ?? "").slice(1))
            : `+${user?.phoneNum}`,
    );
    const [isUSNumber, setIsUSNumber] = useState(
        (user?.phoneNum &&
            user.phoneNum.length === 11 &&
            user.phoneNum.startsWith("1")) ||
            !user?.phoneNum,
    );

    // Social Media Fields State
    const [instagram, setInstagram] = useState(user?.instagram ?? "");
    const [discord, setDiscord] = useState(user?.discord ?? "");
    const [linkedIn, setLinkedin] = useState(user?.linkedIn ?? "");

    useEffect(() => {
        // Existing fields
        setName(user?.name ?? "");
        setUsername(user?.username ?? "");
        setEmail(user?.email ?? "");
        setHideEmail(user?.hideEmail ?? false);
        setDescription(user?.description ?? "");
        setPhoneNumber(
            usNumber
                ? formatUSPhoneNumber((user?.phoneNum ?? "").slice(1))
                : `+${user?.phoneNum}`,
        );
        setIsUSNumber(
            (user?.phoneNum &&
                user.phoneNum.length === 11 &&
                user.phoneNum.startsWith("1")) ||
                !user?.phoneNum,
        );
        setInstagram(user?.instagram ?? "");
        setDiscord(user?.discord ?? "");
        setLinkedin(user?.linkedIn ?? "");
    }, [usNumber, user]);

    const { update } = useSession();

    if (user == null) {
        return null;
    }

    const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;

        if (isUSNumber) {
            const updatedValue = formatUSPhoneNumber(value);
            setPhoneNumber(updatedValue);
        } else {
            const digitsOnly = value.replace(/\D/g, "").slice(0, 15);
            if (digitsOnly || value.includes("+")) {
                setPhoneNumber("+" + digitsOnly);
            } else {
                setPhoneNumber("");
            }
        }
    };

    const handleCountryCodeDropdownChange = (
        e: ChangeEvent<HTMLSelectElement>,
    ) => {
        const { value } = e.target;
        if (value === "custom") {
            setIsUSNumber(false);
            setPhoneNumber("");
        } else {
            setIsUSNumber(true);
            setPhoneNumber("");
        }
    };

    const cleanUsername = (value: string, allowedPattern: RegExp): string => {
        const cleaned = value.startsWith("@") ? value.slice(1) : value;
        return cleaned.replace(allowedPattern, "");
    };

    const handleUsernameChange = (
        e: ChangeEvent<HTMLInputElement>,
        platform: "instagram" | "discord" | "linkedIn",
    ) => {
        const { value } = e.target;
        let allowedPattern = /[^a-zA-Z0-9_\.]/g;

        if (platform === "linkedIn") {
            allowedPattern = /[^a-zA-Z0-9\-_]/g;
        } else if (platform === "discord") {
            allowedPattern = /[^a-z0-9_\.]/g;
        }

        const sanitizedValue = cleanUsername(value, allowedPattern);
        if (platform === "instagram") setInstagram(sanitizedValue);
        if (platform === "discord") setDiscord(sanitizedValue);
        if (platform === "linkedIn") setLinkedin(sanitizedValue);
    };

    const handleInstagramPaste = (e: ClipboardEvent<HTMLInputElement>) => {
        const pastedText = e.clipboardData.getData("text");
        const match = pastedText.match(
            /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9_\.]+)/i,
        );

        if (match && match[1]) {
            e.preventDefault();
            setInstagram(match[1]);
        }
    };

    const handleLinkedInPaste = (e: ClipboardEvent<HTMLInputElement>) => {
        const pastedText = e.clipboardData.getData("text");
        const match = pastedText.match(
            /(?:https?:\/\/)?(?:www\.)?linkedIn\.com\/in\/([a-zA-Z0-9\-_%]+)/i,
        );

        if (match && match[1]) {
            e.preventDefault();
            const rawUser = decodeURIComponent(match[1]);
            setLinkedin(rawUser.replace(/[^a-zA-Z0-9\-_]/g, ""));
        }
    };

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
            return data["secure_url"];
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!user) return;

        if (!name.trim()) {
            toast.error("Name is required.");
            return;
        }

        if (!username.trim()) {
            toast.error("Username is required.");
            return;
        }

        // 1. Custom Email Validation via Regex
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            toast.error("Please enter a valid email address.");
            document.getElementById("email")?.focus();
            return;
        }

        // 2. Advanced Phone String Calculation & Validation
        let finalFullPhoneNumber = "";
        if (phoneNumber) {
            const phoneDigits = phoneNumber.replace(/\D/g, "");

            if (isUSNumber) {
                if (phoneDigits.length !== 10) {
                    toast.error("US phone numbers must be exactly 10 digits.");
                    document.getElementById("phoneNumber")?.focus();
                    return;
                }
                finalFullPhoneNumber = `1${phoneDigits}`;
            } else {
                if (phoneDigits.length < 7 || phoneDigits.length > 18) {
                    toast.error(
                        "International phone numbers must be between 7 and 18 digits.",
                    );
                    document.getElementById("phoneNumber")?.focus();
                    return;
                }
                finalFullPhoneNumber = `${phoneDigits}`;
            }
        }

        try {
            setIsSubmitting(true);
            const uploadedImageUrl = await uploadImage();
            const nextImage = uploadedImageUrl ?? user.image;

            const values: UserUpdateData = {
                name,
                username,
                email,
                hideEmail,
                phoneNum: finalFullPhoneNumber || "",
                description: description || "",
                image: nextImage || "",
                instagram: instagram || "",
                discord: discord || "",
                linkedIn: linkedIn || "",
            };

            const result = await updateUser(user._id.toString(), values);

            if (result.error) {
                toast.error(result.error);
                return;
            }

            const updatedUser = { ...user, ...values };
            console.log(updatedUser);
            setUser(updatedUser);

            toast.success("Profile updated successfully");

            await update({
                name: values.name,
                image: nextImage,
                username: values.username,
                email: values.email,
                hideEmail: values.hideEmail,
                phoneNum: values.phoneNum,
                description: values.description,
            });
        } catch (err) {
            toast.error("An unexpected error occurred.");
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="space-y-8">
            <section>
                <h2 className="mb-4 text-lg font-semibold">
                    Profile Information
                </h2>

                <form onSubmit={handleSubmit} className="form" noValidate>
                    {/* Avatar Upload block */}
                    <div className="mb-6 flex flex-col md:flex-row items-center gap-6">
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
                            className="max-w-full"
                        />
                    </div>

                    {/* Form Fields Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Full Name"
                            name="full-name"
                            placeholder="George P. Burdell"
                            value={name}
                            required
                            onInputChange={(e) => setName(e.target.value)}
                        />

                        <FormInput
                            label="Username"
                            name="username"
                            placeholder="@gburdell3"
                            value={username}
                            required
                            onInputChange={(e) => setUsername(e.target.value)}
                        />

                        <FormInput
                            label="Email"
                            type="email"
                            name="email"
                            placeholder="gburdell3@gatech.edu"
                            value={email}
                            required
                            onInputChange={(e) => setEmail(e.target.value)}
                            className="md:col-span-2"
                        />
                        <div className="flex items-center gap-2 mb-3">
                            <input
                                type="checkbox"
                                id="hideEmail"
                                checked={hideEmail}
                                onChange={(e) =>
                                    setHideEmail(
                                        e.target.checked,
                                    )
                                }
                            />
                            <label htmlFor="hideEmail" className="text-sm">
                                Hide email from public profile
                            </label>
                        </div>
                    </div>

                    {/* Bio Field */}
                    <FormInput
                        isTextarea
                        name="bio"
                        label="Bio"
                        rows={5}
                        placeholder="Tell people about yourself..."
                        value={description}
                        onInputChange={(e) => setDescription(e.target.value)}
                    />

                    
                <h2 className="text-lg font-semibold pt-2">
                    Contact Information
                </h2>

                    {/* Social Handles Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2">

                        {/* Instagram */}
                        <div className="flex flex-col gap-1">
                            <label htmlFor="instagram">Instagram</label>
                            <div className="flex rounded-lg">
                                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-400 select-none text-xs sm:text-sm">
                                    instagram.com/
                                </span>
                                <input
                                    type="text"
                                    id="instagram"
                                    name="instagram"
                                    value={instagram}
                                    onChange={(e) =>
                                        handleUsernameChange(e, "instagram")
                                    }
                                    onPaste={handleInstagramPaste}
                                    placeholder="username"
                                    className="w-full rounded-l-none!"
                                />
                            </div>
                        </div>

                        {/* Discord */}
                        <div className="flex flex-col gap-1">
                            <label htmlFor="discord">Discord</label>
                            <input
                                type="text"
                                id="discord"
                                name="discord"
                                value={discord}
                                onChange={(e) =>
                                    handleUsernameChange(e, "discord")
                                }
                                placeholder="username"
                                className="w-full"
                            />
                        </div>

                        {/* LinkedIn */}
                        <div className="flex flex-col gap-1">
                            <label htmlFor="linkedIn">LinkedIn</label>
                            <div className="flex rounded-lg">
                                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-400 select-none text-xs sm:text-sm">
                                    linkedIn.com/in/
                                </span>
                                <input
                                    type="text"
                                    id="linkedIn"
                                    name="linkedIn"
                                    value={linkedIn}
                                    onChange={(e) =>
                                        handleUsernameChange(e, "linkedIn")
                                    }
                                    onPaste={handleLinkedInPaste}
                                    placeholder="username"
                                    className="w-full rounded-l-none!"
                                />
                            </div>
                        </div>

                        {/* Enhanced Country + Phone Layout mapped out cleanly to maintain aesthetics */}
                        <div className="flex flex-col gap-1">
                            <label htmlFor="phoneNumber">Phone Number</label>
                            <div className="flex rounded-lg">
                                <select
                                    id="countryCodeDropdown"
                                    name="countryCodeDropdown"
                                    required
                                    value={isUSNumber ? "+1" : "custom"}
                                    onChange={handleCountryCodeDropdownChange}
                                    className="bg-gray-50 rounded-r-none! border-r-0!"
                                >
                                    <option value="+1">🇺🇸 +1</option>
                                    <option value="custom">Other</option>
                                </select>

                                <input
                                    type="tel"
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    value={phoneNumber}
                                    onChange={handlePhoneChange}
                                    placeholder={
                                        isUSNumber
                                            ? "(555) 555-5555"
                                            : "+442071234567"
                                    }
                                    className="w-full rounded-l-none!"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Trigger Block */}
                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving Changes..." : "Save Changes"}
                    </button>
                </form>
            </section>
        </div>
    );
}
