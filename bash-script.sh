#!/usr/bin/env bash

[ -z $( which realpath ) ] && realpath() { cd "$1" >/dev/null 2>&1 && pwd; }
__FILE__="${BASH_SOURCE[0]}"
__DIR__="$( realpath "$( dirname "$__FILE__" )" )"


if (( $# < 1 )); then
  echo "Usage: $( basename "$__FILE__" ) <param1> [<optional param2>]"
  exit 1
fi

PARAM1=$1
PARAM2=$2

BASE_DIR="$( realpath "${__DIR__}/.." )"
