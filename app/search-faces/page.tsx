"use client"

import { useState } from "react"
import { Face, FaceMatch } from "@aws-sdk/client-rekognition"

import { FaceBoundingBoxesImage } from "@/components/face-bounding-boxes-image"

import { SearchFacesForm } from "./search-faces-form"

export type FaceMatchesWithImage = FaceMatch & { imageUrl?: string }

export default function SearchFacesPage() {
  const [faceMatches, setFaceMatches] = useState<FaceMatchesWithImage[]>([])

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          Search Faces
        </h1>
      </div>
      <div>
        <SearchFacesForm setFaceMatches={setFaceMatches} />
      </div>
      <div>
        <h2 className="text-2xl font-bold">Matched Faces</h2>
        <div>
          {faceMatches.map((faceMatch, index) => (
            <FaceBoundingBoxesImage
              key={`${faceMatch.Face?.FaceId}-${index}`}
              faces={[faceMatch.Face as Face]}
              imageUrl={faceMatch?.imageUrl ?? ""}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
