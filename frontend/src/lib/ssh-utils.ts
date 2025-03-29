"use server"

import { exec } from "child_process"
import { promisify } from "util"
import { promises as fs } from "fs"
import path from "path"
import os from "os"

const execAsync = promisify(exec)

interface GenerateKeyOptions {
  name: string
  email: string
  passphrase?: string
  keyType?: "rsa" | "ed25519"
  keySize?: number
}

export async function generateSSHKey(options: GenerateKeyOptions): Promise<{ keyPath: string; pubKeyPath: string }> {
  const { name, email, passphrase = "", keyType = "ed25519", keySize = 4096 } = options

  // Create a safe filename from name and email
  const safeFilename = `id_${keyType}_${name.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${email
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")}`

  // Determine the SSH directory
  const sshDir = path.join(os.homedir(), ".ssh")

  // Ensure the SSH directory exists
  try {
    await fs.mkdir(sshDir, { recursive: true })
  } catch (error) {
    throw new Error(`Failed to create SSH directory: ${error}`)
  }

  const keyPath = path.join(sshDir, safeFilename)
  const pubKeyPath = `${keyPath}.pub`

  // Generate the key
  const keyTypeArg = keyType === "rsa" ? `-t rsa -b ${keySize}` : "-t ed25519"
  const command = `ssh-keygen ${keyTypeArg} -C "${email}" -f "${keyPath}" -N "${passphrase}"`

  try {
    await execAsync(command)
    return { keyPath, pubKeyPath }
  } catch (error) {
    throw new Error(`Failed to generate SSH key: ${error}`)
  }
}

export async function getSSHPublicKey(pubKeyPath: string): Promise<string> {
  try {
    return await fs.readFile(pubKeyPath, "utf8")
  } catch (error) {
    throw new Error(`Failed to read SSH public key: ${error}`)
  }
}

export async function listSSHKeys(): Promise<string[]> {
  try {
    const sshDir = path.join(os.homedir(), ".ssh")
    const files = await fs.readdir(sshDir)
    return files.filter((file) => file.endsWith(".pub")).map((file) => path.join(sshDir, file))
  } catch (error) {
    console.error("Error listing SSH keys:", error)
    return []
  }
}
