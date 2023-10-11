#!/usr/bin/env bash

# Current directory and file.
[ -z $( which realpath ) ] && realpath() { cd "$1" >/dev/null 2>&1 && pwd; }
__FILE__="${BASH_SOURCE[0]}"
__DIR__="$( realpath "$( dirname "$__FILE__" )" )"
BASE_DIR="$( realpath "${__DIR__}/.." )"

BASE_DIR="$( realpath "$( dirname "${BASH_SOURCE[0]}" )" )"


# Usage check.
if (( $# < 1 )); then
  echo "Usage: $( basename "$__FILE__" ) <param1> [<optional param2>]"
  exit 1
fi


# Must be sourced.
if [ "${BASH_SOURCE}" == "$0" ]; then
  echo -e "\e[1;31mThis file must be sourced, not executed.\e[0m"
  exit 1
fi


# Script args.
PARAM1=$1
PARAM2=$2


# Function args.
function my_function() {  # dir, [options]
  # $dir with trailing "/"!
  local dir="${1/%\//}/" options="$2"
}


# Keep admin privileges active.
sudo -v
while true; do sudo -n true; sleep 60; kill -0 "$$" || exit; done 2>/dev/null &


# Trap Ctrl+C
trap ctrl_c INT
function ctrl_c() {
  echo "Ctrl + C trapped."
}

# Force exiting the whole script; not just the current long running process,
# while still executing the next commands in the script.
trap exit SIGINT
