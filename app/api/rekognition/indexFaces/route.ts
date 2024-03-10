import { NextRequest, NextResponse } from "next/server"
import {
  IndexFacesCommand,
  RekognitionClient,
} from "@aws-sdk/client-rekognition"
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { v4 as uuidv4 } from "uuid"

const Bucket = process.env.AMPLIFY_BUCKET

const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
}

const rekog = new RekognitionClient({
  region: process.env.AWS_REGION,
  credentials: credentials,
})

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: credentials,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const base64Img = body.image.replace("data:image/jpeg;base64,", "")
    const imgBuffer = Buffer.from(base64Img, "base64")

    const imageId = uuidv4()

    await rekog.send(
      new IndexFacesCommand({
        CollectionId: Bucket,
        ExternalImageId: imageId,
        Image: { Bytes: imgBuffer },
      })
    )

    await s3.send(
      new PutObjectCommand({
        Bucket: Bucket,
        Key: `faces/${imageId}.jpg`,
        Body: imgBuffer,
      })
    )

    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error(error)
    return new NextResponse(JSON.stringify({ error: "Failed to index face" }), {
      status: 500,
    })
  }
}
