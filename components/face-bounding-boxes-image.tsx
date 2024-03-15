"use client"

import React, { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Face } from "@aws-sdk/client-rekognition"

import { AspectRatio } from "./ui/aspect-ratio"

type Props = {
  imageUrl: string
  faces: Face[]
}

export function FaceBoundingBoxesImage({ imageUrl, faces }: Props) {
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
      {faces.map((face, index) => {
        if (!face.BoundingBox) return null
        const { Left, Top, Width, Height } = face.BoundingBox
        const confidenceText = `Confidence: ${face.Confidence?.toFixed(2)}%`

        return (
          <React.Fragment key={index}>
            <div
              style={{
                position: "absolute",
                left: Left ? `${Left * containerSize.width}px` : "",
                top: Top ? `${Top * containerSize.height}px` : "",
                width: Width ? `${Width * containerSize.width}px` : "",
                height: Height ? `${Height * containerSize.height}px` : "",
                border: "2px solid yellow",
              }}
            ></div>
            <div
              style={{
                position: "absolute",
                left: Left ? `${Left * containerSize.width}px` : "",
                top:
                  Top && Height
                    ? `${
                        Top * containerSize.height +
                        Height * containerSize.height
                      }px`
                    : "",
                color: "yellow",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                padding: "2px",
                fontSize: "12px",
              }}
            >
              {confidenceText}
            </div>
          </React.Fragment>
        )
      })}
    </div>
  )
}
