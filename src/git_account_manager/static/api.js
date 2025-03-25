// HTTP Methods
const HTTP_METHODS = {
    GET: "GET",
    POST: "POST",
    DELETE: "DELETE",
};

// Content Types
const CONTENT_TYPES = {
    JSON: "application/json",
};

/**
 * Parses and validates API response, handling errors uniformly
 * @param {Response} response - Fetch API response object
 * @returns {Promise<any>} Parsed response data
 * @throws {Error} Custom error with detailed message
 */
async function parse_api_response(response) {
    const response_data = await response.json();
    if (!response.ok) {
        throw new Error(
            response_data.detail ||
                `API request failed with status ${response.status}: ${response.statusText}`,
        );
    }
    return response_data;
}

// Account API Functions
async function fetch_git_accounts() {
    const response = await fetch("/accounts");
    return parse_api_response(response);
}

async function create_git_account(new_account_details) {
    const response = await fetch("/accounts", {
        method: HTTP_METHODS.POST,
        headers: { "Content-Type": CONTENT_TYPES.JSON },
        body: JSON.stringify(new_account_details),
    });
    return parse_api_response(response);
}

async function delete_git_account(account_id) {
    const response = await fetch(`/accounts/${account_id}`, {
        method: HTTP_METHODS.DELETE,
    });
    return parse_api_response(response);
}

async function synchronize_ssh_configuration() {
    const response = await fetch("/accounts/sync-ssh-config", {
        method: HTTP_METHODS.POST,
    });
    return parse_api_response(response);
}

// Project API Functions
async function fetch_managed_projects() {
    const response = await fetch("/projects");
    return parse_api_response(response);
}

async function create_managed_project(new_project_details) {
    const response = await fetch("/projects", {
        method: HTTP_METHODS.POST,
        headers: { "Content-Type": CONTENT_TYPES.JSON },
        body: JSON.stringify(new_project_details),
    });
    return parse_api_response(response);
}

async function delete_managed_project(project_id) {
    const response = await fetch(`/projects/${project_id}`, {
        method: HTTP_METHODS.DELETE,
    });
    return parse_api_response(response);
}

async function validate_project_configuration(project_id) {
    const response = await fetch(`/projects/validate/${project_id}`);
    return parse_api_response(response);
}

export const api = {
    accounts: {
        get_all: fetch_git_accounts,
        create: create_git_account,
        delete: delete_git_account,
        sync_ssh: synchronize_ssh_configuration,
    },
    projects: {
        get_all: fetch_managed_projects,
        create: create_managed_project,
        delete: delete_managed_project,
        validate: validate_project_configuration,
    },
};
