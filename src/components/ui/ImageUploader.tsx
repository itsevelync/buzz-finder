'use client'
import React, { useRef } from 'react'
import './ImageUploader.css'

/**
 * 
 * @returns Componenet to upload and automatically resize images
 */
const ImageUploader = () => {
    const [file, setFile] = React.useState<File | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    //Using the browswer canvas to resize the image before upload
    async function setFileAndResize(file:File|null){
        if(!file) return;
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
                },file.type);
            }
    }
    }
    //saves the image to the server, calls /api/upload, and then resets the file input
    async function saveImage(){
        if(!file) return;
       

        let formData = new FormData();
        formData.append('file', file);
        fetch('/api/upload', {
            method: 'POST',
            body: formData
        }).then(res => res.json()).then(data => {
            console.log(data);
            alert('Image uploaded successfully');
            setFile(null);
            if(inputRef.current) inputRef.current.value = '';
        }).catch(err => {
            console.error(err);
            alert('Error uploading image');
        });

    }
  return (
    <div className="image-uploader-container">
        <div className='preview'>
            {file && <img src={URL.createObjectURL(file)} alt="preview" height={500} width={500} />}
        </div>
    <input className="hidden" ref={inputRef}type="file"id="file_input" accept="image/*" onChange={(e)=>{setFileAndResize(e.target.files?.[0]??null)}}></input>
    <button onClick={()=>inputRef.current?.click()}>Select File: {file?file.name:"None Selected"}</button>
    <button className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800" onClick={saveImage}>Upload Image</button>
   
     
    </div>
  )
}

export default ImageUploader
