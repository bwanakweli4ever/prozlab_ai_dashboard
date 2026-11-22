"use client"

import { useCallback, useEffect, useState } from "react"
import Cropper, { type Area } from "react-easy-crop"
import { Loader2, Minus, Plus, RotateCcw, RotateCw, Undo2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

/** Size of the saved photo (square). The server also makes 400px and 150px copies from it. */
const OUTPUT_SIZE = 800
/** Phones limit canvas size; big camera photos are scaled to this before cropping. */
const MAX_SOURCE_SIDE = 4096
const MIN_ZOOM = 1
const MAX_ZOOM = 4

type Props = {
  file: File | null
  onCancel: () => void
  /** Receives the cropped 800x800 JPEG. Throw to keep the dialog open and show the error. */
  onSave: (photo: File) => Promise<void>
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("unreadable"))
    img.src = src
  })
}

/** Draws the chosen square (from the rotated image) onto an 800x800 canvas and returns a JPEG. */
async function cropToJpeg(src: string, area: Area, rotation: number): Promise<File> {
  const image = await loadImage(src)
  const scale = Math.min(1, MAX_SOURCE_SIDE / Math.max(image.naturalWidth, image.naturalHeight))
  const w = image.naturalWidth * scale
  const h = image.naturalHeight * scale
  const rad = (rotation * Math.PI) / 180
  const boxW = Math.abs(w * Math.cos(rad)) + Math.abs(h * Math.sin(rad))
  const boxH = Math.abs(w * Math.sin(rad)) + Math.abs(h * Math.cos(rad))

  const rotated = document.createElement("canvas")
  rotated.width = Math.round(boxW)
  rotated.height = Math.round(boxH)
  const rctx = rotated.getContext("2d")
  if (!rctx) throw new Error("Your browser couldn't prepare the photo.")
  rctx.translate(boxW / 2, boxH / 2)
  rctx.rotate(rad)
  rctx.drawImage(image, -w / 2, -h / 2, w, h)

  const out = document.createElement("canvas")
  out.width = OUTPUT_SIZE
  out.height = OUTPUT_SIZE
  const octx = out.getContext("2d")
  if (!octx) throw new Error("Your browser couldn't prepare the photo.")
  octx.fillStyle = "#ffffff"
  octx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE)
  octx.imageSmoothingEnabled = true
  octx.imageSmoothingQuality = "high"
  octx.drawImage(
    rotated,
    area.x * scale,
    area.y * scale,
    area.width * scale,
    area.height * scale,
    0,
    0,
    OUTPUT_SIZE,
    OUTPUT_SIZE,
  )

  const blob = await new Promise<Blob | null>((resolve) => out.toBlob(resolve, "image/jpeg", 0.9))
  if (!blob) throw new Error("Your browser couldn't prepare the photo.")
  return new File([blob], "profile-photo.jpg", { type: "image/jpeg" })
}

export function PhotoCropDialog({ file, onCancel, onSave }: Props) {
  const [src, setSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [area, setArea] = useState<Area | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Read the chosen file, and check the browser can actually show it before opening the editor.
  useEffect(() => {
    if (!file) return
    const url = URL.createObjectURL(file)
    let cancelled = false
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setRotation(0)
    setArea(null)
    setError(null)
    loadImage(url)
      .then(() => {
        if (!cancelled) setSrc(url)
      })
      .catch(() => {
        if (!cancelled) {
          setSrc(null)
          setError("We can't open that file as a photo. Choose a JPG or PNG picture.")
        }
      })
    return () => {
      cancelled = true
      URL.revokeObjectURL(url)
    }
  }, [file])

  const onCropComplete = useCallback((_: Area, pixels: Area) => setArea(pixels), [])

  const save = async () => {
    if (!src || !area) return
    setSaving(true)
    setError(null)
    try {
      await onSave(await cropToJpeg(src, area, rotation))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save the photo. Try again.")
    } finally {
      setSaving(false)
    }
  }

  const reset = () => {
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setRotation(0)
  }

  return (
    <Dialog open={!!file} onOpenChange={(open) => !open && !saving && onCancel()}>
      <DialogContent className="max-w-md gap-0 border-slate-200 bg-white p-0 text-slate-900 sm:max-w-lg [&>button]:text-slate-500">
        <DialogHeader className="px-5 pb-3 pt-5">
          <DialogTitle className="text-slate-900">Adjust your photo</DialogTitle>
          <DialogDescription className="text-slate-500">Drag to position, zoom to fit your face in the circle.</DialogDescription>
        </DialogHeader>

        <div className="relative mx-5 h-[300px] overflow-hidden rounded-xl bg-slate-900 sm:h-[360px]">
          {src ? (
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              minZoom={MIN_ZOOM}
              maxZoom={MAX_ZOOM}
              aspect={1}
              cropShape="round"
              showGrid={false}
              objectFit="cover"
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={onCropComplete}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[13px] text-slate-300">
              {error ? "No photo to show" : <Loader2 className="h-5 w-5 animate-spin" />}
            </div>
          )}
        </div>

        <div className="space-y-3 px-5 pt-4">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              onClick={() => setZoom((z) => Math.max(MIN_ZOOM, +(z - 0.2).toFixed(2)))}
              disabled={!src || zoom <= MIN_ZOOM}
              aria-label="Zoom out"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <input
              type="range"
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={0.01}
              value={zoom}
              disabled={!src}
              onChange={(e) => setZoom(Number(e.target.value))}
              aria-label="Zoom"
              className="h-1.5 flex-1 cursor-pointer accent-[#6366F1]"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              onClick={() => setZoom((z) => Math.min(MAX_ZOOM, +(z + 0.2).toFixed(2)))}
              disabled={!src || zoom >= MAX_ZOOM}
              aria-label="Zoom in"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" size="sm" className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900" disabled={!src} onClick={() => setRotation((r) => (r - 90) % 360)}>
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Rotate left
            </Button>
            <Button type="button" variant="outline" size="sm" className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900" disabled={!src} onClick={() => setRotation((r) => (r + 90) % 360)}>
              <RotateCw className="mr-1.5 h-3.5 w-3.5" /> Rotate right
            </Button>
            <Button type="button" variant="ghost" size="sm" disabled={!src} onClick={reset} className="text-slate-500 hover:bg-slate-100 hover:text-slate-800">
              <Undo2 className="mr-1.5 h-3.5 w-3.5" /> Reset
            </Button>
          </div>
          {error && (
            <p role="alert" className="text-[13px] text-red-600">
              {error}
            </p>
          )}
        </div>

        <DialogFooter className="gap-2 px-5 pb-5 pt-4 sm:gap-2">
          <Button type="button" variant="outline" className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button type="button" onClick={save} disabled={!src || !area || saving} className="bg-brand text-white hover:bg-brand-dark">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {saving ? "Saving…" : "Save photo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
