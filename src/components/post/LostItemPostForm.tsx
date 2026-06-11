"use client";

import React, { useState, useEffect } from "react";
import FormInput from "@/components/ui/FormInput";
import LocationSelectMap from "@/components/maps/LocationSelectMap";
import ImageUploader from "@/components/report-item/ImageUploader";
import { categories } from "@/constants/Categories";
import { Session } from "next-auth";
import { useRouter } from "next/navigation";
import {
    LuBox,
    LuCalendar,
    LuContact,
    LuFileImage,
    LuMapPin,
} from "react-icons/lu";

interface LostItemPostFormProps {
    session: Session | null;
}

export default function LostItemPostForm({ session }: LostItemPostFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const userId = session?.user?._id;
    const [useAccountInfo, setUseAccountInfo] = useState(userId ? true : false);

    // Map State
    const [showMap, setShowMap] = useState(true);
    const gtCampus = { lat: 33.778, lng: -84.398 };
    const [currPositionFetched, setCurrPositionFetched] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<{
        lat: number;
        lng: number;
    }>(gtCampus);
    const [currentPosition, setCurrentPosition] = useState<{
        lat: number;
        lng: number;
    }>(gtCampus);

    // Media State
    const [file, setFile] = useState<File | null>(null);
    const [category, setCategory] = useState<keyof typeof categories | "">("");

    // Detect and handle client-side user positioning initialization
    useEffect(() => {
        if (!currPositionFetched && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const coords = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setSelectedLocation(coords);
                    setCurrentPosition(coords);
                    setCurrPositionFetched(true);
                },
                (error) => {
                    console.error(
                        "Error securing real-time browser location coordinates:",
                        error,
                    );
                    setCurrPositionFetched(true);
                },
            );
        }
    }, [currPositionFetched]);

    const categoryOptions = Object.entries(categories).map(([key, value]) => ({
        value: key,
        label: value.label,
    }));

    function getInputValue(form: HTMLFormElement, name: string) {
        return (form.elements.namedItem(name) as HTMLInputElement)?.value || "";
    }

    // Handles Cloudinary direct integration uploads
    async function uploadImage() {
        if (!file) return null;

        const formdata = new FormData();
        formdata.append("file", file);
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

            if (!res.ok) throw new Error("Image upload response failure");

            const data = await res.json();
            return {
                id: data["public_id"],
                url: data["secure_url"],
            };
        } catch (error) {
            console.error("Cloudinary media engine crash:", error);
            return null;
        }
    }

    async function handleFormSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        const form = e.target as HTMLFormElement;

        try {
            // 1. Asynchronously execute the media upload process ahead of document submission
            const uploadedImage = await uploadImage();

            const body: Record<string, unknown> = {};
            const fields = [
                "name",
                "description",
                "category",
                "locationDescription",
                "lostDate",
            ];

            for (const field of fields) {
                const value = getInputValue(form, field);
                if (value !== "") {
                    body[field] = value;
                }
            }

            // 2. Append positional coordinate models
            if (showMap) {
                body.locationPin = {
                    lat: selectedLocation.lat,
                    lng: selectedLocation.lng,
                };
            }

            // 3. Bind successfully resolved media payloads
            if (uploadedImage) {
                body.image = uploadedImage;
            }

            // 4. Session trace validation setups
            if (useAccountInfo && userId) {
                body.user = userId;
            } else {
                body.contactInfo = {
                    name: getInputValue(form, "contactName"),
                    details: getInputValue(form, "contactDetails"),
                };
            }

            const res = await fetch("/api/lost-item-post", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                alert("Successfully reported lost item!");
                form.reset();
                setFile(null);
                router.push("/dashboard?tab=lost");
                router.refresh();
            } else {
                const errData = await res.json();
                alert(
                    `Error reporting lost item: ${errData.error || "Server issue"}`,
                );
            }
        } catch (err) {
            console.error("Submission network crash:", err);
            alert("Network error reporting lost item. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-6 sm:px-8 sm:py-10 flex flex-col gap-8">
            {/* Header Content Block */}
            <div className="border-b border-gray-100 pb-6 pt-1 px-2">
                <h1 className="text-4xl font-bold text-buzz-blue">
                    Report Lost Item
                </h1>
                <p className="text-gray-500 mt-2">
                    Fill out the following details about an item you&rsquo;ve lost.
                </p>
            </div>

            {/* Split layout: Media & Map Component Block on Left, Main Input Form Fields on Right */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Media Uploader & Map Segment */}
                <div className="w-full md:w-5/12 flex flex-col gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col gap-2">
                        <div className="flex items-center gap-2 font-semibold mb-1 text-lg">
                            <LuFileImage className="text-buzz-gold" />
                            <span>Item Photo Reference</span>
                        </div>
                        <ImageUploader
                            file={file}
                            setFile={setFile}
                            fullWidth
                            title={false}
                        />
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col gap-3">
                        <div className="flex items-center gap-2 font-semibold mb-1 text-lg">
                            <LuMapPin className="text-buzz-gold" />
                            <span>Specify Pin Point Location *</span>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                            <input
                                type="checkbox"
                                id="hideMap"
                                checked={!showMap}
                                onChange={(e) => setShowMap(!e.target.checked)}
                            />
                            <label
                                htmlFor="hideMap"
                                className="text-sm text-gray-600"
                            >
                                Check this box to skip adding a map location.
                            </label>
                        </div>
                        {showMap && (
                            <>
                                <div className="h-72 w-full rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center bg-gray-50">
                                    {currPositionFetched ? (
                                        <LocationSelectMap
                                            height="100%"
                                            width="100%"
                                            selectedLocation={selectedLocation}
                                            setSelectedLocation={
                                                setSelectedLocation
                                            }
                                            currentPosition={currentPosition}
                                            category={category}
                                        />
                                    ) : (
                                        <p className="text-sm text-gray-400 animate-pulse">
                                            Loading map...
                                        </p>
                                    )}
                                </div>
                                <p className="text-center italic text-xs text-gray-400">
                                    Drag or pan the map to adjust pin location
                                </p>
                            </>
                        )}
                    </div>
                </div>

                {/* Main Entry Input Form Section */}
                <div className="w-full md:w-7/12">
                    <form
                        className="form bg-white border border-gray-200 rounded-lg p-5 flex flex-col gap-5"
                        onSubmit={handleFormSubmit}
                    >
                        <div className="flex items-center gap-2 font-semibold mb-1 text-lg">
                            <LuBox className="text-buzz-gold" />
                            <span>Item Details</span>
                        </div>

                        <FormInput
                            label="Item Name"
                            name="name"
                            placeholder="e.g., Silver iPhone 15 Pro with clear case"
                            required
                        />

                        <FormInput
                            label="Detailed Description"
                            name="description"
                            placeholder="Include unique identifiers like serial stickers, dents, keychains, lock screens, or specific contents inside."
                            rows={4}
                            isTextarea
                            required
                        />

                        <FormInput
                            label="Category"
                            name="category"
                            defaultValue="misc"
                            isSelect
                            required
                            selectOptions={categoryOptions}
                            onInputChange={(e) =>
                                setCategory(
                                    e.target.value as keyof typeof categories,
                                )
                            }
                        />

                        <div className="flex items-center gap-2 font-semibold pt-3 mb-1 text-lg">
                            <LuCalendar className="text-buzz-gold" />
                            <span>Last Known Location & Time</span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <FormInput
                                label="Last Seen Location"
                                name="locationDescription"
                                placeholder="e.g., Library 3rd Floor"
                                required
                            />

                            <FormInput
                                label="Approximate Date Lost"
                                name="lostDate"
                                type="date"
                                required
                            />
                        </div>

                        <div className="flex items-center gap-2 font-semibold pt-3 text-lg">
                            <LuContact className="text-buzz-gold" />
                            <span>Contact Information</span>
                        </div>

                        <div className="p-1">
                            <p className="italic text-sm mb-3 opacity-60">
                                {userId ? "Your account" : "This"} information
                                will be visible on the item page so that others
                                can contact you if needed.
                            </p>
                            {userId && (
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="useAccountInfo"
                                        checked={!useAccountInfo}
                                        onChange={(e) => {
                                            setUseAccountInfo(
                                                !e.target.checked as boolean,
                                            );
                                        }}
                                    />
                                    <label
                                        htmlFor="useAccountInfo"
                                        className="text-sm"
                                    >
                                        Don&rsquo;t connect my account
                                        information
                                    </label>
                                </div>
                            )}

                            {!useAccountInfo && (
                                <>
                                    <div className="flex flex-col md:flex-row gap-3 mt-4 w-full">
                                        <FormInput
                                            label="Name"
                                            name="contactName"
                                            placeholder="Your name"
                                            className="grow"
                                        />
                                        <FormInput
                                            label="Contact Information"
                                            name="contactDetails"
                                            placeholder="Phone number, email, Instagram, etc."
                                            className="grow"
                                        />
                                    </div>

                                    <p className="italic opacity-60 text-sm mt-1">
                                        Leave these fields empty to post
                                        anonymously.
                                    </p>
                                </>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? "Uploading Report Content..."
                                : "Report Lost Item"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
