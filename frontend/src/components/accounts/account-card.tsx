"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { GitAccount } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Edit, Key, Mail, Trash, User, Clipboard, ClipboardCheck } from "lucide-react"
import { siGithub } from "simple-icons/icons"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react"
import { toast } from "sonner"

interface AccountCardProps {
    account: GitAccount
    onEdit: () => void
    onDelete: () => void
}

export function AccountCard({ account, onEdit, onDelete }: AccountCardProps) {
    const [isCopied, setIsCopied] = useState(false)
    const [isCommandCopied, setIsCommandCopied] = useState(false)

    const handleCopyToClipboard = () => {
        if (account.public_key) {
            navigator.clipboard.writeText(account.public_key)
            setIsCopied(true)
            toast.success("Public key copied to clipboard")

            setTimeout(() => {
                setIsCopied(false)
            }, 2000)
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle>{account.name}</CardTitle>
                    <Badge className="capitalize">
                        {account.account_type?.name || "personal"}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <div className="flex items-center text-sm">
                        <User className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{account.user_name}</span>
                    </div>
                    <div className="flex items-center text-sm">
                        <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{account.user_email}</span>
                    </div>
                    {account.ssh_key_path && (
                        <div className="flex items-center text-sm">
                            <Key className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span className="truncate">{account.ssh_key_path}</span>
                        </div>
                    )}
                    {account.public_key && (
                        <div className="mt-2">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="w-full">
                                        <Key className="mr-2 h-4 w-4" />
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
                                    <div className="bg-muted rounded-md overflow-auto max-h-[200px]">
                                        <div className="p-3 min-w-full w-fit">
                                            <pre className="text-xs whitespace-pre">{account.public_key}</pre>
                                        </div>
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
                        </div>
                    )}
                    {account.ssh_key_filename && (
                        <div className="mt-2">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="w-full mb-2">
                                        <Key className="mr-2 h-4 w-4" />
                                        View SSH-Add Command
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>SSH Add Command</DialogTitle>
                                        <DialogDescription>
                                            Run this command to add your SSH key to the SSH agent.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="bg-muted rounded-md overflow-auto">
                                        <div className="p-3">
                                            <pre className="text-xs whitespace-pre">ssh-add ~/.ssh/{account.ssh_key_filename}</pre>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            onClick={() => {
                                                const command = `ssh-add ~/.ssh/${account.ssh_key_filename}`;
                                                navigator.clipboard.writeText(command);
                                                setIsCommandCopied(true);
                                                toast.success("Command copied to clipboard");

                                                setTimeout(() => {
                                                    setIsCommandCopied(false);
                                                }, 2000);
                                            }}
                                            className="w-40 flex items-center gap-2"
                                        >
                                            {isCommandCopied ? (
                                                <>
                                                    <ClipboardCheck className="h-4 w-4" />
                                                    Copied!
                                                </>
                                            ) : (
                                                <>
                                                    <Clipboard className="h-4 w-4" />
                                                    Copy Command
                                                </>
                                            )}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" onClick={onEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={onDelete}>
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                </Button>
            </CardFooter>
        </Card>
    )
}
