import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AccountsList } from "@/components/accounts/accounts-list"
import { ProjectsList } from "@/components/projects/projects-list"
import { DashboardHeader } from "@/components/dashboard-header"
import { AppInitializer } from "@/components/app-initializer"

export default function Home() {
  return (
    <AppInitializer>
      <main className="container mx-auto py-6 px-4 md:px-6">
        <DashboardHeader />

        <Tabs defaultValue="accounts" className="mt-6">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="accounts">Git Accounts</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
          </TabsList>
          <TabsContent value="accounts">
            <AccountsList />
          </TabsContent>
          <TabsContent value="projects">
            <ProjectsList />
          </TabsContent>
        </Tabs>
      </main>
    </AppInitializer>
  )
}
