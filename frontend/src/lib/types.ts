export interface AccountType {
    id?: number;
    name: string;
}

export interface AccountTypeCreate {
    name: string;
}

export interface AccountTypeUpdate {
    name: string;
}

export interface GitAccount {
    id: number;
    name: string;
    user_name: string;
    user_email: string;
    account_type_id: number;
    ssh_key_path?: string;
    public_key?: string;
    created_at: string;
    updated_at: string;
    account_type?: AccountType;
}

export interface AccountCreate {
    name: string;
    user_name: string;
    user_email: string;
    account_type_id: number;
    ssh_key_path?: string;
    public_key?: string;
    account_type_name?: string;
}

export interface GitProject {
    id: number;
    name: string;
    path: string;
    account_id: number | null;
    remote_url?: string;
    remote_name?: string;
    created_at: string;
    updated_at: string;
    configured: boolean;
}

export interface GitProjectWithAccount extends GitProject {
    account?: GitAccount;
}

export interface GitAccountWithProjects extends GitAccount {
    projects: GitProject[];
}
