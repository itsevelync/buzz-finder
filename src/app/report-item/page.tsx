'use client'

import LocationSelectMap from '@/components/maps/LocationSelectMap';
import ImageUploader from '@/components/report-item/ImageUploader';
import FormInput from '@/components/ui/FormInput';
import { useState } from 'react';

export default function ReportItem() {

    const [file, setFile] = useState<File | null>(null);
    const gtCampus = { lat: 33.7780, lng: -84.3980 };

    const [selectedLocation, setSelectedLocation] = useState<{ lat: number, lng: number }>(gtCampus)

    const uploadImage = async () => {
        if(!file) return;

        const formdata = new FormData();

        formdata.append('file', file);
        formdata.append("upload_preset", process.env.NEXT_PUBLIC_UPLOAD_PRESET as string);

        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUD_NAME}/image/upload`, {
                method: "POST",
                body: formdata
            });

            const data = await res.json();
            const image = {
                id: data["public_id"],
                url: data['secure_url']
            }

            return image;
        } catch(error) {
            console.log(error)
        }
    }

    async function handleFormSubmit(e: React.FormEvent) {
        e.preventDefault();
        console.log("Submitting form");
        const uploadedImage = (await uploadImage());

        const form = e.target as HTMLFormElement;
        const body = {
            title: (form.elements.namedItem('title') as HTMLInputElement).value,
            status: false,
            item_description: (form.elements.namedItem('item_description') as HTMLInputElement).value,
            retrieval_description: (form.elements.namedItem('retrieval_description') as HTMLInputElement).value,
            contact_info: (form.elements.namedItem("name") as HTMLInputElement).value + " " + (form.elements.namedItem('contact_info') as HTMLInputElement).value,
            category: (form.elements.namedItem('category') as HTMLInputElement).value,
            image: uploadedImage,
            position: {
                lat: selectedLocation.lat,
                lng: selectedLocation.lng
            }
        }

        console.log(body);
        fetch('/api/item', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        }).then(res => {
            if (res.ok) {
                alert('Item logged successfully');
                form.reset();
                setSelectedLocation(gtCampus);
                setFile(null);

            } else {
                alert('Error logging item');
            }
        }).catch(err => {
            console.error(err);
            alert('Error logging item');
        });
    }

    return (
        <div className="flex flex-col md:flex-row gap-10 p-10">
            <ImageUploader file={file} setFile={setFile} />

            <form className="form w-full md:w-1/2" onSubmit={handleFormSubmit}>
                <LocationSelectMap
                    height={400} width={400}
                    selectedLocation={selectedLocation}
                    setSelectedLocation={setSelectedLocation}
                />

                <FormInput label="Item Name" name="title" placeholder="Name of item" required />
                <FormInput label="Item Description" name="item_description"
                           placeholder="Write an item description here" isTextarea />
                <div className="flex flex-col md:flex-row gap-3 w-full">
                    <FormInput label="Name" name="name" placeholder="Your name" className="grow" />
                    <FormInput label="Contact Information" name="contact_info"
                               placeholder="Phone number, email, Instagram, etc." className="grow" />
                </div>
                <FormInput label="Item Retrieval" name="retrieval_description"
                           placeholder="How do you want this item to be retrieved?" isTextarea />
                <FormInput label="Category" name="category" defaultValue="other" isSelect
                    selectOptions={[
                        { value: "electronics", label: "Electronics", },
                        { value: "clothing", label: "Clothing", },
                        { value: "books", label: "Books", },
                        { value: "buzzcard", label: "Buzzcard", },
                        { value: "other", label: "Other", },
                    ]}
                />
                <button type="submit">Upload Lost Item</button>
            </form>
        </div>
    )
}

