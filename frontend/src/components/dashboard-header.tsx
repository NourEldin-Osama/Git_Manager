import { GitBranch } from "lucide-react"

export function DashboardHeader() {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        <GitBranch className="h-6 w-6" />
        <h1 className="text-3xl font-bold tracking-tight">Git Account Manager</h1>
      </div>
      <p className="text-muted-foreground">
        Manage multiple Git accounts and configure projects to use specific accounts
      </p>
    </div>
  )
}
