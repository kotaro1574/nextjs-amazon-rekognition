"use client"

import { Dispatch, SetStateAction, useState } from "react"
import { useRouter } from "next/navigation"
import { Face, SearchFacesByImageResponse } from "@aws-sdk/client-rekognition"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

import { Button, buttonVariants } from "@/components/ui/button"
import { Form, FormItem, FormLabel } from "@/components/ui/form"
import { FaceBoundingBoxesImage } from "@/components/face-bounding-boxes-image"

const formSchema = z.object({
  imageFile: z.custom<File>().nullable(),
})

type Props = {
  setMatchFaces: Dispatch<SetStateAction<Face[]>>
}

export function SearchFacesForm({ setMatchFaces }: Props) {
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

    // ファイルが選択されていない場合は処理を中断します。
    if (!data.imageFile) {
      alert("Please select an image to upload.")
      setUploading(false)
      return
    }

    try {
      // 画像ファイルをbase64に変換します。
      const reader = new FileReader()
      reader.readAsDataURL(data.imageFile)
      reader.onloadend = async () => {
        const base64Data = reader.result?.toString().split(",")[1] || ""

        // base64エンコードされた画像データをAPIにPOSTリクエストとして送信します。
        const response = await fetch("/api/rekognition/search-faces-by-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ image: base64Data }),
        })

        const _result = await response.json()
        if (response.ok) {
          const result: SearchFacesByImageResponse = _result.response

          setFaces([
            {
              BoundingBox: {
                Width: result.SearchedFaceBoundingBox?.Width ?? 0,
                Height: result.SearchedFaceBoundingBox?.Height ?? 0,
                Left: result.SearchedFaceBoundingBox?.Left ?? 0,
                Top: result.SearchedFaceBoundingBox?.Top ?? 0,
              },
              Confidence: result.SearchedFaceConfidence ?? 0,
            },
          ])
          console.log("Search result:", result)
        } else {
          alert(`Face search failed: ${_result.error}`)
        }
      }
    } catch (error) {
      alert("Failed to upload image. Please try again.")
      console.error("onSubmit error:", error)
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
            {uploading ? "loading..." : "search face"}
          </Button>
        )}
      </form>
    </Form>
  )
}
