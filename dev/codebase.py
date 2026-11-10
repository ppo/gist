#!/usr/bin/env python
"""
Merge source files into a single text file (to give a codebase to an AI), or extract them back.

USAGE
    codebase.py [m] [-o OUTPUT] [--git] [INPUT ...]   merge (default command)
    codebase.py e [-o OUTPUT_DIR] [INPUT]              extract

    `m` is implied when the first argument isn't a command: `codebase.py`, `codebase.py src/`
    and `codebase.py --git` all merge. (For an input dir literally named `m` or `e`: `codebase.py m e`.)

MERGE
    INPUT       Files and/or directories, walked recursively. Default: `.` (unless `--git`).
    --git       Add the files staged in Git (`git diff --cached`). Can be combined with INPUTs.
    -o OUTPUT   Default: `__codebase.txt`.

    Every entry gets a status:
        +  FILE     listed, content included
        ~  SKIP     listed, content omitted: secrets (`.env`), lock files (SKIP_PATTERNS)
        *  BINARY   listed with size, content omitted
        >  LARGE    listed with size, content omitted: text file over MAX_FILE_SIZE (200 KB)
        -  IGNORE   console only: useless or personal (IGNORE_PATTERNS + the root `.gitignore`)
        !  UNKNOWN  console only: input not found (e.g. a staged deletion)

    Patterns are gitignore-like: without a `/` they match the name at any depth (`.env`),
    with one they match the path (`**/x` also matches at the root); a trailing `/` = dirs only.

    Entries are sorted as a depth-first tree: in each folder files first, then sub-folders;
    case-insensitive, natural number order (`_x` < `a` < `B`, `file2` < `file10`).

    Console summary: `Contents: 12 = 9+ 1~ 1* 1> | console only: 3- 1!` (zero counts hidden).

OUTPUT FORMAT
    # Created: 2026-01-31 12:00:00
    # Legend: + content below; content omitted: ~ secret/lock, * binary, > too large (over 200 KB)

    Contents: 12 = 9+ 1~ 1* 1>       (total = included + omitted, per status)
    + README.md
    ~ .env
    * assets/logo.png (12 KB)
    > data/dump.sql (3.4 MB)
    + src/main.py
    ...

    === FILE: README.md ===

    <content>

    Only `+` entries get a `=== FILE: <path> ===` section.

EXTRACT
    Recreate every `=== FILE: <path> ===` section of INPUT (default: `__codebase.txt`)
    under OUTPUT_DIR (default: `.`). Existing files are overwritten.

    Safety: a path that would land outside OUTPUT_DIR (absolute, `..`, via a symlink) is refused:
    reported when met and again at the end, exit code 1; the other files are still extracted.
    So merging inputs outside the current dir (`../lib`, `/abs/path`) gives files that can't be
    extracted back.

TODO
- Preserve file perms.
"""

import argparse
import fnmatch
import json
import re
import subprocess
import sys
from collections import Counter
from datetime import datetime
from pathlib import Path

DEBUG = True

COMMANDS = ("m", "e")
DEFAULT_COMMAND = "m"
DEFAULT_CODEBASE_FILE = "__codebase.txt"
GIT_STAGED_FILES_CMD = "git diff --name-only --cached".split()
SPACER = "\n\n"
ENCODING = "utf-8"

# File headers format
FILE_HEADER = "=== {label}: {name} ==="
RE_FILE_HEADER = re.compile(r"^=== ([^:]+): (.*) ===$")

MAX_FILE_SIZE = 200 * 1024  # Bigger text files are listed without content

LEGEND = (
    "Legend: + content below; content omitted: ~ secret/lock, * binary, "
    f"> too large (over {MAX_FILE_SIZE // 1024} KB)"
)

RE_DIGITS = re.compile(r"(\d+)")

# Patterns to ignore (gitignore-like format)
IGNORE_PATTERNS = f"""
{DEFAULT_CODEBASE_FILE}
*.GI/
*.GI.*

**/.DS_Store

.astro/
.git/
.vercel/

build/
cache/
dist/
log/
logs/
var/

node_modules/

**/__pycache__/
.coverage
.mypy_cache/
.pytest_cache/
.ruff_cache/
.venv/
htmlcov/
*.egg-info/
**/*.pyc
"""

# Patterns to list without content (secrets, lock files)
SKIP_PATTERNS = """
.env
.envrc
# .tool-versions

*.lock
package-lock.json
pnpm-lock.yaml
"""

COLOR_RESET = "\033[00m"
COLOR_DEBUG = "\033[36m"
COLOR_ERROR = "\033[91m"
COLOR_ALERT = "\033[1;97;41m"  # Bold white on red

INFO_MESSAGES = {
    "FILE": {
        "prefix": "+",
        "color": "\033[92m",
    },
    "SKIP": {
        "prefix": "~",
        "color": "\033[94m",
    },
    "BINARY": {
        "prefix": "*",
        "color": "\033[95m",
    },
    "LARGE": {
        "prefix": ">",
        "color": "\033[93m",
    },
    "IGNORE": {
        "prefix": "-",
        "color": "\033[90m",
    },
    "UNKNOWN": {
        "prefix": "!",
        "color": COLOR_ERROR,
    },
}
LISTED_KINDS = ("FILE", "SKIP", "BINARY", "LARGE")  # In the output file's contents list
CONSOLE_ONLY_KINDS = ("IGNORE", "UNKNOWN")
SIZED_KINDS = ("BINARY", "LARGE")  # Listed with their size

NOW = datetime.now()


# INITIALIZATION ===================================================================================

def init_arg_parser():
    """Parse command line arguments."""
    arg_parser = argparse.ArgumentParser(
        description="Merge or extract codebase files (default command: m)"
    )
    subparsers = arg_parser.add_subparsers(dest="command", required=True)

    # Merge command
    merge_parser = subparsers.add_parser("m", help="merge files into single codebase (default)")
    merge_parser.add_argument(
        "-o",
        "--output",
        default=DEFAULT_CODEBASE_FILE,
        help=f"output file (default: {DEFAULT_CODEBASE_FILE})",
    )
    merge_parser.add_argument("--git", action="store_true", help="add git staged files as input")
    merge_parser.add_argument("inputs", nargs="*", help="input directories or files (default: .)")

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


def normalize_argv(argv):
    """Insert the default command when the first argument isn't a command (or help)."""
    if not argv or argv[0] not in (*COMMANDS, "-h", "--help"):
        return [DEFAULT_COMMAND, *argv]
    return argv


# COMMANDS =========================================================================================

class CodebaseMerge:
    """Merge all input files into a single codebase file."""

    def __init__(self, input_sources, output_file, use_git):
        self.input_sources = input_sources or []
        self.output_file_path = Path(output_file)  # Default set via `argparse`
        self.use_git = use_git

        if not self.input_sources and not self.use_git:
            self.input_sources = ["."]

        self.entries = []  # [(kind, path)], kind in LISTED_KINDS + CONSOLE_ONLY_KINDS
        self.registered = set()
        self.root_path = Path().cwd()

        self.init_ignore()
        self.skip_patterns = parse_ignore_patterns(SKIP_PATTERNS)

        if self.use_git:
            self.register_git_staged_files()
        self.register_input_files()
        self.entries.sort(key=lambda entry: tree_sort_key(entry[1]))

    def run(self):
        listed = [(kind, path) for kind, path in self.entries if kind in LISTED_KINDS]

        with open(self.output_file_path, "w", encoding=ENCODING) as file:
            timestamp = NOW.strftime("%Y-%m-%d %H:%M:%S")
            file.write(f"# Created: {timestamp}\n")
            file.write(f"# {LEGEND}\n")
            file.write("\n")

            # Table of contents: included + omitted entries, with their status
            file.write(f"{self.contents_summary()}\n")
            for kind, path in listed:
                file.write(f"{INFO_MESSAGES[kind]['prefix']} {entry_str(kind, path)}\n")

            # Console: every entry. File: content of the included files only.
            for kind, path in self.entries:
                print_info(kind, entry_str(kind, path))
                if kind == "FILE":
                    try:
                        self.write_file(file, path)
                    except Exception as error:
                        print_error(f"Merging {path}: {error}")

        print()
        print(self.contents_summary(console=True))
        print(f"Codebase merged into: {self.output_file_path}")

    def contents_summary(self, console=False):
        """E.g. `Contents: 12 = 11+ 1~`; on console: `… | console only: 3- 1!` (colored)."""
        counts = Counter(kind for kind, _ in self.entries)

        def details(kinds):
            tokens = []
            for kind in kinds:
                if counts[kind]:
                    token = f"{counts[kind]}{INFO_MESSAGES[kind]['prefix']}"
                    if console:
                        token = f"{INFO_MESSAGES[kind]['color']}{token}{COLOR_RESET}"
                    tokens.append(token)
            return " ".join(tokens)

        total = sum(counts[kind] for kind in LISTED_KINDS)
        summary = f"Contents: {total}"
        if total:
            summary += f" = {details(LISTED_KINDS)}"
        if console and (not_listed := details(CONSOLE_ONLY_KINDS)):
            summary += f" | console only: {not_listed}"
        return summary

    def write_file(self, file, path):
        with open(path, "r", encoding=ENCODING) as f:
            content = f.read().rstrip("\n")

        header = FILE_HEADER.format(label="FILE", name=path)
        file.write(f"{SPACER}{header}\n")
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

    def must_ignore(self, path: Path):
        return matches_patterns(self.ignore_patterns, path)

    def must_skip(self, path: Path):
        return matches_patterns(self.skip_patterns, path)

    def register(self, kind, path: Path):
        if path not in self.registered:
            self.registered.add(path)
            self.entries.append((kind, path))

    def register_file(self, path: Path):
        if not path.is_file():
            self.register("UNKNOWN", path)  # E.g. a staged deletion
        elif self.must_ignore(path):
            self.register("IGNORE", path)
        elif self.must_skip(path):
            self.register("SKIP", path)
        elif is_binary(path):
            self.register("BINARY", path)
        elif path.stat().st_size > MAX_FILE_SIZE:
            self.register("LARGE", path)
        else:
            self.register("FILE", path)

    def register_input_files(self):
        """Walk the inputs. Order doesn't matter: entries are sorted afterwards."""
        stack = [Path(source) for source in self.input_sources]
        while stack:
            path = stack.pop()
            if path.is_file():
                self.register_file(path)
            elif path.is_dir():
                if self.must_ignore(path):
                    self.register("IGNORE", path)
                else:
                    stack.extend(path.iterdir())
            else:
                self.register("UNKNOWN", path)

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
        self.base_path = self.output_path.resolve()
        self.failures = []  # [(path, reason)]

    def run(self):
        """Return `False` if some files couldn't be extracted."""
        current_file = None
        current_content = []

        # Everything before the first file header (merge header, contents list) is ignored.
        with open(self.input_path, "r", encoding=ENCODING) as file:
            for line in file:
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
        print(f"Codebase extracted into: {self.output_path}")
        self.report_failures()
        return not self.failures

    def fail(self, file_rel_path, reason):
        """Report LOUDLY right away; `report_failures()` repeats it at the end."""
        self.failures.append((file_rel_path, reason))
        print_alert(f"NOT EXTRACTED: {file_rel_path!r} ({reason})")

    def report_failures(self):
        if self.failures:
            sys.stdout.flush()
            print(file=sys.stderr)
            print_alert(f"{len(self.failures)} FILE(S) NOT EXTRACTED:")
            for file_rel_path, reason in self.failures:
                print(f"{COLOR_ERROR}! {file_rel_path!r} ({reason}){COLOR_RESET}", file=sys.stderr)

    def target_path(self, file_rel_path):
        """Path to write to, or `None` if it would land outside the output dir."""
        rel_path = Path(file_rel_path)
        if rel_path.is_absolute() or ".." in rel_path.parts:
            return None
        # `resolve()` follows symlinks: one in the output dir mustn't lead outside either.
        file_path = (self.base_path / rel_path).resolve()
        if file_path == self.base_path or not file_path.is_relative_to(self.base_path):
            return None
        return file_path

    def create_file(self, file_rel_path, content):
        file_path = self.target_path(file_rel_path)
        if file_path is None:
            self.fail(file_rel_path, "outside the output dir")
            return

        print_info("FILE", self.output_path / file_rel_path)
        try:
            self.write_file(file_path, content)
        except OSError as error:
            self.fail(file_rel_path, error.strerror or str(error))

    def write_file(self, file_path, content):
        file_path.parent.mkdir(parents=True, exist_ok=True)

        # Remove spacer lines, 1 above and 2 below.
        if content[0].strip() == "":
            content.pop(0)
        for i in range(3):
            try:
                if content[-1].strip() == "":
                    content.pop()
            except IndexError:
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
    sys.stdout.flush()  # Keep stdout/stderr in order when piped
    print(f"{COLOR_ERROR}ERROR: {message}{COLOR_RESET}", file=sys.stderr)


def print_alert(message):
    sys.stdout.flush()  # Keep stdout/stderr in order when piped
    print(f"{COLOR_ALERT} {message} {COLOR_RESET}", file=sys.stderr)


def print_info(kind, message):
    config = INFO_MESSAGES[kind]
    print(f"{config['color']}{config['prefix']} {message}{COLOR_RESET}")


def path_str(path: Path):
    """Path as displayed: dirs get a trailing `/`."""
    return str(path) + ("/" if path.is_dir() else "")


def entry_str(kind, path: Path):
    """Entry as displayed: binary and too large files get their size, e.g. `logo.png (12 KB)`."""
    if kind in SIZED_KINDS:
        return f"{path_str(path)} ({human_size(path.stat().st_size)})"
    return path_str(path)


def human_size(size):
    """E.g. `512 B`, `1.5 KB`, `12 KB`, `3.4 MB` (1 decimal below 10, base 1024)."""
    for unit in ("B", "KB", "MB", "GB"):
        if round(size, 1) < 1024 or unit == "GB":  # Avoid `1024 KB`
            break
        size /= 1024
    return f"{size:.0f} {unit}" if unit == "B" or size >= 10 else f"{size:.1f} {unit}"


def is_binary(path):
    """Check if file is binary by reading its first chunk"""
    try:
        with open(path, "r", encoding=ENCODING) as file:
            file.read(1024)
            return False
    except UnicodeDecodeError:
        return True


def natural_key(name: str):
    """Case-insensitive, numbers compared by value (`file2` < `file10`).

    `re.split` with a capture group alternates text (even indexes) and numbers (odd indexes),
    so two keys never compare a `str` with an `int`. The raw name breaks ties (`A` vs `a`).
    """
    parts = RE_DIGITS.split(name.casefold())
    return [int(part) if i % 2 else part for i, part in enumerate(parts)], name


def tree_sort_key(path: Path):
    """Depth-first tree order: in each folder, files first, then sub-folders."""
    *parents, name = path.parts or ("",)
    return (
        *((1, natural_key(parent)) for parent in parents),
        (1 if path.is_dir() else 0, natural_key(name)),
    )


def matches_patterns(patterns, path: Path):
    """Check a path against gitignore-like patterns.

    - No `/` (besides a trailing one): match the name, at any depth (`.env`, `build/`).
    - Otherwise: match the whole path; a leading `**/` also matches at the root.
    - Trailing `/`: dirs only (the checked strings of dirs end with `/`).
    """
    suffix = "/" if path.is_dir() else ""
    name, full = path.name + suffix, str(path) + suffix
    for pattern in patterns:
        if "/" not in pattern.rstrip("/"):
            if fnmatch.fnmatch(name, pattern):
                return True
        elif fnmatch.fnmatch(full, pattern.removeprefix("/")) or (
            pattern.startswith("**/") and fnmatch.fnmatch(full, pattern[3:])
        ):
            return True
    return False


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
    args = arg_parser.parse_args(normalize_argv(sys.argv[1:]))

    match args.command:
        case "m":
            cmd = CodebaseMerge(args.inputs, args.output, args.git)
            cmd.run()
        case "e":
            cmd = CodebaseExtract(args.input, args.output)
            return cmd.run()
    return True


if __name__ == "__main__":
    try:
        sys.exit(0 if main() else 1)
    except Exception as error:
        print_error(str(error))
        sys.exit(1)
