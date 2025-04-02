"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { GitProject, GitAccount } from "@/lib/types"
import { Folder, ChevronDown, ChevronRight } from "lucide-react"
import { api } from "@/lib/backend_config"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { toast } from "sonner"

interface ProjectFormProps {
    project?: GitProject
    onSubmit: (project: Omit<GitProject, 'id' | 'created_at' | 'updated_at' | 'configured'>) => void
    onCancel: () => void
}

export function ProjectForm({ project, onSubmit, onCancel }: ProjectFormProps) {
    const [formData, setFormData] = useState<Omit<GitProject, 'id' | 'created_at' | 'updated_at' | 'configured'>>({
        name: project?.name || "",
        path: project?.path || "",
        account_id: project?.account_id || null,
        remote_url: project?.remote_url || "",
        remote_name: project?.remote_name || "",
    })
    const [accounts, setAccounts] = useState<GitAccount[]>([])
    const [isLoadingAccounts, setIsLoadingAccounts] = useState(false)
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(!!project?.remote_url || !!project?.remote_name)
    const [isSelectingFolder, setIsSelectingFolder] = useState(false)

    useEffect(() => {
        fetchAccounts()
    }, [])

    const fetchAccounts = async () => {
        setIsLoadingAccounts(true)
        try {
            const data = await api.accounts.list()
            setAccounts(data)

            // Set default account_id if not already set and accounts are available
            if ((!formData.account_id) && data.length > 0) {
                setFormData(prev => ({ ...prev, account_id: data[0].id }))
            }
        } catch (err) {
            console.error("Failed to fetch accounts:", err)
        } finally {
            setIsLoadingAccounts(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    const handleAccountChange = (value: string) => {
        setFormData({ ...formData, account_id: Number(value) })
    }

    const handleBrowse = async () => {
        setIsSelectingFolder(true)
        try {
            const response = await api.system.openFolderDialog()
            if (response.status === "success" && response.path) {
                setFormData({ ...formData, path: response.path })

                // Set name based on last part of path if name is empty
                if (!formData.name) {
                    const pathParts = response.path.split(/[/\\]/)
                    const lastPart = pathParts[pathParts.length - 1]
                    if (lastPart) {
                        setFormData(prev => ({ ...prev, name: lastPart }))
                    }
                }
            } else if (response.status === "cancelled") {
                toast.info("Folder selection cancelled")
            }
        } catch (err) {
            console.error("Failed to open folder dialog:", err)
            toast.error("Error selecting folder", {
                description: err instanceof Error ? err.message : "An error occurred"
            })
        } finally {
            setIsSelectingFolder(false)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(formData)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor="name">Project Name</Label>
                    <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="My Awesome Project"
                        required
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="path">Project Path</Label>
                    <div className="flex space-x-2">
                        <Input
                            id="path"
                            name="path"
                            value={formData.path}
                            onChange={handleChange}
                            placeholder="/path/to/project"
                            className="flex-1"
                            required
                        />
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleBrowse}
                            disabled={isSelectingFolder}
                        >
                            <Folder className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="account">Git Account</Label>
                    <Select
                        value={formData.account_id ? formData.account_id.toString() : ""}
                        onValueChange={handleAccountChange}
                        disabled={isLoadingAccounts || accounts.length === 0}
                    >
                        <SelectTrigger id="account">
                            <SelectValue placeholder={isLoadingAccounts ? "Loading accounts..." : "Select an account"} />
                        </SelectTrigger>
                        <SelectContent>
                            {accounts.map((account) => (
                                <SelectItem key={account.id} value={account.id.toString()}>
                                    {account.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {accounts.length === 0 && !isLoadingAccounts && (
                        <p className="text-sm text-muted-foreground">
                            No accounts available. Please add an account first.
                        </p>
                    )}
                </div>

                <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
                    <CollapsibleTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="flex items-center p-0 w-full justify-start"
                        >
                            {isAdvancedOpen ? (
                                <ChevronDown className="h-4 w-4 mr-1" />
                            ) : (
                                <ChevronRight className="h-4 w-4 mr-1" />
                            )}
                            Advanced Settings
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-4 mt-4">
                        <div className="grid gap-2">
                            <Label htmlFor="remote_url">Remote URL (Optional)</Label>
                            <Input
                                id="remote_url"
                                name="remote_url"
                                value={formData.remote_url}
                                onChange={handleChange}
                                placeholder="https://github.com/username/repo.git"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="remote_name">Remote Name (Optional)</Label>
                            <Input
                                id="remote_name"
                                name="remote_name"
                                value={formData.remote_name}
                                onChange={handleChange}
                                placeholder="origin"
                            />
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </div>

            <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoadingAccounts || accounts.length === 0}>
                    {project ? "Update" : "Add"}
                </Button>
            </div>
        </form>
    )
}
