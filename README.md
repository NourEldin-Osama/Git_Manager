# Git Account Manager

A web application to manage multiple Git accounts and configure local projects to use specific accounts, simplifying context switching between personal, work, or other Git identities.

## Features

* **Account Management:** Create and manage multiple Git accounts (e.g., personal, work).
* **SSH Key Generation:** Automatically generates ED25519 SSH keys for each account.
* **SSH Config Management:** Updates the `~/.ssh/config` file with appropriate host entries for seamless SSH authentication with different accounts.
* **SSH Config Sync:** Imports existing account configurations from `~/.ssh/config` into the application database.
* **Project-specific Git Configuration:** Configures local Git repositories to use a specific account by Setting the local `user.name` and `user.email`.
* **Git Repository Remote URL Management** Updating the remote URL (e.g., `origin`) to use the account-specific SSH host defined in `~/.ssh/config`.
* **Validation:** Validates project configuration and SSH connectivity for configured accounts.
* **Web Interface:** Provides a simple web UI built with FastAPI, Bootstrap, and jQuery for managing accounts and projects.
* **Database Storage:** Persists account and project data for easy retrieval and management.

## Setup and Installation

1. **Prerequisites:**
    * [uv](https://github.com/astral-sh/uv) (Extremely fast Python package and project manager)
    * Git installed and configured

2. **Installation:**

    ```bash
    uv pip install git-account-manager
    ```

## Running the Application

1. **Start the server:**

    ```bash
    # Start the FastAPI server
    uv run git-manager
    ```

2. **Access the UI:**
    Open your web browser and navigate to `http://127.0.0.1:8000`

## Usage

1. **Create Accounts:** Use the "Account Management" section to add new Git accounts (name, email, type). An SSH key pair and `~/.ssh/config` entry will be generated automatically. Copy the public key and add it to your Git provider (e.g., GitHub).
2. **Sync SSH Config:** Use the "Sync SSH Config" button to import accounts found in your `~/.ssh/config` file into the application's database.
3. **Configure Projects:** Use the "Project Management" section. Select a local project path (must be a Git repository), give it a name, and choose the account it should use. The application will update the Git config (`user.name`, `user.email`) and the remote URL for that project.
4. **Validate Projects:** Use the "Validate" button next to a configured project to check if the SSH connection works with the associated account.

## Features In Detail

### SSH Key Management

* Generates Ed25519 SSH keys for each account
* Automatically updates SSH config file
* Handles both personal and work account types

### Git Repository Configuration

* Validates Git repositories
* Manages remote URLs (HTTPS and SSH formats)
* Configures repository-specific user settings

## Project Structure

```bash
src/git_account_manager/  # Source code directory
├── __init__.py
├── database.py         # Database configuration and setup
├── dependencies.py     # FastAPI dependencies
├── git_manager.py      # Git operations handling
├── main.py             # FastAPI application entry point
├── models.py           # SQLModel database models
├── services.py         # Business logic implementation
├── ssh_manager.py      # SSH key and config management
├── routers/            # API routes
│   ├── __init__.py
│   ├── accounts.py     # Account management endpoints
│   └── projects.py     # Project management endpoints
└── static/             # Static files (HTML, CSS, JS)
```

## Technology Stack

* **Backend:** 🐍 Python, FastAPI, SQLModel, SQLite
* **Frontend:** HTML, CSS, JavaScript, Bootstrap 5, jQuery
* **Build/Package Management:** uv
* **Linting/Formatting:** Ruff
* **Git Hooks:** pre-commit

## Configuration

* **SSH Configuration:** Managed in `~/.ssh/config`. The application adds entries like `Host github-<name>-<type>`.
* **Database:** A SQLite database file named `git_accounts.db` is created in the user's home directory under `.git-account-manager`.
