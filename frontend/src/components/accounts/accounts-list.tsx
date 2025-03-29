"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { GitAccount } from "@/lib/types"
import { AccountForm } from "./account-form"
import { AccountCard } from "./account-card"
import { Plus } from "lucide-react"

// Sample data - in a real app, this would come from a database
const initialAccounts: GitAccount[] = [
  {
    id: "1",
    name: "Work Account",
    username: "work-user",
    email: "work@example.com",
    authType: "ssh",
    sshKeyPath: "~/.ssh/id_rsa_work",
  },
  {
    id: "2",
    name: "Personal Account",
    username: "personal-user",
    email: "personal@example.com",
    authType: "ssh",
    sshKeyPath: "~/.ssh/id_rsa_personal",
  },
]

export function AccountsList() {
  const [accounts, setAccounts] = useState<GitAccount[]>(initialAccounts)
  const [isAddingAccount, setIsAddingAccount] = useState(false)
  const [editingAccount, setEditingAccount] = useState<GitAccount | null>(null)

  const handleAddAccount = (account: GitAccount) => {
    setAccounts([...accounts, { ...account, id: Date.now().toString() }])
    setIsAddingAccount(false)
  }

  const handleEditAccount = (account: GitAccount) => {
    setAccounts(accounts.map((a) => (a.id === account.id ? account : a)))
    setEditingAccount(null)
  }

  const handleDeleteAccount = (id: string) => {
    setAccounts(accounts.filter((account) => account.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Git Accounts</h2>
        <Button onClick={() => setIsAddingAccount(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Account
        </Button>
      </div>

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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            onEdit={() => setEditingAccount(account)}
            onDelete={() => handleDeleteAccount(account.id)}
          />
        ))}
      </div>
    </div>
  )
}
