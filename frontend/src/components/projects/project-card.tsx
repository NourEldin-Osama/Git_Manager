"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { GitAccount, GitProject } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Edit, Folder, GitBranch, Trash, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { api } from "@/lib/backend_config"
import { toast } from "sonner"

interface ProjectCardProps {
    project: GitProject
    onEdit: () => void
    onDelete: () => void
    onValidate: () => Promise<boolean>
}

export function ProjectCard({ project, onEdit, onDelete, onValidate }: ProjectCardProps) {
    const [accountName, setAccountName] = useState<string>("Loading...")
    const [isLoading, setIsLoading] = useState(false)
    const [isValidating, setIsValidating] = useState(false)

    useEffect(() => {
        if (project.account_id) {
            fetchAccount()
        } else {
            setAccountName("No Account")
        }
    }, [project.account_id])

    const fetchAccount = async () => {
        if (!project.account_id) return

        try {
            const account = await api.accounts.get(project.account_id)
            setAccountName(account.name)
        } catch (err) {
            console.error("Failed to fetch account:", err)
            setAccountName("Unknown Account")
        }
    }

    const handleSwitchAccount = async () => {
        setIsLoading(true)
        try {
            const accounts = await api.accounts.list()
            if (accounts.length <= 1) {
                toast.warning("Switch account failed", {
                    description: "You need at least two accounts to switch between them."
                })
                return
            }

            // Find a different account to switch to
            const otherAccount = accounts.find(a => a.id !== project.account_id)
            if (!otherAccount) return

            // Update the project with the new account
            await api.projects.update(project.id, { account_id: otherAccount.id })
            toast.success("Account switched", {
                description: `Switched project ${project.name} to account: ${otherAccount.name}`
            })

            // Refresh account name
            setAccountName(otherAccount.name)
        } catch (err) {
            console.error("Failed to switch account:", err)
            toast.error("Failed to switch account", {
                description: err instanceof Error ? err.message : "Unknown error"
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleValidate = async () => {
        setIsValidating(true)
        try {
            await onValidate()
        } finally {
            setIsValidating(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle>{project.name}</CardTitle>
                    <Badge>{accountName}</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <div className="flex items-center text-sm">
                        <Folder className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{project.path}</span>
                    </div>

                    {project.remote_url && (
                        <div className="flex items-center text-sm">
                            <GitBranch className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span className="truncate">{project.remote_url}</span>
                        </div>
                    )}

                    <div className="flex items-center mt-4">
                        {project.configured ? (
                            <Badge variant="outline" className="flex gap-1 items-center">
                                <CheckCircle className="h-3 w-3" /> Configured
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="flex gap-1 items-center text-amber-500 border-amber-500">
                                <AlertCircle className="h-3 w-3" /> Not Configured
                            </Badge>
                        )}
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={onEdit}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={onDelete}>
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                </div>
                <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={handleValidate} disabled={isValidating}>
                        {isValidating ? 'Validating...' : 'Validate'}
                    </Button>
                    <Button size="sm" onClick={handleSwitchAccount} disabled={isLoading}>
                        <GitBranch className="mr-2 h-4 w-4" />
                        {isLoading ? 'Switching...' : 'Switch Account'}
                    </Button>
                </div>
            </CardFooter>
        </Card>
    )
}
