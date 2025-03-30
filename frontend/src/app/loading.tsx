import { Loader2 } from "lucide-react"

export default function Loading({ attempt = 0, max_attempts = 3 }: { attempt?: number; max_attempts?: number }) {
    // Determine the status message based on the attempt count
    const statusMessage = (() => {
        // Show initial connecting message on the first attempt
        if (attempt === 0) return "Connecting to backend..."

        // Show retry messages for attempts 1 to max_attempts
        if (attempt > 0 && attempt <= max_attempts) return `Connection error. Retrying... Attempt: ${attempt} / ${max_attempts}`

        // For any other cases
        return `Max attempts reached. Please try again later.`
    })()

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <h2 className="text-xl font-medium">Loading Git Account Manager...</h2>
                {/* Fixed height container for status message */}
                <div className="h-5">
                    <p className="text-sm text-muted-foreground">{statusMessage}</p>
                </div>
            </div>
        </div>
    )
}
