"use client"

import { useState } from "react"
import { Face } from "@aws-sdk/client-rekognition"

import { SearchFacesForm } from "./search-faces-form"

export default function SearchFacesPage() {
  const [matchFaces, setMatchFaces] = useState<Face[]>([])
  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          Search Faces
        </h1>
      </div>
      <div>
        <SearchFacesForm setMatchFaces={setMatchFaces} />
      </div>
    </section>
  )
}
