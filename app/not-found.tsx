import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F8FAFC] px-4">
      <h1 className="text-2xl font-bold text-slate-900">Page not found</h1>
      <p className="text-[14px] text-slate-500">The page you are looking for does not exist.</p>
      <Button asChild className="bg-brand hover:bg-brand/90">
        <Link href="/">Go home</Link>
      </Button>
    </div>
  )
}
