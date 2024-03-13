import { NextRequest, NextResponse } from "next/server"
import {
  IndexFacesCommand,
  RekognitionClient,
} from "@aws-sdk/client-rekognition"
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { createPresignedPost } from "@aws-sdk/s3-presigned-post"
import { v4 as uuidv4 } from "uuid"

const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
}

export async function POST(request: NextRequest) {
  try {
    const { key } = await request.json()

    const rekognitionClient = new RekognitionClient({
      region: process.env.AWS_REGION,
      credentials,
    })

    const response = await rekognitionClient.send(
      new IndexFacesCommand({
        CollectionId: process.env.AMPLIFY_BUCKET,
        Image: {
          S3Object: {
            Bucket: process.env.AMPLIFY_BUCKET,
            Name: key,
          },
        },
      })
    )

    return NextResponse.json({ response }, { status: 200 })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    } else {
      return NextResponse.json(
        { error: "An unknown error occurred" },
        { status: 500 }
      )
    }
  }
}
