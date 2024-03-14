"use client"

import { startTransition, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Button, buttonVariants } from "@/components/ui/button"
import { Form, FormItem, FormLabel } from "@/components/ui/form"

const formSchema = z.object({
  imageFile: z.custom<File>().nullable(),
})

export function IndexFacesForm() {
  const [uploading, setUploading] = useState(false)
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
      const response = await fetch("/api/s3/create-presigned-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: data.imageFile.name,
          contentType: data.imageFile.type,
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

          const indexFacesResponseResult = await indexFacesResponse.json()
          if (indexFacesResponseResult.ok) {
            console.log("Face indexed successfully.", indexFacesResponseResult)
            router.push("/")
            startTransition(() => {
              router.refresh()
            })
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
                <AspectRatio ratio={1}>
                  <Image
                    src={URL.createObjectURL(value)}
                    alt="Uploaded Image"
                    fill
                    className="rounded-md object-cover"
                  />
                </AspectRatio>
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
