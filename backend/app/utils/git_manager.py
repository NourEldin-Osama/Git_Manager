import subprocess
from pathlib import Path


class GitManager:
    @staticmethod
    def validate_git_repo(path: Path) -> bool:
        try:
            command = ["git", "rev-parse", "--is-inside-work-tree"]  # Check if inside a git repository
            subprocess.run(command, cwd=path, capture_output=True, check=True)
            return True
        except subprocess.CalledProcessError:
            return False

    @staticmethod
    def get_remote_url(path: Path) -> tuple[str, str] | None:
        try:
            urls = dict()
            command = ["git", "remote", "-v"]
            result = subprocess.run(command, cwd=path, capture_output=True, text=True, check=True)
            for line in result.stdout.splitlines():
                line = line.strip()
                remote_name = line.split()[0]
                url = line.split()[1]
                urls[url.strip()] = remote_name
            # If there are no URLs, return None
            if not urls:
                return None
            # Filter for GitHub URLs or SSH URLs
            github_urls = [
                (url, remote)
                for url, remote in urls.items()
                if url.startswith("https://github.com/") or url.startswith("git@")
            ]
            if github_urls:
                url, remote = github_urls[0]
                return url, remote
            # If there are no GitHub URLs or SSH URLs, return the first URL
            url, remote = next(iter(urls.items()))
            return url, remote
        except subprocess.CalledProcessError:
            return None

    @staticmethod
    def get_repo_path(url: str) -> str | None:
        """
        Extracts repository path from GitHub URL.

        Args:
            url: GitHub URL in HTTPS or SSH format

        Returns:
            Repository path in format "owner/repo" or None if invalid URL

        Examples:
            >>> GitManager.get_repo_path("https://github.com/owner/repo.git")
            'owner/repo'
            >>> GitManager.get_repo_path("git@github-username-personal:owner/repo.git")
            'owner/repo'
        """
        try:
            if url.startswith("https://github.com/"):
                # Handle HTTPS URLs
                repo_path = url.replace("https://github.com/", "")
            elif url.startswith("git@"):
                # Handle SSH URLs
                repo_path = url.split(":")[-1]
            else:
                return None

            # Remove .git suffix if present
            if repo_path.endswith(".git"):
                repo_path = repo_path[:-4]

            return repo_path
        except Exception:
            return None

    @staticmethod
    def validate_repo_path(repo_path: str) -> bool:
        """
        Validates repository path format.

        Args:
            repo_path: Repository path in format "owner/repo"

        Returns:
            True if valid, False otherwise

        Examples:
            >>> GitManager.validate_repo_path("owner/repo")
            True
            >>> GitManager.validate_repo_path("owner/repo.git")
            False
        """
        if not repo_path:
            return False
        # Check if repo_path is a valid string
        if not isinstance(repo_path, str):
            return False
        # Check if repo_path contains a slash
        if "/" not in repo_path:
            return False
        # Check if repo_path ends with .git
        if repo_path.endswith(".git"):
            return False
        # and does not contain any spaces
        if " " in repo_path:
            return False
        return True

    @staticmethod
    def validate_remote_url(remote_url: str) -> bool:
        """
        Validates remote URL format.

        Args:
            remote_url: Remote URL in format "git@github-username-personal:owner/repo.git" or
            "https://github.com/user/repo.git"
        """
        if not remote_url:
            return False
        # Check if remote_url is a valid string
        if not isinstance(remote_url, str):
            return False
        # Check if remote_url starts with
        if not (remote_url.startswith("git@") or remote_url.startswith("https://github.com/")):
            return False
        # Check if remote_url contains a slash
        if "/" not in remote_url:
            return False
        # Check if remote_url ends with .git
        if not remote_url.endswith(".git"):
            return False
        return True

    @staticmethod
    def add_remote(path: Path, remote_name: str, remote_url: str) -> bool:
        """
        Adds remote to git repository using provided URL directly.

        Examples:
        - From: https://github.com/user/repo.git
        - To: git@github-username-work:user/repo.git

        - From: git@github-username-work:user/repo.git
        - To: git@github-username-work:user/repo.git
        """
        try:
            # Use a list of arguments instead of splitting a string to preserve spaces in the URL
            command = ["git", "remote", "add", remote_name, remote_url]
            subprocess.run(command, cwd=path, check=True)
            return True
        except Exception as error:
            print("Error adding remote:", error)
            return False

    @staticmethod
    def remove_remote(path: Path, remote: str = "origin") -> bool:
        """
        Removes remote from git repository
        """
        try:
            command = ["git", "remote", "remove", remote]
            subprocess.run(command, cwd=path, check=True)
            return True
        except subprocess.CalledProcessError:
            return False

    @staticmethod
    def validate_ssh_connection(path: Path, host: str) -> bool:
        """
        Validates SSH connection to the host
        """
        try:
            command = ["ssh", "-T", host]
            result = subprocess.run(command, cwd=path, check=False, text=True, capture_output=True)
            # Check if the output contains "successfully authenticated"
            if "successfully authenticated" in result.stderr:
                return True
            return False
        except subprocess.CalledProcessError as error:
            print("SSH connection failed", "Error:", error)
            return False

    @staticmethod
    def set_git_config(path: Path, key: str, value: str) -> bool:
        """
        Sets git config value for the repository
        """
        try:
            command = ["git", "config", key, value]
            subprocess.run(command, cwd=path, check=True)
            return True
        except subprocess.CalledProcessError:
            return False

    @staticmethod
    def set_user_config(path: Path, name: str, email: str) -> bool:
        """
        Sets git user.name and user.email for the repository
        """
        try:
            name_set = GitManager.set_git_config(path, "user.name", name)
            email_set = GitManager.set_git_config(path, "user.email", email)
            return name_set and email_set
        except Exception:
            return False
