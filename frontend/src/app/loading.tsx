import { Loader2 } from "lucide-react"

export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <h2 className="text-xl font-medium">Loading Git Account Manager...</h2>
            </div>
        </div>
    )
}
