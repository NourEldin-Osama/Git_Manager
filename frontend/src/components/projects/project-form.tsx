"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { GitProject } from "@/lib/types"
import { Folder } from "lucide-react"

interface ProjectFormProps {
  project?: GitProject
  onSubmit: (project: GitProject) => void
  onCancel: () => void
}

export function ProjectForm({ project, onSubmit, onCancel }: ProjectFormProps) {
  const [formData, setFormData] = useState<GitProject>({
    id: project?.id || "",
    name: project?.name || "",
    path: project?.path || "",
    accountId: project?.accountId || "",
    lastUsed: project?.lastUsed || new Date().toISOString(),
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleAccountChange = (value: string) => {
    setFormData({ ...formData, accountId: value })
  }

  const handleBrowse = () => {
    // In a real app, this would open a file browser dialog
    alert("This would open a file browser in a real application.")
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
            <Button type="button" variant="outline" onClick={handleBrowse}>
              <Folder className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="account">Git Account</Label>
          <Select value={formData.accountId} onValueChange={handleAccountChange}>
            <SelectTrigger id="account">
              <SelectValue placeholder="Select an account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Work Account</SelectItem>
              <SelectItem value="2">Personal Account</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{project ? "Update" : "Add"} Project</Button>
      </div>
    </form>
  )
}
