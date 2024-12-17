#!/usr/bin/env python3
"""
Merge all source code files into a single text file. Or extract them.

Use case: Provide the codebase to an AI.

TODO
- Preserve file perms.
"""

import argparse
import fnmatch
import json
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path

DEBUG = True

DEFAULT_CODEBASE_FILE = "__codebase.txt"
INCLUDE_IGNORED = False
GIT_STAGED_FILES_CMD = "git diff --name-only --cached".split()
SPACER = "\n\n"
ENCODING = "utf-8"

# File headers format
FILE_HEADER = "=== {label}: {name} ==="
RE_FILE_HEADER = re.compile(r"^=== ([^:]+): (.*) ===$")

# Patterns to ignore (gitignore-like format)
IGNORE_PATTERNS = f"""
__pycache__/
.astro/
.GI/
.git/
.mypy_cache/
.venv/
.vercel/
.vscode/
cache/
log/
logs/
node_modules/
var/

{DEFAULT_CODEBASE_FILE}
.DS_Store
*.pyc
pnpm-lock.yaml
"""

SKIP_PATTERNS = """
.env
.envrc
# .tool-versions
"""

COLOR_RESET = "\033[00m"
COLOR_DEBUG = "\033[36m"
COLOR_ERROR = "\033[91m"

INFO_MESSAGES = {
    "FILE": {
        "prefix": "+",
        "color": "\033[92m",
    },
    "IGNORE": {
        "prefix": "-",
        "color": "\033[90m",
    },
    "SKIP": {
        "prefix": "~",
        "color": "\033[94m",
    },
    "UNKNOWN": {
        "prefix": "!",
        "color": COLOR_ERROR,
    },
}

NOW = datetime.now()


# INITIALIZATION ===================================================================================


def init_arg_parser():
    """Parse command line arguments."""
    arg_parser = argparse.ArgumentParser(description="Merge or extract codebase files")
    subparsers = arg_parser.add_subparsers(dest="command", required=True)

    # Merge command
    merge_parser = subparsers.add_parser("m", help="merge files into single codebase")
    merge_parser.add_argument(
        "-o",
        "--output",
        default=DEFAULT_CODEBASE_FILE,
        help=f"output file (default: {DEFAULT_CODEBASE_FILE})",
    )
    merge_parser.add_argument("--git", action="store_true", help="use git staged files as input")
    merge_parser.add_argument("inputs", nargs="*", help="input directories or files")

    # Extract command
    extract_parser = subparsers.add_parser("e", help="extract files from codebase")
    extract_parser.add_argument(
        "-o", "--output", default=".", help="output directory (default: current directory)"
    )
    extract_parser.add_argument(
        "input",
        nargs="?",
        default=DEFAULT_CODEBASE_FILE,
        help=f"input file (default: {DEFAULT_CODEBASE_FILE})",
    )

    return arg_parser


# COMMANDS =========================================================================================


class CodebaseMerge:
    """Merge all input files into a single codebase file."""

    def __init__(self, input_sources, output_file, use_git):
        self.input_sources = input_sources or []
        self.output_file_path = Path(output_file)  # Default set via `argparse`
        self.use_git = use_git

        if not self.input_sources and not self.use_git:
            self.input_sources = ["."]

        self.files_to_process = []
        self.root_path = Path().cwd()
        self.spacer = ""

        self.init_ignore()
        self.skip_patterns = parse_ignore_patterns(SKIP_PATTERNS)

        if self.use_git:
            self.register_git_staged_files()
        self.register_input_files()

    def run(self):
        with open(self.output_file_path, "w", encoding=ENCODING) as file:
            # Write merge header with timestamp and command
            timestamp = NOW.strftime("%Y-%m-%d %H:%M:%S%z")
            cmd = " ".join([Path(sys.argv[0]).name] + sys.argv[1:])
            file.write(f"# Codebase merged on {timestamp}\n")
            file.write(f"# Command: {cmd}\n")

            for path in self.files_to_process:
                if isinstance(path, str):
                    print_info("IGNORE", path)
                elif self.must_skip(path) or is_binary(path):
                    self.write_file(file, path, skip=True)
                else:
                    try:
                        self.write_file(file, path)
                    except Exception as error:
                        print_error(f"Merging {path}: {error}")

        print()
        print(f"Codebase merged into: {self.output_file_path}")

    def write_file(self, file, path, skip=False):
        # File header
        kind = "SKIP" if skip else "FILE"
        print_info(kind, path)
        header = FILE_HEADER.format(label=kind, name=path)
        file.write(f"{SPACER}{header}\n")

        # File content
        if not skip:
            with open(path, "r", encoding=ENCODING) as f:
                content = f.read().rstrip("\n")
                if content:
                    file.write(f"\n{content}\n")

    def init_ignore(self):
        """Initialize ignore patterns."""
        patterns = parse_ignore_patterns(IGNORE_PATTERNS)

        gitignore_path = self.root_path / ".gitignore"
        if gitignore_path.exists():
            with open(gitignore_path, "r", encoding=ENCODING) as f:
                patterns.extend([p for p in parse_ignore_patterns(f.read()) if p not in patterns])

        self.ignore_patterns = patterns

    def _patterns_check(self, patterns, path: Path, parent=None):
        """Check if path should be ignored based on patterns"""
        check_path = path.relative_to(parent) if parent else path
        path_str = self._path_str(check_path, is_dir=path.is_dir())
        return any(fnmatch.fnmatch(path_str, pattern) for pattern in patterns)

    def must_ignore(self, path: Path, parent=None):
        return self._patterns_check(self.ignore_patterns, path, parent=parent)

    def must_skip(self, path: Path, parent=None):
        return self._patterns_check(self.skip_patterns, path, parent=parent)

    def _path_str(self, path, is_dir=None):
        if is_dir is None:
            is_dir = path.is_dir()
        return str(path) + ("/" if is_dir else "")

    def register_ignored(self, path):
        self.files_to_process.append(self._path_str(path))
        # print_info("IGNORE", self._path_str(path))
        # self.files_to_process.append(FILE_HEADER.format(label=LABEL_IGNORE, name=path))

    def register_file(self, path: Path):
        if self.must_ignore(path):
            self.register_ignored(path)
        elif path not in self.files_to_process:
            # print_info("FILE", path)
            self.files_to_process.append(path)

    def register_input_files(self):
        fifo = [Path(d) for d in self.input_sources]
        while fifo:
            path = fifo.pop(0)
            if path.is_file():
                self.register_file(path)
            elif path.is_dir():
                if self.must_ignore(path, path.parent):
                    self.register_ignored(path)
                else:
                    fifo.extend(path.iterdir())
            else:
                print_info("UNKNOWN", path)

    def register_git_staged_files(self):
        """Register files staged in Git for processing."""
        try:
            result = subprocess.run(
                GIT_STAGED_FILES_CMD,
                capture_output=True,
                text=True,
                check=True,
            )
            for filename in result.stdout.splitlines():
                filename = filename.strip()
                if filename:
                    self.register_file(Path(filename))

        except subprocess.CalledProcessError:
            print_error("Failed to get Git staged files.")


class CodebaseExtract:
    """Extract files from a codebase file."""

    def __init__(self, input_file, output_dir):
        self.input_path = Path(input_file)
        self.output_path = Path(output_dir)

    def run(self):
        merge_header_found = False
        current_file = None
        current_content = []

        with open(self.input_path, "r", encoding=ENCODING) as file:
            for line in file:
                # Skip the merge header
                if not merge_header_found and line.startswith("#"):
                    continue
                merge_header_found = True

                # line = line.strip()
                file_header_match = RE_FILE_HEADER.match(line)
                if file_header_match:
                    # Save previous file if exists
                    if current_file and current_content:
                        self.create_file(current_file, current_content)

                    label, file_rel_path = file_header_match.groups()
                    current_file = file_rel_path if label == "FILE" else None
                    current_content = []
                elif current_file is not None:
                    current_content.append(line)

        # Save last file if exists
        if current_file and current_content:
            self.create_file(current_file, current_content)

        print()
        print(f"Codebase extracted into: {self.output_dir}")

    def create_file(self, file_rel_path, content):
        file_path = self.output_path / file_rel_path
        print_info("FILE", file_path)

        file_path.parent.mkdir(parents=True, exist_ok=True)

        # Remove spacer lines, 1 above and 2 below.
        if content[0].strip() == "":
            content.pop(0)
        for i in range(3):
            try:
                if content[-1].strip() == "":
                    content.pop()
            except:
                break

        with open(file_path, "w", encoding=ENCODING) as file:
            file.writelines(content)


# HELPERS ==========================================================================================


def debug(data, label=None):
    def _print(data):
        print(json.dumps(data, indent=2, ensure_ascii=False), end="")

    if DEBUG:
        print(f"{COLOR_DEBUG}￭ ", end="")
        if label:
            print(f"{label}: ", end="")
        try:
            if isinstance(data, (list, tuple)):
                data = [str(e) for e in data]
            _print(data)
        except TypeError:
            _print(str(data))
        print(COLOR_RESET)


def print_error(message):
    print(f"{COLOR_ERROR}ERROR: {message}{COLOR_RESET}", file=sys.stderr)


def print_info(kind, message):
    config = INFO_MESSAGES[kind]
    print(f"{config['color']}{config['prefix']} {message}{COLOR_RESET}")


def is_binary(path):
    """Check if file is binary by reading its first chunk"""
    try:
        with open(path, "r", encoding=ENCODING) as file:
            file.read(1024)
            return False
    except UnicodeDecodeError:
        return True


def parse_ignore_patterns(patterns_str):
    """Parse .gitignore-like string into list of patterns."""
    patterns = []
    for line in patterns_str.strip().splitlines():
        line = line.strip()
        if line.endswith("/"):
            line = line.rstrip("/") + "/"
        if line and not line.startswith("#"):
            patterns.append(line)

    return patterns


# MAIN =============================================================================================


def main():
    arg_parser = init_arg_parser()
    args = arg_parser.parse_args()

    match args.command:
        case "m":
            cmd = CodebaseMerge(args.inputs, args.output, args.git)
            cmd.run()
        case "e":
            cmd = CodebaseExtract(args.input, args.output)
            cmd.run()


if __name__ == "__main__":
    # main()
    try:
        main()
        sys.exit(0)
    except Exception as error:
        print_error(str(error))
        sys.exit(1)
