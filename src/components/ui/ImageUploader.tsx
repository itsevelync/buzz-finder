'use client'
import React, { useRef, useState } from 'react'

/**
 * 
 * @returns Componenet to upload and automatically resize images
 */
const ImageUploader = ( {file,setFile}:{file:File|null,setFile:React.Dispatch<React.SetStateAction<File | null>>}) => {
    const inputRef = useRef<HTMLInputElement>(null);

    //Using the browswer canvas to resize the image before upload
    async function setFileAndResize(file: File | null) {
        if (!file) return;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const img = new Image();
            img.src = reader.result as string;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const maxWidth = 500; // set max width/height
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
                    const resizedFile = new File([blob], file.name, { type: file.type });
                    setFile(resizedFile);
                }, file.type);
            }
        }
    }
    
    return (
        <div className=" ">
            <div className="flex flex-col items-center justify-between"onDrop={(e) => {
                e.preventDefault();
                console.log(e.dataTransfer.files);
                if (e.dataTransfer.files[0] && e.dataTransfer.files[0].type.startsWith('image/')) {
                    setFileAndResize(e.dataTransfer.files[0]);
                }
            }} onDragOver={
                (e) => {
                    e.preventDefault();
                }
            }
                onDragLeave={(e) => {
                    e.preventDefault();
                }}>
            <div className='preview w-[500px] h-[500px] border-green-500 p-5 rounded-lg border-2 flex items-center justify-center overflow-hidden'>
                {file && <img className="max-w-full max-h-full object-contain"src={URL.createObjectURL(file)} alt="preview" height={500} width={500} />}
            </div>
            <input className="hidden" ref={inputRef} type="file" id="file_input" accept="image/*" onChange={(e) => { setFileAndResize(e.target.files?.[0] ?? null) }}></input>
            
                <button className="box-border py-3" onClick={() => inputRef.current?.click()}><span className="bg-blue-500 text-center px-2 py-0.5 box-border text-white rounded-2xl w-full  m-2">Select File:    </span> {file ? file.name : "None Selected"}</button>

            </div>
            {/* <button className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800" onClick={saveImage}>Upload Image</button> */}


        </div>
    )
}

export default ImageUploader
