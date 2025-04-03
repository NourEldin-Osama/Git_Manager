"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import type { AccountType } from "@/lib/types"
import { api } from "@/lib/backend_config"
import { toast } from "sonner"

interface AccountTypeDialogProps {
    accountType?: AccountType
    onCreated?: (accountType: AccountType) => void
    onUpdated?: (accountType: AccountType) => void
    trigger?: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function AccountTypeDialog({
    accountType,
    onCreated,
    onUpdated,
    trigger,
    open,
    onOpenChange
}: AccountTypeDialogProps) {
    const [name, setName] = useState(accountType?.name || "")
    const [isLoading, setIsLoading] = useState(false)
    const [internalOpen, setInternalOpen] = useState(false)

    const isControlled = open !== undefined && onOpenChange !== undefined
    const isOpen = isControlled ? open : internalOpen
    const setIsOpen = isControlled ? onOpenChange : setInternalOpen

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!name.trim()) {
            toast.error("Please enter a name for the account type")
            return
        }

        setIsLoading(true)

        try {
            let result: AccountType

            if (accountType?.id) {
                result = await api.accountTypes.update(accountType.id, name)
                toast.success("Account type updated", {
                    description: `${name} was successfully updated.`
                })
                if (onUpdated) onUpdated(result)
            } else {
                result = await api.accountTypes.create(name)
                toast.success("Account type added", {
                    description: `${name} was successfully added.`
                })
                if (onCreated) onCreated(result)
            }

            setIsOpen(false)
        } catch (err) {
            console.error("Failed to save account type:", err)
            toast.error("Error saving account type", {
                description: err instanceof Error ? err.message : "An error occurred"
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{accountType ? "Edit" : "Add"} Account Type</DialogTitle>
                    <DialogDescription>
                        {accountType
                            ? "Update the name of this account type."
                            : "Add a new type to categorize your Git accounts."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="personal, work, open source, etc."
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            variant={accountType ? "blue" : "green"}
                        >
                            {isLoading ? "Saving..." : accountType ? "Save Changes" : "Add"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
