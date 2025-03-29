"use server"

import { promises as fs } from "fs"
import path from "path"
import type { GitAccount } from "./types"

/**
 * Updates the Git configuration for a project to use a specific account
 */
export async function updateGitConfig(projectPath: string, account: GitAccount): Promise<boolean> {
  try {
    const gitConfigPath = path.join(projectPath, ".git", "config")

    // Check if .git directory exists
    try {
      await fs.access(path.join(projectPath, ".git"))
    } catch (error) {
      throw new Error("Not a valid Git repository")
    }

    // Read existing config
    let configContent: string
    try {
      configContent = await fs.readFile(gitConfigPath, "utf8")
    } catch (error) {
      throw new Error("Could not read Git config file")
    }

    // Update user section
    const userSectionRegex = /\[user\]([\s\S]*?)(?=\[|Z)/
    const userSection = `[user]\n\tname = ${account.username}\n\temail = ${account.email}\n\n`

    if (userSectionRegex.test(configContent)) {
      configContent = configContent.replace(userSectionRegex, userSection)
    } else {
      configContent += `\n${userSection}`
    }

    // Write updated config
    await fs.writeFile(gitConfigPath, configContent, "utf8")

    return true
  } catch (error) {
    console.error("Error updating Git config:", error)
    return false
  }
}

/**
 * Tests if a Git account can authenticate with the remote repository
 */
export async function testGitAccount(account: GitAccount): Promise<boolean> {
  // In a real app, this would test SSH or HTTPS authentication
  // For now, we'll just return true
  return true
}

/**
 * Scans a directory for Git repositories
 */
export async function scanForGitRepositories(baseDir: string): Promise<string[]> {
  const gitProjects: string[] = []

  async function scanDir(dir: string) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true })

      // Check if current directory is a Git repository
      if (entries.some((entry) => entry.isDirectory() && entry.name === ".git")) {
        gitProjects.push(dir)
        return // Don't scan subdirectories of Git repositories
      }

      // Scan subdirectories
      for (const entry of entries) {
        if (entry.isDirectory() && !entry.name.startsWith(".")) {
          await scanDir(path.join(dir, entry.name))
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dir}:`, error)
    }
  }

  await scanDir(baseDir)
  return gitProjects
}
