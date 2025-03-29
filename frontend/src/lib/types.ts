export interface GitAccount {
  id: string
  name: string
  username: string
  email: string
  authType: "ssh" | "https"
  sshKeyPath?: string
  token?: string
}

export interface GitProject {
  id: string
  name: string
  path: string
  accountId: string
  lastUsed: string
}
