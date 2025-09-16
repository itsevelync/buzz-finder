
import fs from 'fs'
import { NextRequest } from 'next/server';
import path from 'path'
import Image from '@/model/Image';

async function saveFile(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  //currently store all images in /public/uploads, this can be changed later to be a cloud storage service
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Add a timestamp to avoid collisions
  const fileName = `${Date.now()}-${file.name}`;
  const filePath = path.join(uploadDir, fileName);

  fs.writeFileSync(filePath, buffer);

  // Return public URL
  return `/uploads/${fileName}`;
}


export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  if (!file) {
    return new Response(JSON.stringify({ error: 'No file uploaded' }), { status: 400 });
  }
  const fileUrl = await saveFile(file);
  Image.create({ filepath: fileUrl });//Add the image url to the database
  return new Response(JSON.stringify({ url: fileUrl }), { status: 200 });

}
