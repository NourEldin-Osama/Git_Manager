"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, RefreshCw, ExternalLink, Loader2 } from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/backend_config"

interface PrerequisiteStatus {
    git: boolean
    ssh: boolean
    checking: boolean
    error?: string
}

export function AppInitializer({ children }: { children: React.ReactNode }) {
    const [status, setStatus] = useState<PrerequisiteStatus>({
        git: false,
        ssh: false,
        checking: true,
    })
    const [initialized, setInitialized] = useState(false)

    const checkPrerequisites = async () => {
        setStatus((prev) => ({ ...prev, checking: true, error: undefined }))

        try {
            const data = await api.system.check()

            setStatus({
                git: data.git,
                ssh: data.ssh,
                checking: false,
            })

            // If all prerequisites are met, mark as initialized after a short delay
            if (data.git && data.ssh) {
                setTimeout(() => {
                    setInitialized(true)
                }, 2000) // Show success message for 2 seconds
            }
        } catch (error) {
            setStatus({
                git: false,
                ssh: false,
                checking: false,
                error: error instanceof Error ? error.message : "Unknown error occurred",
            })
        }
    }

    useEffect(() => {
        checkPrerequisites()
    }, [])

    if (initialized) {
        return <>{children}</>
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Git Account Manager</CardTitle>
                    <CardDescription>Verifying system prerequisites...</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {status.checking ? (
                        <div className="flex items-center justify-center py-6">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="ml-2 text-lg">Checking prerequisites...</span>
                        </div>
                    ) : (
                        <>
                            {status.error && (
                                <Alert variant="destructive" className="mb-4">
                                    <XCircle className="h-4 w-4" />
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{status.error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-3">
                                <PrerequisiteItem
                                    name="Git"
                                    installed={status.git}
                                    description="Required for repository operations"
                                    installUrl="https://git-scm.com/downloads"
                                />

                                <PrerequisiteItem
                                    name="SSH"
                                    installed={status.ssh}
                                    description="Required for secure authentication"
                                    installUrl="https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent"
                                />
                            </div>

                            {status.git && status.ssh ? (
                                <Alert className="mt-6 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800">
                                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    <AlertTitle>All prerequisites met!</AlertTitle>
                                    <AlertDescription>Launching Git Account Manager...</AlertDescription>
                                </Alert>
                            ) : null}
                        </>
                    )}
                </CardContent>
                {!status.checking && (!status.git || !status.ssh) && (
                    <CardFooter>
                        <Button onClick={() => checkPrerequisites()} className="w-full" disabled={status.checking}>
                            {status.checking ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Checking...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Check Again
                                </>
                            )}
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </div>
    )
}

interface PrerequisiteItemProps {
    name: string
    installed: boolean
    description: string
    installUrl: string
}

function PrerequisiteItem({ name, installed, description, installUrl }: PrerequisiteItemProps) {
    return (
        <div className="flex items-start space-x-3 p-3 rounded-md border">
            {installed ? (
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
            ) : (
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
            )}
            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <h3 className="font-medium">{name}</h3>
                    {!installed && (
                        <Link
                            href={installUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                        >
                            Install
                            <ExternalLink className="ml-1 h-3 w-3" />
                        </Link>
                    )}
                </div>
                <p className="text-sm text-muted-foreground">{description}</p>
                {!installed && <div className="mt-2 text-sm text-red-600 dark:text-red-400">Not detected on your system</div>}
            </div>
        </div>
    )
}
