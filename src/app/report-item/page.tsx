"use client";

import LocationSelectMap from "@/components/maps/LocationSelectMap";
import ImageUploader from "@/components/report-item/ImageUploader";
import FormInput from "@/components/ui/FormInput";
import { categories } from "@/constants/Categories";
import { useEffect, useState } from "react";

export default function ReportItem() {
    const gtCampus = { lat: 33.778, lng: -84.398 };
    const [file, setFile] = useState<File | null>(null);
    const [currPositionFetched, setCurrPositionFetched] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<{
        lat: number;
        lng: number;
    }>(gtCampus);

    useEffect(() => {
        if (!currPositionFetched && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setSelectedLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                    setCurrPositionFetched(true); // mark as fetched
                },
                (error) => {
                    console.error("Error getting current location:", error);
                    setCurrPositionFetched(true); // still mark as fetched to avoid retry
                }
            );
        }
    }, [currPositionFetched]);

    const categoryOptions = Object.entries(categories).map(([key, value]) => ({
        value: key,
        label: value.label,
    }));

    const uploadImage = async () => {
        if (!file) return;

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
    };

    async function handleFormSubmit(e: React.FormEvent) {
        e.preventDefault();
        console.log("Submitting form");
        const uploadedImage = await uploadImage();

        const form = e.target as HTMLFormElement;
        const body = {
            title: (form.elements.namedItem("title") as HTMLInputElement).value,
            status: false,
            item_description: (
                form.elements.namedItem("item_description") as HTMLInputElement
            ).value,
            retrieval_description: (
                form.elements.namedItem(
                    "retrieval_description"
                ) as HTMLInputElement
            ).value,
            contact_info:
                (form.elements.namedItem("name") as HTMLInputElement).value +
                " " +
                (form.elements.namedItem("contact_info") as HTMLInputElement)
                    .value,
            category: (form.elements.namedItem("category") as HTMLInputElement)
                .value,
            image: uploadedImage,
            position: {
                lat: selectedLocation.lat,
                lng: selectedLocation.lng,
            },
        };

        console.log(body);
        fetch("/api/item", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        })
            .then((res) => {
                if (res.ok) {
                    alert("Item logged successfully");
                    form.reset();
                    setSelectedLocation(gtCampus);
                    setFile(null);
                } else {
                    alert("Error logging item");
                }
            })
            .catch((err) => {
                console.error(err);
                alert("Error logging item");
            });
    }

    return (
        <div className="p-10 flex flex-col gap-6">
            <h1 className="text-4xl font-bold text-buzz-blue">
                Report Found Item
            </h1>
            <div className="flex flex-col lg:flex-row gap-10">
                <ImageUploader file={file} setFile={setFile} />

                <form
                    className="form w-full md:w-1/2"
                    onSubmit={handleFormSubmit}
                >
                    <div className="w-full">
                        <h3 className="mb-2">Item Location *</h3>
                        <div className="h-100 rounded-lg overflow-hidden border-buzz-blue/20 border flex items-center justify-center">
                            {currPositionFetched ? (
                                <LocationSelectMap
                                    height="100%"
                                    width="100%"
                                    selectedLocation={selectedLocation}
                                    setSelectedLocation={setSelectedLocation}
                                />
                            ) : (
                                <p className="p-3 text-3xl text-gray-500">
                                    Loading map...
                                </p>
                            )}
                        </div>
                    </div>
                    <FormInput
                        label="Item Name"
                        name="title"
                        placeholder="Name of item"
                        required
                    />
                    <FormInput
                        label="Item Description"
                        name="item_description"
                        placeholder="Write an item description here"
                        isTextarea
                    />
                    <div className="flex flex-col md:flex-row gap-3 w-full">
                        <FormInput
                            label="Name"
                            name="name"
                            placeholder="Your name"
                            className="grow"
                        />
                        <FormInput
                            label="Contact Information"
                            name="contact_info"
                            placeholder="Phone number, email, Instagram, etc."
                            className="grow"
                        />
                    </div>
                    <FormInput
                        label="Item Retrieval"
                        name="retrieval_description"
                        placeholder="How do you want this item to be retrieved?"
                        isTextarea
                    />
                    <FormInput
                        label="Category"
                        name="category"
                        defaultValue="misc"
                        isSelect
                        selectOptions={categoryOptions}
                    />
                    <button type="submit">Submit Found Item</button>
                </form>
            </div>
        </div>
    );
}
