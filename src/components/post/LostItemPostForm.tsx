"use client";

import FormInput from "@/components/ui/FormInput";
import { categories } from "@/constants/Categories";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LostItemPostForm() {
    const router = useRouter();
    const { data: session } = useSession();
    const categoryOptions = Object.entries(categories).map(([key, value]) => ({
        value: key,
        label: value.label,
    }));

    function getInputValue(form: HTMLFormElement, name: string) {
        return (form.elements.namedItem(name) as HTMLInputElement)?.value || "";
    }

    async function handleFormSubmit(e: React.FormEvent) {
        e.preventDefault();

        const form = e.target as HTMLFormElement;
        const body: Record<string, unknown> = {};
        const fields = [
            "title",
            "description",
            "lastLocation",
            "category",
            "contactInfo",
        ];

        for (const field of fields) {
            const value = getInputValue(form, field);
            if (value) {
                body[field] = value;
            }
        }

        if (session?.user?._id) {
            body.user = session.user._id;
        }

        fetch("/api/lost-item-post", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        })
            .then((res) => {
                if (res.ok) {
                    alert("Successfully reported lost item");
                    form.reset();
                    router.push("/dashboard?tab=lost");
                } else {
                    alert("Error reporting lost item");
                }
            })
            .catch((err) => {
                console.error(err);
                alert("Error reporting lost item");
            });
    }

    return (
        <div className="p-10 flex flex-col gap-6">
            <h1 className="text-4xl font-bold text-buzz-blue">
                Report Lost Item
            </h1>
            <div className="flex flex-col lg:flex-row gap-10">
                <form
                    className="form w-full md:w-1/2"
                    onSubmit={handleFormSubmit}
                >
                    <FormInput
                        label="Item Name"
                        name="title"
                        placeholder="Name of lost item"
                        required
                    />
                    <FormInput
                        label="Item Description"
                        name="description"
                        placeholder="Describe the lost item"
                        isTextarea
                        required
                    />
                    <FormInput
                        label="Last Location"
                        name="lastLocation"
                        placeholder="Where you last remember seeing the item"
                    />
                    <FormInput
                        label="Contact Information"
                        name="contactInfo"
                        placeholder="Phone number, email, Instagram, etc."
                    />
                    <FormInput
                        label="Category"
                        name="category"
                        defaultValue="misc"
                        isSelect
                        selectOptions={categoryOptions}
                    />
                    <button type="submit">Report Lost Item</button>
                </form>
            </div>
        </div>
    );
}
