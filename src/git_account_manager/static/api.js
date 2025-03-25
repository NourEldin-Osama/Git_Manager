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
 * Makes an AJAX request and handles common response processing
 * @param {Object} options - jQuery AJAX options
 * @returns {Promise<any>} Parsed response data
 * @throws {Error} Custom error with detailed message
 */
async function make_api_request(options) {
    try {
        const response = await $.ajax(options);
        return response;
    } catch (error) {
        throw new Error(
            error.responseJSON?.detail ||
                `API request failed: ${error.statusText || "Unknown error"}`,
        );
    }
}

// Account API Functions
async function fetch_git_accounts() {
    return make_api_request({
        url: "/accounts",
        method: HTTP_METHODS.GET,
    });
}

async function create_git_account(new_account_details) {
    return make_api_request({
        url: "/accounts",
        method: HTTP_METHODS.POST,
        contentType: CONTENT_TYPES.JSON,
        data: JSON.stringify(new_account_details),
    });
}

async function delete_git_account(account_id) {
    return make_api_request({
        url: `/accounts/${account_id}`,
        method: HTTP_METHODS.DELETE,
    });
}

async function synchronize_ssh_configuration() {
    return make_api_request({
        url: "/accounts/sync-ssh-config",
        method: HTTP_METHODS.POST,
    });
}

// Project API Functions
async function fetch_managed_projects() {
    return make_api_request({
        url: "/projects",
        method: HTTP_METHODS.GET,
    });
}

async function create_managed_project(new_project_details) {
    return make_api_request({
        url: "/projects",
        method: HTTP_METHODS.POST,
        contentType: CONTENT_TYPES.JSON,
        data: JSON.stringify(new_project_details),
    });
}

async function delete_managed_project(project_id) {
    return make_api_request({
        url: `/projects/${project_id}`,
        method: HTTP_METHODS.DELETE,
    });
}

async function validate_project_configuration(project_id) {
    return make_api_request({
        url: `/projects/validate/${project_id}`,
        method: HTTP_METHODS.GET,
    });
}

// Public API Interface
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
