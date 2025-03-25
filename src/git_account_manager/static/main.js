import { api } from "./api.js";
import { ui } from "./ui.js";

// Account Management Event Handlers
async function handle_git_account_creation(event) {
    event.preventDefault();
    try {
        ui.loading.show();
        const new_account_details = {
            name: $("#account_name").val(),
            email: $("#account_email").val(),
            account_type: $("#account_type").val(),
        };

        await api.accounts.create(new_account_details);
        ui.notifications.show("Account created successfully");
        $("#account_form")[0].reset();
        await refresh_git_accounts();
    } catch (error) {
        ui.notifications.show(error.message, "danger");
    } finally {
        ui.loading.hide();
    }
}

async function handle_git_account_deletion(account_id) {
    const user_confirmed = await ui.dialogs.confirm(
        "Are you sure you want to delete this account?",
    );
    if (!user_confirmed) return;

    try {
        ui.loading.show();
        await api.accounts.delete(account_id);
        ui.notifications.show("Account deleted successfully");
        await refresh_git_accounts();
    } catch (error) {
        ui.notifications.show(error.message, "danger");
    } finally {
        ui.loading.hide();
    }
}

async function handle_ssh_configuration_sync() {
    try {
        ui.loading.show();
        await api.accounts.sync_ssh();
        ui.notifications.show("SSH config synchronized successfully");
        await refresh_git_accounts();
    } catch (error) {
        ui.notifications.show(error.message, "danger");
    } finally {
        ui.loading.hide();
    }
}

async function handle_ssh_key_copy(account_id, ssh_key) {
    const $button = $(`#account_copy_key_${account_id}`);
    await ui.clipboard.copy(ssh_key, $button, "SSH key copied to clipboard");
}

function handle_ssh_key_visibility(account_id, ssh_key) {
    const $key_element = $(`#key_${account_id}`);
    const $toggle_button = $(`#account_toggle_key_${account_id}`);
    const is_key_hidden = $key_element.text() === "••••••••••••••••";

    if (is_key_hidden) {
        $key_element.text(ssh_key);
        $toggle_button.html('<i class="bi bi-eye-slash"></i>');
    } else {
        $key_element.text("••••••••••••••••");
        $toggle_button.html('<i class="bi bi-eye"></i>');
    }
}

async function handle_ssh_command_copy(account_id) {
    const ssh_command = $(`#ssh_add_${account_id}`).text().trim();
    const $button = $(`#account_copy_command_${account_id}`);
    await ui.clipboard.copy(
        ssh_command,
        $button,
        "SSH-add command copied to clipboard",
    );
}

// Project Management Event Handlers
async function handle_project_creation(event) {
    event.preventDefault();
    try {
        ui.loading.show();
        const new_project_details = {
            path: $("#project_path").val(),
            name: $("#project_name").val(),
            account_id: parseInt($("#account_select").val()),
            remote_url: $("#remote_url").val() || null,
            remote_name: $("#remote_name").val() || null,
        };

        await api.projects.create(new_project_details);
        ui.notifications.show("Project configured successfully");
        $("#project_form")[0].reset();
        await refresh_managed_projects();
    } catch (error) {
        ui.notifications.show(error.message, "danger");
    } finally {
        ui.loading.hide();
    }
}

async function handle_project_deletion(project_id) {
    const user_confirmed = await ui.dialogs.confirm(
        "Are you sure you want to delete this project?",
    );
    if (!user_confirmed) return;

    try {
        ui.loading.show();
        await api.projects.delete(project_id);
        ui.notifications.show("Project deleted successfully");
        await refresh_managed_projects();
    } catch (error) {
        ui.notifications.show(error.message, "danger");
    } finally {
        ui.loading.hide();
    }
}

async function handle_project_validation(project_id) {
    try {
        ui.loading.show();
        await api.projects.validate(project_id);
        ui.notifications.show("Project configuration is valid");
    } catch (error) {
        ui.notifications.show(error.message, "danger");
    } finally {
        ui.loading.hide();
    }
}

async function handle_directory_selection() {
    try {
        const directory_handle = await window.showDirectoryPicker();
        $("#project_path").val(directory_handle.name);
    } catch (error) {
        if (error.name !== "AbortError") {
            ui.notifications.show(
                "Failed to select directory: " + error.message,
                "danger",
            );
        }
    }
}

// Data Loading Functions
async function refresh_git_accounts() {
    try {
        ui.loading.show();
        const git_accounts = await api.accounts.get_all();
        ui.accounts.render(git_accounts);
    } catch (error) {
        ui.notifications.show(error.message, "danger");
    } finally {
        ui.loading.hide();
    }
}

async function refresh_managed_projects() {
    try {
        ui.loading.show();
        const managed_projects = await api.projects.get_all();
        ui.projects.render(managed_projects);
    } catch (error) {
        ui.notifications.show(error.message, "danger");
    } finally {
        ui.loading.hide();
    }
}

// Initialize Application
$(document).ready(() => {
    // Bind event handlers
    $("#account_form").on("submit", handle_git_account_creation);
    $("#project_form").on("submit", handle_project_creation);
    $("#sync_ssh_config_btn").on("click", handle_ssh_configuration_sync);
    $("#browse_directory_btn").on("click", handle_directory_selection);

    // Load initial data
    refresh_git_accounts();
    refresh_managed_projects();
});

// Export handlers for any remaining inline event handling
window.handle_git_account_deletion = handle_git_account_deletion;
window.handle_ssh_key_copy = handle_ssh_key_copy;
window.handle_ssh_key_visibility = handle_ssh_key_visibility;
window.handle_ssh_command_copy = handle_ssh_command_copy;
window.handle_project_validation = handle_project_validation;
window.handle_project_deletion = handle_project_deletion;
