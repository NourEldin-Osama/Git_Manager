// UI Utility Functions
function show_loading() {
    document.getElementById('loading_overlay').style.display = 'flex';
}

function hide_loading() {
    document.getElementById('loading_overlay').style.display = 'none';
}

function show_toast(message, type = 'success') {
    const toast_container = document.querySelector('.toast_container');
    const toast = document.createElement('div');
    toast.className = `toast show bg-${type} text-white`;
    toast.innerHTML = `
        <div class="toast-body d-flex justify-content-between align-items-center">
            ${message}
            <button type="button" class="btn-close btn-close-white" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
    `;
    toast_container.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
}

async function show_confirm_dialog(message) {
    return new Promise((resolve) => {
        const modal = new bootstrap.Modal(document.getElementById('confirmation_modal'));
        const confirm_button = document.getElementById('confirmation_modal_confirm');
        document.getElementById('confirmation_modal_body').textContent = message;

        const handle_confirm = () => {
            modal.hide();
            confirm_button.removeEventListener('click', handle_confirm);
            resolve(true);
        };

        const handle_hide = () => {
            modal.hide();
            confirm_button.removeEventListener('click', handle_confirm);
            resolve(false);
        };

        confirm_button.addEventListener('click', handle_confirm);
        modal._element.addEventListener('hidden.bs.modal', handle_hide, { once: true });

        modal.show();
    });
}

function format_date_time(utc_date_string) {
    const date = new Date(utc_date_string + 'Z');

    const time = date.toLocaleString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    const date_str = date.toLocaleString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    return `${time}, ${date_str}`;
}

// Clipboard Functions
async function copy_to_clipboard(text, button_element, success_message) {
    try {
        await navigator.clipboard.writeText(text);
        const original_html = button_element.innerHTML;
        button_element.innerHTML = '<i class="bi bi-clipboard-check"></i>';
        setTimeout(() => {
            button_element.innerHTML = original_html;
        }, 1000);
        show_toast(success_message);
    } catch (error) {
        show_toast('Failed to copy to clipboard', 'danger');
    }
}

// Account UI Functions
function render_accounts(accounts) {
    const accounts_list = document.getElementById('accounts_list');
    const account_select = document.getElementById('account_select');

    accounts_list.innerHTML = '<h6 class="mb-3">Existing Accounts</h6>';
    account_select.innerHTML = '<option value="">Select an account</option>';

    accounts.forEach(account => {
        render_account(account, accounts_list, account_select);
    });
}

function render_account(account, accounts_list, account_select) {
    const hidden_key = account.public_key ? '••••••••••••••••' : 'No public key available';
    accounts_list.innerHTML += generate_account_html(account, hidden_key);
    account_select.innerHTML += `
        <option value="${account.id}">${account.name} (${account.account_type})</option>
    `;
}

function generate_account_html(account, hidden_key) {
    return `
        <div class="account_card">
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <h6 class="mb-1">${account.name}</h6>
                    <span class="badge bg-${account.account_type === 'work' ? 'primary' : 'success'}">
                        ${account.account_type}
                    </span>
                </div>
                <div>
                    <button onclick="handle_delete_account(${account.id})" class="btn btn-danger btn-sm">
                        Delete
                    </button>
                </div>
            </div>
            <p class="mb-1 mt-2">Email: ${account.email}</p>
            <small class="text-muted">Created: ${format_date_time(account.created_at)}</small>
            <div class="public_key mt-2">
                <div class="d-flex align-items-center gap-2 mb-2">
                    <span class="key_content" id="key_${account.id}">${hidden_key}</span>
                    ${account.public_key ? generate_key_buttons_html(account) : ''}
                </div>
                ${account.public_key ? generate_ssh_section_html(account) : ''}
            </div>
        </div>
    `;
}

function generate_key_buttons_html(account) {
    return `
        <button class="btn btn-sm btn-outline-secondary"
                onclick="handle_copy_key('${account.id}', '${account.public_key.replace(/'/g, "\\'")}')">
            <i class="bi bi-clipboard"></i>
        </button>
        <button class="btn btn-sm btn-outline-secondary"
                onclick="handle_toggle_key('${account.id}', '${account.public_key.replace(/'/g, "\\'")}')">
            <i class="bi bi-eye"></i>
        </button>
    `;
}

function generate_ssh_section_html(account) {
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
                    <code class="bg-light p-2 rounded flex-grow-1" id="ssh_add_${account.id}">
                        ssh-add "${account.ssh_key_path}"
                    </code>
                    <button class="btn btn-sm btn-outline-secondary"
                            onclick="handle_copy_ssh_command('${account.id}')">
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

// Project UI Functions
function render_projects(projects) {
    const projects_list = document.getElementById('projects_list');
    projects_list.innerHTML = '<h6 class="mb-3">Configured Projects</h6>';

    projects.forEach(project => {
        render_project(project, projects_list);
    });
}

function render_project(project, projects_list) {
    projects_list.innerHTML += `
        <div class="project_card">
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <h6 class="mb-1">${project.name}</h6>
                    <small class="text-muted">Path: ${project.path}</small>
                </div>
                <div>
                    <button onclick="handle_validate_project(${project.id})" class="btn btn-outline-primary btn-sm me-2">
                        Validate
                    </button>
                    <button onclick="handle_delete_project(${project.id})" class="btn btn-danger btn-sm">
                        Delete
                    </button>
                </div>
            </div>
            <div class="mt-2">
                <small class="text-muted">Created: ${format_date_time(project.created_at)}</small>
            </div>
        </div>
    `;
}

export const ui = {
    show_loading,
    hide_loading,
    show_toast,
    show_confirm_dialog,
    copy_to_clipboard,
    accounts: {
        render: render_accounts
    },
    projects: {
        render: render_projects
    }
};
