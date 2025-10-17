"use client";
import NextImage from "next/image";
import { useRef, useState } from "react";
import { FaImage, FaCloudUploadAlt } from "react-icons/fa";

const ImageUploader = ({
    file,
    setFile,
}: {
    file: File | null;
    setFile: React.Dispatch<React.SetStateAction<File | null>>;
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    async function setFileAndResize(file: File | null) {
        if (!file) return;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const img = new Image();
            img.src = reader.result as string;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const maxWidth = 500;
                const maxHeight = 500;
                let width = img.width;
                let height = img.height;

                // Maintain aspect ratio
                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    if (!blob) return;
                    const resizedFile = new File([blob], file.name, {
                        type: file.type,
                    });
                    setFile(resizedFile);
                }, file.type);
            };
        };
    }

    return (
        <div className="w-full lg:w-1/2 mx-auto flex flex-col items-center gap-2">
            <h3 className="w-full">Item Image *</h3>
            <div
                className={`p-3 relative w-full h-80 md:h-100 mb-2 border-2 rounded-lg flex flex-col items-center justify-center gap-3 overflow-hidden transition-all duration-200 cursor-pointer ${
                    isDragging
                        ? "border-buzz-gold bg-buzz-gold/20 text-buzz-gold"
                        : "border-dashed border-buzz-blue/30 hover:border-buzz-gold text-buzz-blue/45"
                }`}
                onClick={() => inputRef.current?.click()}
                onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (
                        e.dataTransfer.files[0] &&
                        e.dataTransfer.files[0].type.startsWith("image/")
                    ) {
                        setFileAndResize(e.dataTransfer.files[0]);
                    }
                }}
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                }}
            >
                {file ? (
                    <>
                        <NextImage
                            className="object-contain max-w-full max-h-full"
                            src={URL.createObjectURL(file)}
                            alt="Image Preview"
                            height={500}
                            width={500}
                        />
                    </>
                ) : (
                    <>
                        <FaImage className="text-7xl" />
                        <p className="font-medium text-center">
                            Drag & drop or click to upload
                        </p>
                    </>
                )}
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setFileAndResize(e.target.files?.[0] ?? null)}
            />

            <div className="flex flex-col items-center gap-2 w-full">
                <button
                    onClick={() => inputRef.current?.click()}
                    className="flex w-full justify-center items-center gap-2 px-4 py-2 bg-buzz-gold hover:brightness-90 text-white rounded-full transition-all"
                >
                    <FaCloudUploadAlt />{" "}
                    {file ? "Change Photo" : "Upload Photo"}
                </button>

                <p className="text-sm text-buzz-blue/80">
                    {file ? (
                        <>
                            <span className="font-semibold text-buzz-blue">
                                Selected:
                            </span>{" "}
                            {file.name}
                        </>
                    ) : (
                        "No file selected"
                    )}
                </p>
            </div>
        </div>
    );
};

export default ImageUploader;
