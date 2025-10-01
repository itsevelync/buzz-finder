'use client'
import LocationSelectMap from '@/components/maps/LocationSelectMap';
import ImageUploader from '@/components/ui/ImageUploader'
import React, { useState } from 'react'

const page = () => {

  const [file, setFile] = useState<File | null>(null);
  const gtCampus = { lat: 33.7780, lng: -84.3980 };

  const [selectedLocation, setSelectedLocation] = React.useState<{ lat: number, lng: number }>(gtCampus)



  //saves the image to the server, calls /api/upload, and then resets the file input returning fileName
  async function saveImage() {
    if (!file) return " ";



    let formData = new FormData();
    formData.append('file', file);
    let res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    let data = await res.json();
    console.log("POST SUBMITTED")
    console.log(res)

    return data.url;
  }
  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("Submitting form");
    const url = (await saveImage());

    console.log("Image saved with url: " + url);




    const form = e.target as HTMLFormElement;
    const body = {
      title: (form.elements.namedItem('title') as HTMLInputElement).value,
      status: false,
      item_description: (form.elements.namedItem('item_description') as HTMLInputElement).value,
      retrieval_description: (form.elements.namedItem('retrieval_description') as HTMLInputElement).value,
      contact_info: (form.elements.namedItem("name") as HTMLInputElement).value + " " + (form.elements.namedItem('contact_info') as HTMLInputElement).value,
      category: (form.elements.namedItem('category') as HTMLInputElement).value,
      image: url,
      position: {
        lat: selectedLocation.lat,
        lon: selectedLocation.lng
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
    <div className='flex flex-col md:flex-row gap-10 p-10'>
      <ImageUploader file={file} setFile={setFile} />

      <form className={"flex flex-col justify-between w-full md:w-1/2 gap-4"} onSubmit={handleFormSubmit}>
        <LocationSelectMap height={400} width={400} selectedLocation={selectedLocation} setSelectedLocation={setSelectedLocation} />
        <input type='text' name='title' placeholder='Title' className='border-2 border-green-500 rounded-lg p-2' />
        <textarea name="item_description" placeholder={"Write a little item description here"} id="item_description" className='block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm leading-6 placeholder-gray-400
                focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none transition-colors hover:border-gray-400 resize-vertical'></textarea>
        <div className={'flex flex-col md:flex-row gap-3 w-full justify-between'}>
          <input type="text" name='name' placeholder='Your Name' className={"border-2 border-gray-300 rounded-lg p-2"} />
          <input type="text" name='contact_info' placeholder='Contact Info' className={"border-2 border-gray-300 rounded-lg p-2"} />

        </div>
        <textarea name="retrievel_description" id="retrieval_description" placeholder='How do you want this item to be retrieved?' className='block w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm leading-6 placeholder-gray-400
                focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none transition-colors hover:border-gray-400 resize-vertical'></textarea>
        <select name="category" id="category" defaultValue={"other"} className='border-2 border-gray-300 rounded-lg p-2'>
          <option value="electronics">Electronics</option>
          <option value="clothing">Clothing</option>
          <option value="books">Books</option>
          <option value="buzzcard">Buzzcard</option>
          <option value="other">Other</option>
        </select>


        <button type="submit" className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800" >Upload Lost Item</button>

      </form>



    </div>
  )
}

export default page
