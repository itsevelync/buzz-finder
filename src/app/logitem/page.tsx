'use client'
import ImageUploader from '@/components/ui/ImageUploader'
import React, { useState } from 'react'

const page = () => {

    const [file, setFile] = useState<File | null>(null);


  //saves the image to the server, calls /api/upload, and then resets the file input
      async function saveImage() {
          if (!file) return;


          let formData = new FormData();
          formData.append('file', file);
          fetch('/api/upload', {
              method: 'POST',
              body: formData
          }).then(res => res.json()).then(data => {
              console.log(data);
              alert('Image uploaded successfully');
              setFile(null);
              //if (inputRef.current) inputRef.current.value = '';
          }).catch(err => {
              console.error(err);
              alert('Error uploading image');
          });
        }
    function handleFormSubmit(e:React.FormEvent) {
        e.preventDefault();
        saveImage();
    }


  return (


    <div className='flex flex-row justify-center items-center gap-10 m-10'>
           <ImageUploader file={file} setFile={setFile}/>
 
      <form className={"flex flex-col justify-between"} onSubmit={handleFormSubmit}>
      <input type='text' name='title' placeholder='Title' className='border-2 border-green-500 rounded-lg p-2 m-2'/>
      <textarea name="item_description" placeholder={"Write a little item description here"} id="item_description" className='mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm leading-6 placeholder-gray-400
              focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none transition-colors hover:border-gray-400 resize-vertical'></textarea>
      <div className={'flex flex-row W-full justify-between'}>
        <input type="text" name='name' placeholder='Your Name' className={"border-2 border-gray-300 rounded-lg p-2 m-2"} />
        <input type="text" name='contact_info' placeholder='Contact Info' className={"border-2 border-gray-300 rounded-lg p-2 m-2"}/>

      </div>
       <textarea name="retrievel_description" id="retrieval_description" placeholder='How do you want this item to be retrieved?' className='mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm leading-6 placeholder-gray-400
              focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none transition-colors hover:border-gray-400 resize-vertical'></textarea>
      <select name="category" id="category" defaultValue={"other"}  className='border-2 border-gray-300 rounded-lg p-2 m-2'>
        <option value="electronics">Electronics</option>
        <option value="clothing">Clothing</option>
        <option value="books">Books</option>
        <option value="buzzcard">Buzzcard</option>
        <option value="other">Other</option>
      </select>
     

      <button type="submit" className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800" >Upload Lost Item</button>

      </form>



    </div>
  )
}

export default page
