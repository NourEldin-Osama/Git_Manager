"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { AccountType } from "@/lib/types"
import { api } from "@/lib/backend_config"
import { toast } from "sonner"
import { Edit, Plus, Trash } from "lucide-react"
import { AccountTypeDialog } from "./account-type-dialog"

interface AccountTypesDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AccountTypesDialog({ open, onOpenChange }: AccountTypesDialogProps) {
    const [accountTypes, setAccountTypes] = useState<AccountType[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [editingAccountType, setEditingAccountType] = useState<AccountType | null>(null)
    const [deletingAccountTypeId, setDeletingAccountTypeId] = useState<number | null>(null)
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)

    useEffect(() => {
        if (open) {
            fetchAccountTypes()
        }
    }, [open])

    const fetchAccountTypes = async () => {
        setIsLoading(true)
        try {
            const data = await api.accountTypes.list()
            setAccountTypes(data)
        } catch (err) {
            console.error("Failed to fetch account types:", err)
            toast.error("Error loading account types", {
                description: err instanceof Error ? err.message : "An error occurred"
            })
        } finally {
            setIsLoading(false)
        }
    }

    const confirmDelete = (id: number) => {
        setDeletingAccountTypeId(id)
        setIsDeleteConfirmOpen(true)
    }

    const handleDelete = async () => {
        if (!deletingAccountTypeId) return;

        try {
            await api.accountTypes.delete(deletingAccountTypeId)
            setAccountTypes(accountTypes.filter(type => type.id !== deletingAccountTypeId))
            toast.success("Account type deleted", {
                description: "The account type was successfully deleted."
            })
        } catch (err) {
            console.error("Failed to delete account type:", err)
            toast.error("Error deleting account type", {
                description: err instanceof Error ? err.message : "An error occurred"
            })
        } finally {
            setIsDeleteConfirmOpen(false)
            setDeletingAccountTypeId(null)
        }
    }

    const handleCreate = (accountType: AccountType) => {
        setAccountTypes([...accountTypes, accountType])
    }

    const handleUpdate = (updatedType: AccountType) => {
        setAccountTypes(accountTypes.map(type =>
            type.id === updatedType.id ? updatedType : type
        ))
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                        <DialogTitle>Account Types</DialogTitle>
                        <DialogDescription>
                            Manage your account type categories for organizing Git accounts.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex justify-end mb-4">
                        <Button
                            size="sm"
                            onClick={() => setShowCreateDialog(true)}
                            className="flex items-center gap-1"
                            variant="green"
                        >
                            <Plus className="h-4 w-4" />
                            Add Type
                        </Button>
                    </div>

                    {isLoading ? (
                        <div className="text-center py-4">Loading account types...</div>
                    ) : accountTypes.length === 0 ? (
                        <div className="text-center py-4 text-muted-foreground">
                            No account types found. Add your first type.
                        </div>
                    ) : (
                        <div className="max-h-[300px] overflow-y-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-full">Name</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {accountTypes.map((type) => (
                                        <TableRow key={type.id || `type-${type.name}`}>
                                            <TableCell className="font-medium capitalize">
                                                {type.name}
                                            </TableCell>
                                            <TableCell className="text-right space-x-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setEditingAccountType(type)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => type.id && confirmDelete(type.id)}
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            onClick={() => onOpenChange(false)}
                            variant="outline"
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AccountTypeDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
                onCreated={handleCreate}
            />

            {editingAccountType && (
                <AccountTypeDialog
                    accountType={editingAccountType}
                    open={!!editingAccountType}
                    onOpenChange={(open) => {
                        if (!open) setEditingAccountType(null)
                    }}
                    onUpdated={handleUpdate}
                />
            )}

            {/* Confirm Delete Dialog */}
            <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this account type. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
