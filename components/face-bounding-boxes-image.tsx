"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { IndexFacesResponse } from "@aws-sdk/client-rekognition"

import { AspectRatio } from "./ui/aspect-ratio"

type Props = {
  imageUrl: string
  rekognitionResponse: IndexFacesResponse
}

export function FaceBoundingBoxesImage({
  imageUrl,
  rekognitionResponse,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState<{
    width: number
    height: number
  }>({ width: 0, height: 0 })

  useEffect(() => {
    if (containerRef.current) {
      setContainerSize({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight,
      })
    }
  }, [])

  console.log("FaceBoundingBoxesImage", {
    imageUrl,
    rekognitionResponse: rekognitionResponse.FaceRecords,
    containerSize,
  })

  return (
    <div ref={containerRef} className="relative max-w-[500px]">
      <AspectRatio ratio={1}>
        <Image
          src={imageUrl}
          alt="Uploaded Image"
          fill
          className="rounded-md object-cover"
        />
      </AspectRatio>
      {rekognitionResponse.FaceRecords?.map((FaceRecord, index) => {
        if (!FaceRecord.Face) return null
        if (!FaceRecord.Face.BoundingBox) return null
        const { Left, Top, Width, Height } = FaceRecord.Face.BoundingBox
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: Left ? `${Left * containerSize.width}px` : "",
              top: Top ? `${Top * containerSize.height}px` : "",
              width: Width ? `${Width * containerSize.width}px` : "",
              height: Height ? `${Height * containerSize.height}px` : "",
              border: "2px solid yellow",
            }}
          />
        )
      })}
    </div>
  )
}