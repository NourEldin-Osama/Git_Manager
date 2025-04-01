"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { GitAccount, AccountCreate, AccountType } from "@/lib/types"
import { AccountForm } from "./account-form"
import { AccountCard } from "./account-card"
import { Plus, AlertCircle, RefreshCw } from "lucide-react"
import { api } from "@/lib/backend_config"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"
import { AccountTypesDialog } from "./account-types-dialog"
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

export function AccountsList() {
    const [accounts, setAccounts] = useState<GitAccount[]>([])
    const [isAddingAccount, setIsAddingAccount] = useState(false)
    const [editingAccount, setEditingAccount] = useState<GitAccount | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSyncing, setIsSyncing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showAccountTypesDialog, setShowAccountTypesDialog] = useState(false)
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
    const [accountToDelete, setAccountToDelete] = useState<GitAccount | null>(null)

    useEffect(() => {
        fetchAccounts()
    }, [])

    const fetchAccounts = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const data = await api.accounts.list()
            setAccounts(data)
        } catch (err) {
            console.error("Failed to fetch accounts:", err)
            setError("Failed to load accounts. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddAccount = async (account: AccountCreate) => {
        try {
            const createdAccount = await api.accounts.create(account)
            setAccounts([...accounts, createdAccount])
            setIsAddingAccount(false)
            toast.success("Account created", {
                description: `${account.name} was successfully created.`
            })
        } catch (err) {
            console.error("Failed to create account:", err)
            toast.error("Error creating account", {
                description: err instanceof Error ? err.message : "An error occurred"
            })
        }
    }

    const handleEditAccount = async (account: GitAccount | AccountCreate) => {
        if (!('id' in account)) {
            return; // Should never happen in edit mode
        }
        try {
            const updatedAccount = await api.accounts.update(account.id, account)
            setAccounts(accounts.map((a) => (a.id === account.id ? updatedAccount : a)))
            setEditingAccount(null)
            toast.success("Account updated", {
                description: `${account.name} was successfully updated.`
            })
        } catch (err) {
            console.error("Failed to update account:", err)
            toast.error("Error updating account", {
                description: err instanceof Error ? err.message : "An error occurred"
            })
        }
    }

    const confirmDeleteAccount = (account: GitAccount) => {
        setAccountToDelete(account)
        setDeleteConfirmOpen(true)
    }

    const handleDeleteAccount = async (id: number) => {
        try {
            await api.accounts.delete(id)
            setAccounts(accounts.filter((account) => account.id !== id))
            toast.success("Account deleted", {
                description: "The account was successfully deleted."
            })
        } catch (err) {
            console.error("Failed to delete account:", err)
            toast.error("Error deleting account", {
                description: err instanceof Error ? err.message : "An error occurred"
            })
        } finally {
            setDeleteConfirmOpen(false)
            setAccountToDelete(null)
        }
    }

    const handleSyncSSHConfig = async () => {
        setIsSyncing(true)
        try {
            const result = await api.accounts.syncSSHConfig()
            toast.success("SSH Config Synchronized", {
                description: `Successfully synced ${result.accounts.length} SSH configurations.`
            })
            fetchAccounts()
        } catch (err) {
            console.error("Failed to sync SSH config:", err)
            toast.error("Error syncing SSH config", {
                description: err instanceof Error ? err.message : "An error occurred"
            })
        } finally {
            setIsSyncing(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Git Accounts</h2>
                <div className="flex space-x-2">
                    <Button variant="outline" onClick={handleSyncSSHConfig} disabled={isSyncing}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
                        {isSyncing ? "Syncing..." : "Sync SSH Config"}
                    </Button>
                    <Button variant="outline" onClick={() => setShowAccountTypesDialog(true)}>
                        Manage Types
                    </Button>
                    <Button onClick={() => setIsAddingAccount(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Account
                    </Button>
                </div>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {isAddingAccount && (
                <Card>
                    <CardHeader>
                        <CardTitle>Add Git Account</CardTitle>
                        <CardDescription>Enter the details for your Git account</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AccountForm onSubmit={handleAddAccount} onCancel={() => setIsAddingAccount(false)} />
                    </CardContent>
                </Card>
            )}

            {editingAccount && (
                <Card>
                    <CardHeader>
                        <CardTitle>Edit Git Account</CardTitle>
                        <CardDescription>Update the details for your Git account</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AccountForm
                            account={editingAccount}
                            onSubmit={handleEditAccount}
                            onCancel={() => setEditingAccount(null)}
                        />
                    </CardContent>
                </Card>
            )}

            {isLoading ? (
                <div className="text-center py-8">Loading accounts...</div>
            ) : accounts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    No Git accounts found. Add your first account to get started.
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {accounts.map((account) => (
                        <AccountCard
                            key={account.id}
                            account={account}
                            onEdit={() => setEditingAccount(account)}
                            onDelete={() => confirmDeleteAccount(account)}
                        />
                    ))}
                </div>
            )}

            <AccountTypesDialog
                open={showAccountTypesDialog}
                onOpenChange={setShowAccountTypesDialog}
            />

            {/* Confirm Delete Dialog */}
            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the account "{accountToDelete?.name}".
                            All projects associated with this account will lose their account context.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => accountToDelete && handleDeleteAccount(accountToDelete.id)}
                            className="bg-destructive hover:bg-destructive/80 text-white focus:ring-destructive/20"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
