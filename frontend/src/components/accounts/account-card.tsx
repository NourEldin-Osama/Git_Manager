"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { GitAccount } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Edit, Key, Mail, Trash, User } from "lucide-react"

interface AccountCardProps {
  account: GitAccount
  onEdit: () => void
  onDelete: () => void
}

export function AccountCard({ account, onEdit, onDelete }: AccountCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{account.name}</CardTitle>
          <Badge variant={account.authType === "ssh" ? "default" : "secondary"}>
            {account.authType === "ssh" ? "SSH" : "HTTPS"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <User className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>{account.username}</span>
          </div>
          <div className="flex items-center text-sm">
            <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>{account.email}</span>
          </div>
          {account.authType === "ssh" && account.sshKeyPath && (
            <div className="flex items-center text-sm">
              <Key className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="truncate">{account.sshKeyPath}</span>
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
