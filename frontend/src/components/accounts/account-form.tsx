"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { GitAccount } from "@/lib/types"
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
import { Key, AlertCircle, Loader2 } from "lucide-react"

interface AccountFormProps {
  account?: GitAccount
  onSubmit: (account: GitAccount) => void
  onCancel: () => void
}

export function AccountForm({ account, onSubmit, onCancel }: AccountFormProps) {
  const [formData, setFormData] = useState<GitAccount>({
    id: account?.id || "",
    name: account?.name || "",
    username: account?.username || "",
    email: account?.email || "",
    authType: account?.authType || "ssh",
    sshKeyPath: account?.sshKeyPath || "",
    token: account?.token || "",
  })
  const [isGeneratingKey, setIsGeneratingKey] = useState(false)
  const [keyGenError, setKeyGenError] = useState<string | null>(null)
  const [generatedKey, setGeneratedKey] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleAuthTypeChange = (value: string) => {
    setFormData({ ...formData, authType: value as "ssh" | "https" })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleGenerateSSHKey = async () => {
    if (!formData.username || !formData.email) {
      setKeyGenError("Username and email are required to generate an SSH key")
      return
    }

    setIsGeneratingKey(true)
    setKeyGenError(null)

    try {
      const response = await fetch("/api/accounts/generate-ssh-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.username,
          email: formData.email,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate SSH key")
      }

      setFormData({
        ...formData,
        sshKeyPath: data.keyPath,
      })

      setGeneratedKey(data.publicKey)
    } catch (error) {
      setKeyGenError(error instanceof Error ? error.message : "Unknown error occurred")
    } finally {
      setIsGeneratingKey(false)
    }
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
          <Label htmlFor="username">Git Username</Label>
          <Input
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Your Git username"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">Git Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your.email@example.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Authentication Type</Label>
          <RadioGroup
            value={formData.authType}
            onValueChange={handleAuthTypeChange}
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="ssh" id="ssh" />
              <Label htmlFor="ssh">SSH Key</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="https" id="https" />
              <Label htmlFor="https">HTTPS (Token)</Label>
            </div>
          </RadioGroup>
        </div>

        {formData.authType === "ssh" ? (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="sshKeyPath">SSH Key Path</Label>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateSSHKey}
                    disabled={isGeneratingKey || !formData.username || !formData.email}
                  >
                    {isGeneratingKey ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Key className="mr-2 h-3 w-3" />
                        Generate New Key
                      </>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>SSH Key Generated</DialogTitle>
                    <DialogDescription>
                      Your new SSH key has been generated. Add this public key to your Git provider.
                    </DialogDescription>
                  </DialogHeader>
                  {generatedKey && (
                    <div className="bg-muted p-3 rounded-md overflow-auto max-h-[200px]">
                      <pre className="text-xs">{generatedKey}</pre>
                    </div>
                  )}
                  <DialogFooter>
                    <Button
                      onClick={() => {
                        if (generatedKey) {
                          navigator.clipboard.writeText(generatedKey)
                        }
                      }}
                    >
                      Copy to Clipboard
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <Input
              id="sshKeyPath"
              name="sshKeyPath"
              value={formData.sshKeyPath}
              onChange={handleChange}
              placeholder="~/.ssh/id_rsa"
            />
            {keyGenError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{keyGenError}</AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <div className="grid gap-2">
            <Label htmlFor="token">Personal Access Token</Label>
            <Input
              id="token"
              name="token"
              type="password"
              value={formData.token}
              onChange={handleChange}
              placeholder="ghp_xxxxxxxxxxxx"
            />
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{account ? "Update" : "Add"} Account</Button>
      </div>
    </form>
  )
}
