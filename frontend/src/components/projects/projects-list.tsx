"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { GitProject } from "@/lib/types"
import { ProjectForm } from "./project-form"
import { ProjectCard } from "./project-card"
import { FolderSearch, Plus, AlertCircle } from "lucide-react"
import { api } from "@/lib/backend_config"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"
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

export function ProjectsList() {
    const [projects, setProjects] = useState<GitProject[]>([])
    const [isAddingProject, setIsAddingProject] = useState(false)
    const [editingProject, setEditingProject] = useState<GitProject | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
    const [projectToDelete, setProjectToDelete] = useState<GitProject | null>(null)

    useEffect(() => {
        fetchProjects()
    }, [])

    const fetchProjects = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const data = await api.projects.list()
            setProjects(data)
        } catch (err) {
            console.error("Failed to fetch projects:", err)
            setError("Failed to load projects. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddProject = async (project: Omit<GitProject, 'id' | 'created_at' | 'updated_at' | 'configured'>) => {
        try {
            const createdProject = await api.projects.create(project)
            setProjects([...projects, createdProject])
            setIsAddingProject(false)
            toast.success("Project added", {
                description: `${project.name} was successfully added.`
            })
        } catch (err) {
            console.error("Failed to add project:", err)
            toast.error("Error adding project", {
                description: err instanceof Error ? err.message : "An error occurred"
            })
        }
    }

    const handleEditProject = async (project: Omit<GitProject, 'id' | 'created_at' | 'updated_at' | 'configured'>) => {
        if (!editingProject) return;

        try {
            const updatedProject = await api.projects.update(editingProject.id, project)
            setProjects(projects.map((p) => (p.id === editingProject.id ? updatedProject : p)))
            setEditingProject(null)
            toast.success("Project updated", {
                description: `${project.name} was successfully updated.`
            })
        } catch (err) {
            console.error("Failed to update project:", err)
            toast.error("Error updating project", {
                description: err instanceof Error ? err.message : "An error occurred"
            })
        }
    }

    const confirmDeleteProject = (project: GitProject) => {
        setProjectToDelete(project)
        setDeleteConfirmOpen(true)
    }

    const handleDeleteProject = async (id: number) => {
        try {
            await api.projects.delete(id)
            setProjects(projects.filter((project) => project.id !== id))
            toast.success("Project deleted", {
                description: "The project was successfully deleted."
            })
        } catch (err) {
            console.error("Failed to delete project:", err)
            toast.error("Error deleting project", {
                description: err instanceof Error ? err.message : "An error occurred"
            })
        } finally {
            setDeleteConfirmOpen(false)
            setProjectToDelete(null)
        }
    }

    const validateProject = async (id: number) => {
        try {
            await api.projects.validate(id)
            toast.success("Project validated", {
                description: "The project configuration is valid."
            })
            return true
        } catch (err) {
            console.error("Project validation failed:", err)
            toast.error("Validation failed", {
                description: err instanceof Error ? err.message : "Project configuration is invalid"
            })
            return false
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Git Projects</h2>
                <div className="flex space-x-2">
                    <Button onClick={() => setIsAddingProject(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Project
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

            {isLoading ? (
                <div className="text-center py-8">Loading projects...</div>
            ) : projects.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    <FolderSearch className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-2">No Git projects found. Add your first project to get started.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {projects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            onEdit={() => setEditingProject(project)}
                            onDelete={() => confirmDeleteProject(project)}
                            onValidate={() => validateProject(project.id)}
                        />
                    ))}
                </div>
            )}

            {/* Confirm Delete Dialog */}
            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the project "{projectToDelete?.name}".
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => projectToDelete && handleDeleteProject(projectToDelete.id)}
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
