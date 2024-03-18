"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Face, IndexFacesResponse } from "@aws-sdk/client-rekognition"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

import { toBase64 } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { Form, FormItem, FormLabel } from "@/components/ui/form"
import { FaceBoundingBoxesImage } from "@/components/face-bounding-boxes-image"

const formSchema = z.object({
  imageFile: z.custom<File>().nullable(),
})

export function IndexFacesForm() {
  const [uploading, setUploading] = useState(false)
  const [faces, setFaces] = useState<Face[]>([])

  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      imageFile: null,
    },
    resolver: zodResolver(formSchema),
  })

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setUploading(true)
    try {
      if (!data.imageFile) {
        alert("Please select a file to upload.")
        return
      }

      const base64Data = await toBase64(data.imageFile)

      const response = await fetch("/api/s3/create-presigned-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          base64Data,
          type: data.imageFile.type,
        }),
      })

      if (response.ok) {
        const { url, fields, key } = await response.json()

        const formData = new FormData()
        Object.entries(fields).forEach(([key, value]) => {
          formData.append(key, value as string)
        })
        formData.append("file", data.imageFile)

        const uploadResponse = await fetch(url, {
          method: "POST",
          body: formData,
        })

        if (uploadResponse.ok) {
          const indexFacesResponse = await fetch(
            "/api/rekognition/index-faces",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ key }),
            }
          )

          if (indexFacesResponse.ok) {
            const _indexFacesResult = await indexFacesResponse.json()
            const indexFacesResult: IndexFacesResponse =
              _indexFacesResult.response

            setFaces(
              indexFacesResult.FaceRecords?.map((FaceRecord) => ({
                BoundingBox: {
                  Left: FaceRecord.Face?.BoundingBox?.Left ?? 0,
                  Top: FaceRecord.Face?.BoundingBox?.Top ?? 0,
                  Width: FaceRecord.Face?.BoundingBox?.Width ?? 0,
                  Height: FaceRecord.Face?.BoundingBox?.Height ?? 0,
                },
                Confidence: FaceRecord.Face?.Confidence ?? 0,
              })) ?? []
            )
            // router.push("/")
            // startTransition(() => {
            //   router.refresh()
            // })
          } else {
            console.error("Index Faces Error:", indexFacesResponse)
            alert("Failed to index face.")
          }
        } else {
          console.error("S3 Upload Error:", uploadResponse)
          alert("Upload failed.")
        }
      } else {
        alert("Failed to get pre-signed URL.")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      alert("Failed to index face due to a network or other error")
    } finally {
      setUploading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Controller
          render={({ field: { onChange, value } }) => (
            <FormItem>
              <FormLabel htmlFor="imageFile">Image</FormLabel>
              {value && (
                <FaceBoundingBoxesImage
                  imageUrl={URL.createObjectURL(value)}
                  faces={faces}
                />
              )}
              <div className="relative">
                <label
                  className={`${buttonVariants({
                    variant: "default",
                    size: "default",
                  })} mt-2`}
                  htmlFor="single"
                >
                  {uploading ? "Uploading ..." : "Upload"}
                </label>

                <input
                  style={{
                    visibility: "hidden",
                    position: "absolute",
                    width: 0,
                  }}
                  type="file"
                  id="single"
                  accept="image/*"
                  onChange={(e) => {
                    if (!e.target.files?.[0]) return
                    setUploading(true)
                    onChange(e.target.files?.[0] as File)
                    setUploading(false)
                  }}
                  disabled={uploading}
                />
              </div>
            </FormItem>
          )}
          name="imageFile"
          control={form.control}
        />
        {form.getValues("imageFile") && (
          <Button disabled={uploading} type="submit">
            {uploading ? "loading..." : "index face"}
          </Button>
        )}
      </form>
    </Form>
  )
}
