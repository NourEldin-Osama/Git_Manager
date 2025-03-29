"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { GitProject } from "@/lib/types"
import { ProjectForm } from "./project-form"
import { ProjectCard } from "./project-card"
import { FolderSearch, Plus } from "lucide-react"

// Sample data - in a real app, this would come from a database
const initialProjects: GitProject[] = [
  {
    id: "1",
    name: "Frontend App",
    path: "/Users/developer/projects/frontend-app",
    accountId: "1",
    lastUsed: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Personal Blog",
    path: "/Users/developer/projects/personal-blog",
    accountId: "2",
    lastUsed: new Date(Date.now() - 86400000).toISOString(),
  },
]

export function ProjectsList() {
  const [projects, setProjects] = useState<GitProject[]>(initialProjects)
  const [isAddingProject, setIsAddingProject] = useState(false)
  const [editingProject, setEditingProject] = useState<GitProject | null>(null)

  const handleAddProject = (project: GitProject) => {
    setProjects([...projects, { ...project, id: Date.now().toString() }])
    setIsAddingProject(false)
  }

  const handleEditProject = (project: GitProject) => {
    setProjects(projects.map((p) => (p.id === project.id ? project : p)))
    setEditingProject(null)
  }

  const handleDeleteProject = (id: string) => {
    setProjects(projects.filter((project) => project.id !== id))
  }

  const handleScanForProjects = () => {
    // In a real app, this would scan the file system for Git projects
    alert("This would scan your system for Git projects in a real application.")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Git Projects</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleScanForProjects}>
            <FolderSearch className="mr-2 h-4 w-4" />
            Scan for Projects
          </Button>
          <Button onClick={() => setIsAddingProject(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Project
          </Button>
        </div>
      </div>

      {isAddingProject && (
        <Card>
          <CardHeader>
            <CardTitle>Add Git Project</CardTitle>
            <CardDescription>Configure a local Git project to use a specific account</CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectForm onSubmit={handleAddProject} onCancel={() => setIsAddingProject(false)} />
          </CardContent>
        </Card>
      )}

      {editingProject && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Git Project</CardTitle>
            <CardDescription>Update the configuration for your Git project</CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectForm
              project={editingProject}
              onSubmit={handleEditProject}
              onCancel={() => setEditingProject(null)}
            />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onEdit={() => setEditingProject(project)}
            onDelete={() => handleDeleteProject(project.id)}
          />
        ))}
      </div>
    </div>
  )
}
