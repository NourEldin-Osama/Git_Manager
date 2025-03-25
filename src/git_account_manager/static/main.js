import { api } from "./api.js";
import { ui } from "./ui.js";

// Account Management Event Handlers
async function handle_create_account(event) {
    event.preventDefault();
    try {
        ui.show_loading();
        const account_data = {
            name: document.getElementById("account_name").value,
            email: document.getElementById("account_email").value,
            account_type: document.getElementById("account_type").value,
        };

        await api.accounts.create(account_data);
        ui.show_toast("Account created successfully");
        document.getElementById("account_form").reset();
        await load_accounts();
    } catch (error) {
        ui.show_toast(error.message, "danger");
    } finally {
        ui.hide_loading();
    }
}

async function handle_delete_account(id) {
    const confirmed = await ui.show_confirm_dialog(
        "Are you sure you want to delete this account?",
    );
    if (!confirmed) return;

    try {
        ui.show_loading();
        await api.accounts.delete(id);
        ui.show_toast("Account deleted successfully");
        await load_accounts();
    } catch (error) {
        ui.show_toast(error.message, "danger");
    } finally {
        ui.hide_loading();
    }
}

async function handle_sync_ssh_config() {
    try {
        ui.show_loading();
        await api.accounts.sync_ssh();
        ui.show_toast("SSH config synchronized successfully");
        await load_accounts();
    } catch (error) {
        ui.show_toast(error.message, "danger");
    } finally {
        ui.hide_loading();
    }
}

async function handle_copy_key(id, key) {
    const button = document.querySelector(`#key_${id}`).nextElementSibling;
    await ui.copy_to_clipboard(key, button, "SSH key copied to clipboard");
}

function handle_toggle_key(id, key) {
    const key_element = document.getElementById(`key_${id}`);
    const button = key_element.nextElementSibling.nextElementSibling;
    const is_hidden = key_element.textContent === "••••••••••••••••";

    if (is_hidden) {
        key_element.textContent = key;
        button.innerHTML = '<i class="bi bi-eye-slash"></i>';
    } else {
        key_element.textContent = "••••••••••••••••";
        button.innerHTML = '<i class="bi bi-eye"></i>';
    }
}

async function handle_copy_ssh_command(id) {
    const command = document.getElementById(`ssh_add_${id}`).textContent.trim();
    const button = document.getElementById(`ssh_add_${id}`).nextElementSibling;
    await ui.copy_to_clipboard(
        command,
        button,
        "SSH-add command copied to clipboard",
    );
}

// Project Management Event Handlers
async function handle_create_project(event) {
    event.preventDefault();
    try {
        ui.show_loading();
        const project_data = {
            path: document.getElementById("project_path").value,
            account_id: parseInt(
                document.getElementById("account_select").value,
            ),
            name: document
                .getElementById("project_path")
                .value.split("/")
                .pop(),
        };

        await api.projects.create(project_data);
        ui.show_toast("Project configured successfully");
        document.getElementById("project_form").reset();
        await load_projects();
    } catch (error) {
        ui.show_toast(error.message, "danger");
    } finally {
        ui.hide_loading();
    }
}

async function handle_delete_project(project_id) {
    const confirmed = await ui.show_confirm_dialog(
        "Are you sure you want to delete this project?",
    );
    if (!confirmed) return;

    try {
        ui.show_loading();
        await api.projects.delete(project_id);
        ui.show_toast("Project deleted successfully");
        await load_projects();
    } catch (error) {
        ui.show_toast(error.message, "danger");
    } finally {
        ui.hide_loading();
    }
}

async function handle_validate_project(project_id) {
    try {
        ui.show_loading();
        await api.projects.validate(project_id);
        ui.show_toast("Project configuration is valid");
    } catch (error) {
        ui.show_toast(error.message, "danger");
    } finally {
        ui.hide_loading();
    }
}

async function handle_browse_directory() {
    try {
        const dir_handle = await window.showDirectoryPicker();
        document.getElementById("project_path").value = dir_handle.name;
    } catch (error) {
        if (error.name !== "AbortError") {
            ui.show_toast(
                "Failed to select directory: " + error.message,
                "danger",
            );
        }
    }
}

// Data Loading Functions
async function load_accounts() {
    try {
        ui.show_loading();
        const accounts = await api.accounts.get_all();
        ui.accounts.render(accounts);
    } catch (error) {
        ui.show_toast(error.message, "danger");
    } finally {
        ui.hide_loading();
    }
}

async function load_projects() {
    try {
        ui.show_loading();
        const projects = await api.projects.get_all();
        ui.projects.render(projects);
    } catch (error) {
        ui.show_toast(error.message, "danger");
    } finally {
        ui.hide_loading();
    }
}

// Initialize
window.addEventListener("DOMContentLoaded", () => {
    // Expose handlers to window for inline event handlers
    Object.assign(window, {
        handle_create_account,
        handle_delete_account,
        handle_sync_ssh_config,
        handle_copy_key,
        handle_toggle_key,
        handle_copy_ssh_command,
        handle_create_project,
        handle_delete_project,
        handle_validate_project,
        handle_browse_directory,
    });

    // Add form submit handlers
    document
        .getElementById("account_form")
        .addEventListener("submit", handle_create_account);
    document
        .getElementById("project_form")
        .addEventListener("submit", handle_create_project);

    // Load initial data
    load_accounts();
    load_projects();
});
