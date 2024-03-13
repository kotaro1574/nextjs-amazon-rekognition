import { NextRequest, NextResponse } from "next/server"
import { S3Client } from "@aws-sdk/client-s3"
import { createPresignedPost } from "@aws-sdk/s3-presigned-post"
import { v4 as uuidv4 } from "uuid"

const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
}

export async function POST(request: NextRequest) {
  const { contentType } = await request.json()
  try {
    const key = uuidv4()
    const client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: credentials,
    })
    const { url, fields } = await createPresignedPost(client, {
      Bucket: process.env.AMPLIFY_BUCKET ?? "",
      Key: key,
      Conditions: [
        ["content-length-range", 0, 10485760], // up to 10 MB
        ["starts-with", "$Content-Type", contentType],
      ],
      Fields: {
        "Content-Type": contentType,
      },
    })

    return NextResponse.json({ url, fields, key })
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
