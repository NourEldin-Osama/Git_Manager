import { api } from "./api.js";
import { ui } from "./ui.js";

// Account Management Event Handlers
async function handle_git_account_creation(form_event) {
    form_event.preventDefault();
    try {
        ui.loading.show();
        const new_account_details = {
            name: document.getElementById("account_name").value,
            email: document.getElementById("account_email").value,
            account_type: document.getElementById("account_type").value,
        };

        await api.accounts.create(new_account_details);
        ui.notifications.show("Account created successfully");
        document.getElementById("account_form").reset();
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
    const copy_button = document.querySelector(
        `#key_${account_id}`,
    ).nextElementSibling;
    await ui.clipboard.copy(
        ssh_key,
        copy_button,
        "SSH key copied to clipboard",
    );
}

function handle_ssh_key_visibility(account_id, ssh_key) {
    const key_display_element = document.getElementById(`key_${account_id}`);
    const visibility_toggle_button =
        key_display_element.nextElementSibling.nextElementSibling;
    const is_key_hidden =
        key_display_element.textContent === "••••••••••••••••";

    if (is_key_hidden) {
        key_display_element.textContent = ssh_key;
        visibility_toggle_button.innerHTML = '<i class="bi bi-eye-slash"></i>';
    } else {
        key_display_element.textContent = "••••••••••••••••";
        visibility_toggle_button.innerHTML = '<i class="bi bi-eye"></i>';
    }
}

async function handle_ssh_command_copy(account_id) {
    const ssh_command = document
        .getElementById(`ssh_add_${account_id}`)
        .textContent.trim();
    const copy_button = document.getElementById(
        `ssh_add_${account_id}`,
    ).nextElementSibling;
    await ui.clipboard.copy(
        ssh_command,
        copy_button,
        "SSH-add command copied to clipboard",
    );
}

// Project Management Event Handlers
async function handle_project_creation(form_event) {
    form_event.preventDefault();
    try {
        ui.loading.show();
        const project_path = document.getElementById("project_path").value;
        const new_project_details = {
            path: project_path,
            account_id: parseInt(
                document.getElementById("account_select").value,
            ),
            name: project_path.split("/").pop(),
        };

        await api.projects.create(new_project_details);
        ui.notifications.show("Project configured successfully");
        document.getElementById("project_form").reset();
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
        document.getElementById("project_path").value = directory_handle.name;
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
window.addEventListener("DOMContentLoaded", () => {
    // Expose handlers to window for inline event handlers
    Object.assign(window, {
        handle_git_account_creation,
        handle_git_account_deletion,
        handle_ssh_configuration_sync,
        handle_ssh_key_copy,
        handle_ssh_key_visibility,
        handle_ssh_command_copy,
        handle_project_creation,
        handle_project_deletion,
        handle_project_validation,
        handle_directory_selection,
    });

    // Add form submit handlers
    document
        .getElementById("account_form")
        .addEventListener("submit", handle_git_account_creation);
    document
        .getElementById("project_form")
        .addEventListener("submit", handle_project_creation);

    // Load initial data
    refresh_git_accounts();
    refresh_managed_projects();
});
