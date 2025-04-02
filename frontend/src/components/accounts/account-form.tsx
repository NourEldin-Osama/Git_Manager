"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { GitAccount, AccountCreate, AccountType } from "@/lib/types"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Key, AlertCircle, Plus, Clipboard, ClipboardCheck } from "lucide-react"
import { siGithub } from "simple-icons/icons"
import { api } from "@/lib/backend_config"
import { toast } from "sonner"
import { AccountTypeDialog } from "./account-type-dialog"

interface AccountFormProps {
    account?: GitAccount
    onSubmit: (account: GitAccount | AccountCreate) => void
    onCancel: () => void
}

export function AccountForm({ account, onSubmit, onCancel }: AccountFormProps) {
    const [formData, setFormData] = useState<Partial<GitAccount | AccountCreate>>({
        id: account?.id || 0,
        name: account?.name || "",
        user_name: account?.user_name || "",
        user_email: account?.user_email || "",
        account_type_id: account?.account_type_id || undefined,
        ssh_key_path: account?.ssh_key_path || "",
    })
    const [keyGenError, setKeyGenError] = useState<string | null>(null)
    const [accountTypes, setAccountTypes] = useState<AccountType[]>([])
    const [isLoadingAccountTypes, setIsLoadingAccountTypes] = useState(false)
    const [showCreateAccountType, setShowCreateAccountType] = useState(false)
    const [isCopied, setIsCopied] = useState(false)

    useEffect(() => {
        fetchAccountTypes()
    }, [])

    const fetchAccountTypes = async () => {
        setIsLoadingAccountTypes(true)
        try {
            const types = await api.accountTypes.list()
            setAccountTypes(types)

            // Set default account type if not already set
            if (!formData.account_type_id && types.length > 0) {
                setFormData(prev => ({
                    ...prev,
                    account_type_id: types.find(t => t.name === "personal")?.id || types[0].id
                }))
            }
        } catch (err) {
            console.error("Failed to fetch account types:", err)
            toast.error("Error loading account types", {
                description: err instanceof Error ? err.message : "An error occurred"
            })
        } finally {
            setIsLoadingAccountTypes(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    const handleAccountTypeChange = (value: string) => {
        // Special case for "new" to show the create dialog
        if (value === "new") {
            setShowCreateAccountType(true)
            return
        }

        setFormData({ ...formData, account_type_id: Number(value) })
    }

    const handleAccountTypeCreated = (newType: AccountType) => {
        setAccountTypes([...accountTypes, newType])
        if (newType.id) {
            setFormData({ ...formData, account_type_id: newType.id })
        }
    }

    const handleCopyToClipboard = () => {
        if (account?.public_key) {
            navigator.clipboard.writeText(account.public_key)
            setIsCopied(true)
            toast.success("Public key copied to clipboard")

            setTimeout(() => {
                setIsCopied(false)
            }, 2000)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(formData as GitAccount | AccountCreate)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor="name">Account Name</Label>
                    <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Work, Personal, etc."
                        required
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="user_name">Username</Label>
                    <Input
                        id="user_name"
                        name="user_name"
                        value={formData.user_name}
                        onChange={handleChange}
                        placeholder="Your Git username"
                        required
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="user_email">Email</Label>
                    <Input
                        id="user_email"
                        name="user_email"
                        type="email"
                        value={formData.user_email}
                        onChange={handleChange}
                        placeholder="your.email@example.com"
                        required
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="account_type">Account Type</Label>
                    <Select
                        value={formData.account_type_id ? formData.account_type_id.toString() : undefined}
                        onValueChange={handleAccountTypeChange}
                        disabled={isLoadingAccountTypes}
                    >
                        <SelectTrigger id="account_type" className="w-full">
                            <SelectValue placeholder={
                                isLoadingAccountTypes ? "Loading account types..." : "Select account type"
                            } />
                        </SelectTrigger>
                        <SelectContent>
                            {accountTypes.map((type) => (
                                <SelectItem key={type.id || `type-${type.name}`} value={type.id!.toString()}>
                                    {type.name}
                                </SelectItem>
                            ))}
                            <SelectItem value="new" className="text-primary flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                Add new type
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {account && (
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="ssh_key_path">SSH Key Path (Optional)</Label>
                            {account?.public_key && (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button type="button" variant="outline" size="sm">
                                            <Key className="mr-2 h-3 w-3" />
                                            View Public Key
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>SSH Public Key</DialogTitle>
                                            <DialogDescription>
                                                Add this public key to your Git provider.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="bg-muted p-3 rounded-md overflow-auto max-h-[200px]">
                                            <pre className="text-xs">{account.public_key}</pre>
                                        </div>
                                        <DialogFooter className="flex flex-col sm:flex-row gap-2">
                                            <Button
                                                onClick={handleCopyToClipboard}
                                                className="w-40 flex items-center gap-2"
                                            >
                                                {isCopied ? (
                                                    <>
                                                        <ClipboardCheck className="h-4 w-4" />
                                                        Copied!
                                                    </>
                                                ) : (
                                                    <>
                                                        <Clipboard className="h-4 w-4" />
                                                        Copy to Clipboard
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="flex items-center gap-2"
                                                onClick={() => window.open("https://github.com/settings/ssh/new", "_blank")}
                                            >
                                                <svg role="img" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                                                    <path d={siGithub.path} />
                                                </svg>
                                                Add SSH Key to GitHub
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                        <Input
                            id="ssh_key_path"
                            name="ssh_key_path"
                            value={formData.ssh_key_path || ""}
                            onChange={handleChange}
                            placeholder="~/.ssh/id_ed25519"
                        />
                        {keyGenError && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{keyGenError}</AlertDescription>
                            </Alert>
                        )}
                    </div>
                )}
            </div>

            <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit">{account ? "Update" : "Add"}</Button>
            </div>

            <AccountTypeDialog
                open={showCreateAccountType}
                onOpenChange={setShowCreateAccountType}
                onCreated={handleAccountTypeCreated}
            />
        </form>
    )
}
