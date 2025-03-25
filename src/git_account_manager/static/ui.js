// UI State Management
function display_loading_overlay() {
    document.getElementById("loading_overlay").style.display = "flex";
}

function hide_loading_overlay() {
    document.getElementById("loading_overlay").style.display = "none";
}

// Notification System
function display_notification_toast(message, notification_type = "success") {
    const notification_container = document.querySelector(".toast_container");
    const notification = document.createElement("div");
    notification.className = `toast show bg-${notification_type} text-white`;
    notification.innerHTML = `
        <div class="toast-body d-flex justify-content-between align-items-center">
            ${message}
            <button type="button" class="btn-close btn-close-white" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
    `;
    notification_container.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
}

// Modal Dialog System
async function display_confirmation_dialog(confirmation_message) {
    return new Promise((resolve) => {
        const modal_instance = new bootstrap.Modal(
            document.getElementById("confirmation_modal"),
        );
        const confirm_button = document.getElementById(
            "confirmation_modal_confirm",
        );
        document.getElementById("confirmation_modal_body").textContent =
            confirmation_message;

        const handle_confirm_action = () => {
            modal_instance.hide();
            confirm_button.removeEventListener("click", handle_confirm_action);
            resolve(true);
        };

        const handle_modal_dismiss = () => {
            modal_instance.hide();
            confirm_button.removeEventListener("click", handle_confirm_action);
            resolve(false);
        };

        confirm_button.addEventListener("click", handle_confirm_action);
        modal_instance._element.addEventListener(
            "hidden.bs.modal",
            handle_modal_dismiss,
            {
                once: true,
            },
        );

        modal_instance.show();
    });
}

// Date Formatting
function format_timestamp_to_locale(utc_timestamp) {
    const date_object = new Date(utc_timestamp + "Z");

    const time_string = date_object.toLocaleString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });

    const date_string = date_object.toLocaleString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    return `${time_string}, ${date_string}`;
}

// Clipboard Operations
async function copy_text_to_clipboard(
    text_content,
    trigger_button,
    success_message,
) {
    try {
        await navigator.clipboard.writeText(text_content);
        const original_button_content = trigger_button.innerHTML;
        trigger_button.innerHTML = '<i class="bi bi-clipboard-check"></i>';
        setTimeout(() => {
            trigger_button.innerHTML = original_button_content;
        }, 1000);
        display_notification_toast(success_message);
    } catch (error) {
        display_notification_toast("Failed to copy to clipboard", "danger");
    }
}

// Account UI Components
function render_account_list(git_accounts) {
    const account_list_element = document.getElementById("accounts_list");
    const account_select_element = document.getElementById("account_select");

    account_list_element.innerHTML = '<h6 class="mb-3">Existing Accounts</h6>';
    account_select_element.innerHTML =
        '<option value="">Select an account</option>';

    git_accounts.forEach((account) => {
        render_single_account(
            account,
            account_list_element,
            account_select_element,
        );
    });
}

function render_single_account(account_data, list_container, select_element) {
    const masked_key = account_data.public_key
        ? "••••••••••••••••"
        : "No public key available";
    list_container.innerHTML += generate_account_card_html(
        account_data,
        masked_key,
    );
    select_element.innerHTML += `
        <option value="${account_data.id}">${account_data.name} (${account_data.account_type})</option>
    `;
}

function generate_account_card_html(account_data, masked_key) {
    return `
        <div class="account_card">
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <h6 class="mb-1">${account_data.name}</h6>
                    <span class="badge bg-${account_data.account_type === "work" ? "primary" : "success"}">
                        ${account_data.account_type}
                    </span>
                </div>
                <div>
                    <button onclick="handle_delete_account(${account_data.id})" class="btn btn-danger btn-sm">
                        Delete
                    </button>
                </div>
            </div>
            <p class="mb-1 mt-2">Email: ${account_data.email}</p>
            <small class="text-muted">Created: ${format_timestamp_to_locale(account_data.created_at)}</small>
            <div class="public_key mt-2">
                <div class="d-flex align-items-center gap-2 mb-2">
                    <span class="key_content" id="key_${account_data.id}">${masked_key}</span>
                    ${account_data.public_key ? generate_key_action_buttons_html(account_data) : ""}
                </div>
                ${account_data.public_key ? generate_ssh_key_section_html(account_data) : ""}
            </div>
        </div>
    `;
}

function generate_key_action_buttons_html(account_data) {
    return `
        <button class="btn btn-sm btn-outline-secondary"
                onclick="handle_copy_key('${account_data.id}', '${account_data.public_key.replace(/'/g, "\\'")}')">
            <i class="bi bi-clipboard"></i>
        </button>
        <button class="btn btn-sm btn-outline-secondary"
                onclick="handle_toggle_key('${account_data.id}', '${account_data.public_key.replace(/'/g, "\\'")}')">
            <i class="bi bi-eye"></i>
        </button>
    `;
}

function generate_ssh_key_section_html(account_data) {
    return `
        <div class="mt-3">
            <div class="mb-4">
                <a href="https://github.com/settings/ssh/new"
                   target="_blank"
                   class="btn btn-sm btn-outline-primary">
                    <i class="bi bi-github"></i> Add SSH Key to GitHub
                </a>
                <small class="text-muted d-block mt-2">
                    Click to open GitHub's SSH settings.
                </small>
                <small class="text-muted d-block mt-2">
                    Copy the key to add it to your account.
                </small>
            </div>

            <div class="mt-4 pt-3 border-top">
                <div class="d-flex align-items-center gap-2">
                    <code class="bg-light p-2 rounded flex-grow-1" id="ssh_add_${account_data.id}">
                        ssh-add "${account_data.ssh_key_path}"
                    </code>
                    <button class="btn btn-sm btn-outline-secondary"
                            onclick="handle_copy_ssh_command('${account_data.id}')">
                        <i class="bi bi-clipboard"></i>
                    </button>
                </div>
                <small class="text-muted d-block mt-2">
                    Run this command to add the SSH key to your SSH agent.
                </small>
            </div>
        </div>
    `;
}

// Project UI Components
function render_project_list(managed_projects) {
    const project_list_element = document.getElementById("projects_list");
    project_list_element.innerHTML =
        '<h6 class="mb-3">Configured Projects</h6>';

    managed_projects.forEach((project) => {
        render_single_project(project, project_list_element);
    });
}

function render_single_project(project_data, list_container) {
    list_container.innerHTML += `
        <div class="project_card">
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <h6 class="mb-1">${project_data.name}</h6>
                    <small class="text-muted">Path: ${project_data.path}</small>
                </div>
                <div>
                    <button onclick="handle_validate_project(${project_data.id})" class="btn btn-outline-primary btn-sm me-2">
                        Validate
                    </button>
                    <button onclick="handle_delete_project(${project_data.id})" class="btn btn-danger btn-sm">
                        Delete
                    </button>
                </div>
            </div>
            <div class="mt-2">
                <small class="text-muted">Created: ${format_timestamp_to_locale(project_data.created_at)}</small>
            </div>
        </div>
    `;
}

// Public UI Interface
export const ui = {
    loading: {
        show: display_loading_overlay,
        hide: hide_loading_overlay,
    },
    notifications: {
        show: display_notification_toast,
    },
    dialogs: {
        confirm: display_confirmation_dialog,
    },
    clipboard: {
        copy: copy_text_to_clipboard,
    },
    accounts: {
        render: render_account_list,
    },
    projects: {
        render: render_project_list,
    },
};
