"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { GitProject } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Calendar, Edit, Folder, GitBranch, Trash } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface ProjectCardProps {
  project: GitProject
  onEdit: () => void
  onDelete: () => void
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  // In a real app, this would come from the database
  const accountName = project.accountId === "1" ? "Work Account" : "Personal Account"

  const handleSwitchAccount = () => {
    // In a real app, this would update the Git config for the project
    alert(`This would switch the Git account for ${project.name} in a real application.`)
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
          <div className="flex items-center text-sm">
            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Last used {formatDistanceToNow(new Date(project.lastUsed))} ago</span>
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
        <Button size="sm" onClick={handleSwitchAccount}>
          <GitBranch className="mr-2 h-4 w-4" />
          Switch Account
        </Button>
      </CardFooter>
    </Card>
  )
}
