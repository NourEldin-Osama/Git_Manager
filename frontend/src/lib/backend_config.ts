import { AccountCreate, AccountType, GitAccount, GitAccountWithProjects, GitProject, GitProjectWithAccount } from "./types";

export const backend_api_url: string = process.env.NEXT_PUBLIC_FASTAPI_BACKEND_URL || "http://localhost:8000";

export const api = {
    utils: {
        health: async (): Promise<boolean> => {
            const response = await fetch(`${backend_api_url}/api/utils/health-check/`);
            if (!response.ok) {
                throw new Error('Failed to check system health');
            }
            return response.json();
        }
    },
    system: {
        check: async (): Promise<{
            git: boolean;
            ssh: boolean;
            details: {
                git_version: string | null;
                ssh_version: string | null;
                platform: string;
                python_version: string;
            }
        }> => {
            const response = await fetch(`${backend_api_url}/api/system/check-prerequisites`);
            if (!response.ok) {
                throw new Error('Failed to check system prerequisites');
            }
            return response.json();
        },
        openFolderDialog: async (): Promise<{ status: string; path?: string; message?: string }> => {
            const response = await fetch(`${backend_api_url}/api/system/folder-select`, {
                method: 'POST',
            });
            if (!response.ok) {
                throw new Error('Failed to open folder dialog');
            }
            return response.json();
        }
    },
    accountTypes: {
        create: async (name: string): Promise<AccountType> => {
            const response = await fetch(`${backend_api_url}/api/account-types`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name }),
            });
            if (!response.ok) {
                throw new Error('Failed to create account type');
            }
            return response.json();
        },
        list: async (): Promise<AccountType[]> => {
            const response = await fetch(`${backend_api_url}/api/account-types`);
            if (!response.ok) {
                throw new Error('Failed to fetch account types');
            }
            return response.json();
        },
        update: async (id: number, name: string): Promise<AccountType> => {
            const response = await fetch(`${backend_api_url}/api/account-types/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name }),
            });
            if (!response.ok) {
                throw new Error('Failed to update account type');
            }
            return response.json();
        },
        delete: async (id: number): Promise<{ message: string }> => {
            const response = await fetch(`${backend_api_url}/api/account-types/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete account type');
            }
            return response.json();
        }
    },
    accounts: {
        create: async (data: AccountCreate): Promise<GitAccount> => {
            const response = await fetch(`${backend_api_url}/api/accounts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error('Failed to create account');
            }
            return response.json();
        },
        list: async (): Promise<GitAccount[]> => {
            const response = await fetch(`${backend_api_url}/api/accounts`);
            if (!response.ok) {
                throw new Error('Failed to fetch accounts');
            }
            return response.json();
        },
        get: async (id: number): Promise<GitAccountWithProjects> => {
            const response = await fetch(`${backend_api_url}/api/accounts/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch account details');
            }
            return response.json();
        },
        update: async (id: number, data: Partial<GitAccount>): Promise<GitAccount> => {
            const response = await fetch(`${backend_api_url}/api/accounts/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error('Failed to update account');
            }
            return response.json();
        },
        delete: async (id: number): Promise<{ message: string }> => {
            const response = await fetch(`${backend_api_url}/api/accounts/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete account');
            }
            return response.json();
        },
        syncSSHConfig: async (): Promise<{ message: string, accounts: any[] }> => {
            const response = await fetch(`${backend_api_url}/api/accounts/sync-ssh-config`, {
                method: 'POST',
            });
            if (!response.ok) {
                throw new Error('Failed to sync SSH config');
            }
            return response.json();
        }
    },
    projects: {
        create: async (data: Omit<GitProject, 'id' | 'created_at' | 'updated_at' | 'configured'>): Promise<GitProject> => {
            const response = await fetch(`${backend_api_url}/api/projects`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error('Failed to create project');
            }
            return response.json();
        },
        list: async (): Promise<GitProject[]> => {
            const response = await fetch(`${backend_api_url}/api/projects`);
            if (!response.ok) {
                throw new Error('Failed to fetch projects');
            }
            return response.json();
        },
        get: async (id: number): Promise<GitProjectWithAccount> => {
            const response = await fetch(`${backend_api_url}/api/projects/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch project details');
            }
            return response.json();
        },
        update: async (id: number, data: Partial<GitProject>): Promise<GitProject> => {
            const response = await fetch(`${backend_api_url}/api/projects/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error('Failed to update project');
            }
            return response.json();
        },
        delete: async (id: number): Promise<{ message: string }> => {
            const response = await fetch(`${backend_api_url}/api/projects/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete project');
            }
            return response.json();
        },
        validate: async (id: number): Promise<{ message: string }> => {
            const response = await fetch(`${backend_api_url}/api/projects/validate/${id}`);
            if (!response.ok) {
                throw new Error('Failed to validate project');
            }
            return response.json();
        }
    },
}
