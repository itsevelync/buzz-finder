"use client";

import LocationSelectMap from "@/components/maps/LocationSelectMap";
import ImageUploader from "@/components/report-item/ImageUploader";
import FormInput from "@/components/ui/FormInput";
import { categories } from "@/constants/Categories";
import { PlainItem } from "@/model/Item";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LuBox, LuContact, LuFileImage, LuMapPin } from "react-icons/lu";
import Link from "next/link";
import { FaChevronLeft } from "react-icons/fa";
import { useUser } from "@/context/UserContext";
import { toast } from "react-toastify";

interface FoundItemFormProps {
    item?: PlainItem;
}

export default function FoundItemForm({ item }: FoundItemFormProps) {
    const router = useRouter();
    const { user } = useUser();
    const userId = user?._id;

    const gtCampus = { lat: 33.778, lng: -84.398 };
    const [file, setFile] = useState<File | null>(null);
    const [category, setCategory] = useState<keyof typeof categories | "">(
        item?.category ?? "",
    );
    const [currPositionFetched, setCurrPositionFetched] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<{
        lat: number;
        lng: number;
    }>(item?.locationPin ?? gtCampus);
    const [currentPosition, setCurrentPosition] = useState<{
        lat: number;
        lng: number;
    }>(gtCampus);
    const [useAccountInfo, setUseAccountInfo] = useState(
        item ? !!item.personFound : !!userId,
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!item && !currPositionFetched && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setSelectedLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                    setCurrentPosition({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                    setCurrPositionFetched(true);
                },
                (error) => {
                    console.error("Error getting current location:", error);
                    setCurrPositionFetched(true);
                },
            );
        } else {
            setCurrPositionFetched(true);
        }
    }, [item, currPositionFetched]);

    const categoryOptions = Object.entries(categories).map(([key, value]) => ({
        value: key,
        label: value.label,
    }));

    async function uploadImage() {
        if (!file) return;

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

            const data = await res.json();
            const image = {
                id: data["public_id"],
                url: data["secure_url"],
            };

            return image;
        } catch (error) {
            console.log(error);
        }
    }

    async function handleFormSubmit(e: React.SubmitEvent) {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        console.log("Submitting form");
        const uploadedImage = file ? await uploadImage() : item?.image;
        console.log("Uploaded image:", uploadedImage);

        const form = e.target as HTMLFormElement;
        const body: Partial<PlainItem> = {
            name: (form.elements.namedItem("name") as HTMLInputElement).value,
            description: (
                form.elements.namedItem("description") as HTMLInputElement
            ).value,
            retrievalDescription: (
                form.elements.namedItem(
                    "retrievalDescription",
                ) as HTMLInputElement
            ).value,
            category: (form.elements.namedItem("category") as HTMLInputElement)
                .value
                ? ((form.elements.namedItem("category") as HTMLInputElement)
                      .value as keyof typeof categories)
                : "misc",
            locationPin: {
                lat: selectedLocation.lat,
                lng: selectedLocation.lng,
            },
            locationDescription: (
                form.elements.namedItem(
                    "locationDescription",
                ) as HTMLInputElement
            ).value,
        };
        if (uploadedImage) {
            body.image = uploadedImage;
        }

        if (useAccountInfo && userId) {
            body["personFound"] = userId;
        } else {
            body["contactInfo"] = {
                name: (
                    form.elements.namedItem("contactName") as HTMLInputElement
                ).value,
                details: (
                    form.elements.namedItem(
                        "contactDetails",
                    ) as HTMLInputElement
                ).value,
            };
        }

        try {
            const res = await fetch(
                item ? `/api/item/${item._id}` : "/api/item",
                {
                    method: item ? "PATCH" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(body),
                },
            );

            if (res.ok) {
                if (item) {
                    toast.success("Item updated successfully");
                    router.push("/item/" + item._id);
                } else {
                    toast.success("Item logged successfully");
                    router.push("/dashboard");
                }
            } else {
                toast.error(item ? "Error updating item" : "Error logging item");
            }
        } catch (err) {
            console.error(err);
            toast.error(item ? "Error updating item" : "Error logging item");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-6 sm:px-8 sm:py-10 flex flex-col gap-8">
            {item && (
                <Link
                    href={`/item/${item._id}`}
                    className="flex items-center gap-1 text-buzz-gold hover:brightness-90 transition-all"
                >
                    <FaChevronLeft /> Back to Item Page
                </Link>
            )}
            {/* Header */}
            <div className="border-b border-gray-100 pb-6 pt-1 px-2">
                <h1 className="text-4xl font-bold text-buzz-blue">
                    {item
                        ? `Edit ${item?.name || "Found Item"}`
                        : "Report Found Item"}
                </h1>
                <p className="text-gray-500 mt-2">
                    {item
                        ? "Update the information for this found item."
                        : "Submit information about a lost item you found."}{" "}
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* LEFT COLUMN */}
                <div className="w-full md:w-5/12 flex flex-col gap-6">
                    {/* Image Upload */}
                    <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col gap-2">
                        <div className="flex items-center gap-2 font-semibold mb-1 text-lg">
                            <LuFileImage className="text-buzz-gold" />
                            <span>Item Image</span>
                        </div>

                        <ImageUploader
                            file={file}
                            setFile={setFile}
                            initialImage={item?.image?.url || ""}
                            fullWidth
                            title={false}
                        />
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="w-full md:w-7/12 flex flex-col gap-6">
                    {/* Map */}
                    <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col gap-3">
                        <div className="flex items-center gap-2 font-semibold mb-1 text-lg">
                            <LuMapPin className="text-buzz-gold" />
                            <span>Item Location *</span>
                        </div>

                        <div className="h-72 w-full rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center bg-gray-50">
                            {item || currPositionFetched ? (
                                <LocationSelectMap
                                    height="100%"
                                    width="100%"
                                    selectedLocation={selectedLocation}
                                    setSelectedLocation={setSelectedLocation}
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
                    </div>
                    <form
                        className="form bg-white border border-gray-200 rounded-lg p-5 flex flex-col gap-5"
                        onSubmit={handleFormSubmit}
                    >
                        {/* Item Details */}
                        <div className="flex items-center gap-2 font-semibold mb-1 text-lg">
                            <LuBox className="text-buzz-gold" />
                            <span>Item Details</span>
                        </div>

                        <FormInput
                            label="Item Name"
                            name="name"
                            placeholder="Red Wallet, Silver Keychain, Beige Scarf, etc."
                            required
                            defaultValue={item?.name}
                        />

                        <FormInput
                            label="Item Description"
                            name="description"
                            placeholder='Color, size, brand, and any unique features (e.g., "Red leather wallet with a small scratch").'
                            rows={4}
                            isTextarea
                            defaultValue={item?.description || ""}
                        />

                        <FormInput
                            label="Category"
                            name="category"
                            placeholder="Select an Item Category"
                            isSelect
                            selectOptions={categoryOptions}
                            value={category}
                            onInputChange={(e) =>
                                setCategory(
                                    e.target.value as keyof typeof categories,
                                )
                            }
                        />

                        {/* Location / Retrieval */}
                        <div className="flex items-center gap-2 font-semibold pt-3 mb-1 text-lg">
                            <LuMapPin className="text-buzz-gold" />
                            <span>Location & Retrieval Details</span>
                        </div>

                        <FormInput
                            label="Location Details"
                            name="locationDescription"
                            placeholder="Near the library entrance, student center, third floor, etc."
                            isTextarea
                            defaultValue={item?.locationDescription || ""}
                        />

                        <FormInput
                            label="Item Retrieval"
                            name="retrievalDescription"
                            placeholder='e.g., "Left at the circulation desk" or "Contact me to arrange pickup."'
                            isTextarea
                            defaultValue={item?.retrievalDescription || ""}
                        />

                        {/* Contact Info */}
                        <div className="flex items-center gap-2 font-semibold pt-3 text-lg">
                            <LuContact className="text-buzz-gold" />
                            <span>Contact Information</span>
                        </div>

                        <div>
                            <p className="italic text-sm mb-3 opacity-60">
                                {userId ? "Your account" : "This"} information
                                will be visible on the item page so the owner
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
                                            defaultValue={
                                                item?.contactInfo?.name || ""
                                            }
                                        />

                                        <FormInput
                                            label="Contact Information"
                                            name="contactDetails"
                                            placeholder="Phone number, email, Instagram, etc."
                                            className="grow"
                                            defaultValue={
                                                item?.contactInfo?.details || ""
                                            }
                                        />
                                    </div>

                                    <p className="italic opacity-60 text-sm mt-1">
                                        Leave these fields empty to post
                                        anonymously.
                                    </p>
                                </>
                            )}
                        </div>

                        <button type="submit" disabled={isSubmitting}>
                            {isSubmitting
                                ? item
                                    ? "Updating..."
                                    : "Submitting Found Item..."
                                : item
                                  ? `Update ${item?.name || "Item"}`
                                  : "Submit Found Item"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
