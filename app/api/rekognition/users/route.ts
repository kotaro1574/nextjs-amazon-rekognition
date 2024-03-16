import { NextRequest, NextResponse } from "next/server"
import {
  CreateUserCommand,
  ListUsersCommand,
  RekognitionClient,
} from "@aws-sdk/client-rekognition"
import { v4 as uuidv4 } from "uuid"

const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
}

const rekognitionClient = new RekognitionClient({
  region: process.env.AWS_REGION,
  credentials,
})

export async function GET() {
  const response = await rekognitionClient.send(
    new ListUsersCommand({
      CollectionId: process.env.AMPLIFY_BUCKET,
    })
  )
  return NextResponse.json(response?.Users ?? [])
}

export async function POST(request: NextRequest) {
  const response = await rekognitionClient.send(
    new CreateUserCommand({
      CollectionId: process.env.AMPLIFY_BUCKET,
      UserId: uuidv4(),
    })
  )
  return NextResponse.json(response)
}
