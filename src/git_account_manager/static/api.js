async function handle_response(response) {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.detail || "An error occurred");
    }
    return data;
}

// Account API Functions
async function fetch_accounts() {
    const response = await fetch("/accounts");
    return handle_response(response);
}

async function create_account(account_data) {
    const response = await fetch("/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(account_data),
    });
    return handle_response(response);
}

async function delete_account(id) {
    const response = await fetch(`/accounts/${id}`, {
        method: "DELETE",
    });
    return handle_response(response);
}

async function sync_ssh_config() {
    const response = await fetch("/accounts/sync-ssh-config", {
        method: "POST",
    });
    return handle_response(response);
}

// Project API Functions
async function fetch_projects() {
    const response = await fetch("/projects");
    return handle_response(response);
}

async function create_project(project_data) {
    const response = await fetch("/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(project_data),
    });
    return handle_response(response);
}

async function delete_project(project_id) {
    const response = await fetch(`/projects/${project_id}`, {
        method: "DELETE",
    });
    return handle_response(response);
}

async function validate_project(project_id) {
    const response = await fetch(`/projects/validate/${project_id}`);
    return handle_response(response);
}

export const api = {
    accounts: {
        get_all: fetch_accounts,
        create: create_account,
        delete: delete_account,
        sync_ssh: sync_ssh_config,
    },
    projects: {
        get_all: fetch_projects,
        create: create_project,
        delete: delete_project,
        validate: validate_project,
    },
};
