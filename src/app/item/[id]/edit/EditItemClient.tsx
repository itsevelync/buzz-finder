"use client";

import LocationSelectMap from "@/components/maps/LocationSelectMap";
import ImageUploader from "@/components/report-item/ImageUploader";
import FormInput from "@/components/ui/FormInput";
import { categories } from "@/constants/Categories";
import type { Item } from "@/model/Item";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaChevronLeft } from "react-icons/fa";

type ItemWithPersonFoundAsString = Omit<Item, "personFound"> & {
    personFound: string;
};

export default function EditItemClient({
    userId,
    itemId,
    item,
}: {
    userId: string | undefined;
    itemId: string | undefined;
    item: Item | null;
}) {
    const gtCampus = { lat: 33.778, lng: -84.398 };
    const [file, setFile] = useState<File | null>(null);
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [currPositionFetched, setCurrPositionFetched] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<{
        lat: number;
        lng: number;
    }>(gtCampus);
    const [useAccountInfo, setUseAccountInfo] = useState(userId ? true : false);

    const [name, setName] = useState("");
    const [itemDescription, setItemDescription] = useState("");
    const [locationDetails, setLocationDetails] = useState("");
    const [retrievalDescription, setRetrievalDescription] = useState("");
    const [category, setCategory] = useState("misc");

    const router = useRouter();

    useEffect(() => {
        if (item) {
            setCurrPositionFetched(true);
            setSelectedLocation(item.locationPin);

            setName(item.name || "");
            setItemDescription(item.description || "");
            setLocationDetails(item.locationDescription || "")
            setRetrievalDescription(item.retrievalDescription || "");
            setCategory(item.category || "misc");
            if (item.image?.url) {
                urlToFile(item.image.url).then((f) => {
                    setFile(f);
                    setOriginalFile(f);
                });
            }
        }
    }, [item]);

    async function urlToFile(url: string): Promise<File> {
        const res = await fetch(url);
        const blob = await res.blob();
        const filename = "image." + url.split(".").pop();
        const file = new File([blob], filename, { type: blob.type });
        return file;
    }

    const categoryOptions = Object.entries(categories).map(([key, value]) => ({
        value: key,
        label: value.label,
    }));

    async function uploadImage() {
        if (!file) return null;

        if (file === originalFile) {
            return item?.image;
        }

        const formdata = new FormData();

        formdata.append("file", file);
        formdata.append(
            "upload_preset",
            process.env.NEXT_PUBLIC_UPLOAD_PRESET as string
        );

        try {
            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUD_NAME}/image/upload`,
                {
                    method: "POST",
                    body: formdata,
                }
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

    async function handleFormSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!itemId) {
            alert("Error: Item ID is missing.");
            return;
        }
        console.log("Submitting form");
        const uploadedImage = await uploadImage();
        const form = e.target as HTMLFormElement;
        const body: Partial<ItemWithPersonFoundAsString> = {
            name: (form.elements.namedItem("name") as HTMLInputElement).value,
            description: (
                form.elements.namedItem("description") as HTMLInputElement
            ).value,
            retrievalDescription: (
                form.elements.namedItem(
                    "retrievalDescription"
                ) as HTMLInputElement
            ).value,
            locationDescription: (
                form.elements.namedItem(
                    "locationDescription"
                ) as HTMLInputElement
            ).value,
            category: (form.elements.namedItem("category") as HTMLInputElement)
                .value as keyof typeof categories,
            image: uploadedImage,
            locationPin: {
                lat: selectedLocation.lat,
                lng: selectedLocation.lng,
            },
        };

        if (uploadedImage) {
            body.image = uploadedImage;
        }

        if (useAccountInfo && userId) {
            body["personFound"] = userId;
        } else {
            body["contactInfo"] = {
                name: (form.elements.namedItem("contactName") as HTMLInputElement).value,
                details: (form.elements.namedItem("contactDetails") as HTMLInputElement)
                    .value,
            }
        }

        console.log(body);
        fetch(`/api/item/${itemId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        })
            .then((res) => {
                if (res.ok) {
                    alert("Item updated successfully");
                    form.reset();
                    setFile(null);
                    router.push("/item/" + itemId);
                } else {
                    alert("Error updating item");
                }
            })
            .catch((err) => {
                console.error(err);
                alert("Error updating item");
            });
    }

    return (
        <div className="p-10 flex flex-col gap-6">
            <Link
                href={`/item/${itemId}`}
                className="flex items-center gap-1 text-buzz-gold hover:brightness-90 transition-all"
            >
                <FaChevronLeft /> Back to Item Page
            </Link>
            <h1 className="text-4xl font-bold text-buzz-blue">
                Edit {item?.name || "Item"}
            </h1>
            <div className="flex flex-col lg:flex-row gap-x-10 gap-y-4">
                <ImageUploader file={file} setFile={setFile} />

                <form
                    className="form w-full md:w-1/2"
                    onSubmit={handleFormSubmit}
                >
                    <div className="w-full">
                        <h3 className="mb-2">Item Location *</h3>
                        <div className="h-100 rounded-lg overflow-hidden border-buzz-blue/20 border flex items-center justify-center shadow-md">
                            {currPositionFetched ? (
                                <LocationSelectMap
                                    height="100%"
                                    width="100%"
                                    selectedLocation={selectedLocation}
                                    setSelectedLocation={setSelectedLocation}
                                    currentPosition={gtCampus}
                                />
                            ) : (
                                <p className="p-3 text-3xl text-gray-500">
                                    Loading map...
                                </p>
                            )}
                        </div>
                        <p className="text-center italic mt-2 opacity-55">
                            Move map to adjust pin location
                        </p>
                    </div>
                    <FormInput
                        label="Item Name"
                        name="name"
                        placeholder="Name of item"
                        value={name}
                        onInputChange={(e) => setName(e.target.value)}
                        required
                    />
                    <FormInput
                        label="Item Description"
                        name="description"
                        placeholder="Write an item description here"
                        value={itemDescription}
                        onInputChange={(e) =>
                            setItemDescription(e.target.value)
                        }
                        rows={3}
                        isTextarea
                    />
                    <FormInput
                        label="Location Details"
                        name="locationDescription"
                        placeholder="Specify location (e.g., near the library entrance, third floor, etc.)"
                        value={locationDetails}
                        onInputChange={(e) =>
                            setLocationDetails(e.target.value)
                        }
                        isTextarea
                    />
                    <FormInput
                        label="Item Retrieval"
                        name="retrievalDescription"
                        placeholder="How do you want this item to be retrieved?"
                        value={retrievalDescription}
                        onInputChange={(e) =>
                            setRetrievalDescription(e.target.value)
                        }
                        isTextarea
                    />
                    <FormInput
                        label="Category"
                        name="category"
                        value={category}
                        onInputChange={(e) => setCategory(e.target.value)}
                        isSelect
                        selectOptions={categoryOptions}
                    />
                    <div className="bg-white shadow rounded p-6">
                        <h3 className="text-lg font-semibold">
                            Contact Information
                        </h3>

                        <p className="italic text-sm mb-3 opacity-60">
                            {userId ? "Your account" : "This"} information will
                            be visible on the item page so the item owner can
                            contact you if needed.
                        </p>
                        {userId && (
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="useAccountInfo"
                                    checked={!useAccountInfo}
                                    onChange={(e) => {
                                        setUseAccountInfo(
                                            !e.target.checked as boolean
                                        );
                                    }}
                                />
                                <label
                                    htmlFor="useAccountInfo"
                                    className="text-sm"
                                >
                                    Don&rsquo;t connect my account information
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
                    <button type="submit">
                        Update {item?.name || "Item"}
                    </button>
                </form>
            </div>
        </div>
    );
}
