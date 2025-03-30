"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AccountsList } from "@/components/accounts/accounts-list"
import { ProjectsList } from "@/components/projects/projects-list"
import { DashboardHeader } from "@/components/dashboard-header"
import { AppInitializer } from "@/components/app-initializer"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/backend_config"
import Loading from "./loading"

// Component for displaying connection errors after max retry attempts
function ConnectionErrorScreen({
    retry_connection,
}: {
    retry_connection: () => void
}) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4">
            <div className="w-full max-w-md text-center">
                <Alert variant="destructive" className="mb-4">
                    <AlertTitle className="text-xl font-medium">Connection Error</AlertTitle>
                    <AlertDescription className="mt-4">
                        {"Failed to connect to the backend server."}
                    </AlertDescription>
                </Alert>
                <Button onClick={retry_connection} className="w-full">
                    Retry Connection
                </Button>
            </div>
        </div>
    )
}

// Custom hook to manage backend connection status
function use_backend_connection() {
    const [connection_status, set_connection_status] = useState<"connecting" | "connected" | "error">("connecting")
    const [error_message, set_error_message] = useState<string | null>(null)
    const [retry_count, set_retry_count] = useState<number>(0)

    useEffect(() => {
        let is_mounted = true
        const MIN_LOADING_TIME = 500 // Minimum display time for loading UI (ms)
        const WAIT_TIME = 1000 // Wait time between retry attempts (ms)
        const MAX_RETRY_ATTEMPTS = 3 // Total attempts (1 initial + 3 retries)

        const attempt_connection = async (attempt: number) => {
            if (!is_mounted) return

            set_connection_status("connecting")
            set_error_message(null)
            set_retry_count(attempt)

            console.log(`Attempt ${attempt}: Connecting to backend...`)
            const startTime = Date.now()

            try {
                await api.utils.health()
                const elapsed = Date.now() - startTime

                // Ensure loading screen shows for minimum time
                if (elapsed < MIN_LOADING_TIME) {
                    await new Promise(resolve => setTimeout(resolve, MIN_LOADING_TIME - elapsed))
                }

                if (is_mounted) {
                    console.log(`Attempt ${attempt}: Backend connection successful`)
                    set_connection_status("connected")
                }
            } catch (err) {
                console.error(`Attempt ${attempt}: Backend connection error:`, err)

                if (attempt < MAX_RETRY_ATTEMPTS) {
                    // Wait before next automatic attempt
                    await new Promise(resolve => setTimeout(resolve, WAIT_TIME))
                    if (is_mounted) {
                        attempt_connection(attempt + 1)
                    }
                } else {
                    if (is_mounted) {
                        set_connection_status("error")
                        set_error_message(
                            err instanceof Error
                                ? err.message
                                : "Failed to connect to backend server.",
                        )
                    }
                }
            }
        }

        attempt_connection(0)

        return () => {
            is_mounted = false
        }
    }, [])

    // Manual retry: reloads the page
    const retry_connection = () => {
        set_connection_status("connecting")
        set_error_message(null)
        window.location.reload()
    }

    return { connection_status, error_message, retry_connection, retry_count }
}

// Main dashboard with tabs for accounts and projects
function Dashboard() {
    return (
        <AppInitializer>
            <main className="container mx-auto py-6 px-4 md:px-6">
                <DashboardHeader />
                <Tabs defaultValue="accounts" className="mt-6">
                    <TabsList className="grid w-full grid-cols-2 mb-8">
                        <TabsTrigger value="accounts">Git Accounts</TabsTrigger>
                        <TabsTrigger value="projects">Projects</TabsTrigger>
                    </TabsList>
                    <TabsContent value="accounts">
                        <AccountsList />
                    </TabsContent>
                    <TabsContent value="projects">
                        <ProjectsList />
                    </TabsContent>
                </Tabs>
            </main>
        </AppInitializer>
    )
}

export default function Home() {
    const { connection_status, error_message, retry_connection, retry_count } = use_backend_connection()

    // Show appropriate screen based on connection status
    if (connection_status === "connecting") {
        return <Loading attempt={retry_count} max_attempts={3} />
    }

    if (connection_status === "error") {
        return (
            <ConnectionErrorScreen
                retry_connection={retry_connection}
            />
        )
    }

    return <Dashboard />
}
