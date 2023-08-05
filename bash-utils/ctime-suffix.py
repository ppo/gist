#!/usr/bin/env python3
"""
Append the birth time of each files as suffix to their filename.

Examples:
    foo                   -> foo.230805-190812
    foo.bar               -> foo.230805-190812.bar
    foo.123456.bar        -> foo.230805-190812.bar
    foo.123456-1234.bar   -> foo.230805-190812.bar
    foo.123456-123456.bar -> foo.230805-190812.bar
"""

import re
import sys
from datetime import datetime
from pathlib import Path


# Match existing suffix `.yymmdd[-HHMM[SS]]`.
RE_CLEAN = re.compile(r"\.[0-9]{6}(-[0-9]{4,6})?$")


def get_birth_time(file, format=None):
    """Return the file's birth datetime, or its string representation."""
    s = file.stat()
    t = datetime.fromtimestamp(s.st_birthtime)
    if format: t = t.strftime(format)
    return t


def main():
    for file in sys.argv[1:]:
        file = Path(file)
        bt = get_birth_time(file, format=r"%y%m%d-%H%M%S")
        stem = RE_CLEAN.sub("", file.stem)      # Remove existing suffix, if any.
        filename = f"{stem}.{bt}{file.suffix}"  # Insert birth time before extension.
        file.rename(filename)


if __name__ == "__main__":
    main()
