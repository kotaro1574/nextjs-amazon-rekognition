"use client"

import { useState } from "react"
import Image from "next/image"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

import { Button, buttonVariants } from "@/components/ui/button"
import { Form, FormItem, FormLabel } from "@/components/ui/form"

const formSchema = z.object({
  imageFile: z.instanceof(File).nullable(),
})

export function IndexFacesForm() {
  const [uploading, setUploading] = useState(false)
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      imageFile: null,
    },
    resolver: zodResolver(formSchema),
  })

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const formData = new FormData()
    formData.append("image", data.imageFile as File)
    const response = await fetch("/api/rekognition/indexFaces", {
      method: "POST",
      body: formData,
    })
    if (response.ok) {
      alert("Face indexed successfully")
    } else {
      alert("Failed to index face")
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
                <Image
                  src={URL.createObjectURL(value)}
                  alt="Uploaded Image"
                  width={200}
                  height={200}
                />
              )}
              <div style={{ width: "200px" }} className="relative">
                <label
                  className={`${buttonVariants({
                    variant: "default",
                    size: "default",
                  })} mt-2 block w-full`}
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
                    onChange(e.target.files?.[0])
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
        <Button disabled={uploading} type="submit">
          {uploading ? "loading..." : "index face"}
        </Button>
      </form>
    </Form>
  )
}
