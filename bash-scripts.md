# Bash & Scripts

> 👋Errors, improvements or other cool stuff? Let me know! 😀


### Real path of current file

```bash
__FILE__=$(realpath "${BASH_SOURCE[0]}")
```


### Directory of current file

```bash
__DIR__="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
```


### Is script being executed or sourced?

```bash
[ "${BASH_SOURCE}" == "$0" ] && echo "Executed" || echo "Sourced"
```

### Source a `.env` file

[Bash `set -a`](https://www.gnu.org/software/bash/manual/html_node/The-Set-Builtin.html)

Each variable or function that is created or modified is given the export attribute and marked for
export to the environment of subsequent commands.

```bash
set -a; source .env; set +a
```

### Positional and special arguments

See https://www.tldp.org/LDP/abs/html/internalvariables.html

| Expr    | Description                                                                               |
| ------- | ----------------------------------------------------------------------------------------- |
| $0      | Script name.                                                                              |
| $1, $2… | Positional parameter, passed from command line or to a function, or set to a variable.    |
| $#      | Number of positional parameters.                                                          |
| "$*"    | All of the positional parameters, seen as a single word. MUST be quoted.                  |
| "$@"    | Same as "$*" but each parameter is passed on intact, without interpretation or expansion. |
|         |                                                                                           |
| $?      | Most recent foreground pipeline exit status.                                              |
| $_      | The last argument of the previous command.                                                |
| $-      | Flags passed to script (using set).                                                       |
|         |                                                                                           |
| $$      | PID of the current shell (not subshell).                                                  |
| $!      | Is the PID of the most recent background command.                                         |
|         |                                                                                           |
| --      | Means the end of options; allowing positional arguments beginning with a dash.            |


### Abort script if command execution failed

```bash
set -e  # Exit if any command fails. Use `set +e` to turn it off.
[ $? != 0 ] && { echo -e "Command failed, abort."; exit $?; }
```


## Script arguments

### Easy check for a given argument

```bash
[[ "$*" =~ "--force" ]] && FORCE=true || FORCE=false
```


### Iterate/loop over arguments

```bash
for arg in "$@"; do echo $arg; done
```


### Shift arguments (i.e. remove the first one)

_Calling `script.sh a b c` outputs `Before: 3 a b c / After: 2 b c`._

```bash
echo -n "Before: $# $@"; shift; echo " / After: $# $@"
```  


### Iterate/loop over arguments, emptying them

_Calling `script.sh a b c` outputs `Before: 3 a b c / After: 0`._

```bash
echo -n "Before: $#"
while (( "$#" )); do echo -n " $1"; shift; done
echo " / After: $# $@"
```

**@TODO** `getopts`


### Modifying arguments

Basically you set all arguments to their current values, except for the one(s) you want to change.

```bash
set -- "${@:1:2}" "new" "${@:4}"
```


## User Input

### Ask the user for input

```bash
read -p "Username: " username_var
read -sp "Password: " password_var
```


### Ask a question and answer below (with a leading `>`)

```bash
echo -ne "Question?\n> "; read
```

```bash
# Ask user for input.
# Usage: `ask_input "<question>" ["<comment>" ["<default>" [blank]]]; myvar="$REPLY"`
# Options: If no `default` and must allow empty answers, use `"" blank`.
ask_input() {
  _read_input() {
    printf "\e[32m› "; read
    [ -z "$REPLY" ] && [ -n "$1" ] && { REPLY="$1"; echo -e "\e[1A\e[2C$REPLY"; }
    printf "\e[0m"
  }
  printf "\e[1;37m${1}\e[0m"; [ -n "$3" ] && printf " [\e[32m${3}\e[0m]"; echo
  [ -n "$2" ] && echo -e "\e[3m${2}\e[0m"
  if [ -n "$3" ] || [ "$4" = "blank" ]
    then _read_input "$3"
    else REPLY=; while [ -z "$REPLY" ]; do _read_input; done; fi
}
```


### With `-n 1`, return/submit automatically when a/one character is typed

As user's input is displayed, use an `echo` to go to a new line after read  
but only if the answer is not empty (empty means user pressed enter).

```bash
# Ask user to answer either yes or no.
# Usage: `ask_yesno "Do you want to do this?" [<default=y|n>]; [ $REPLY == "y" ] && echo "yes" || echo "no"`
ask_yesno() {
  REPLY=
  local offset=$(( ${#1} + 7 ))
  case "$2" in
    "y") values="\e[32mY/\e[0mn";;
    "n") values="y/\e[32mN\e[0m";;
    *) values="y/n";;
  esac
  printf "\e[1;37m${1}\e[0m (${values}) \e[32m"
  while [ -z "$REPLY" ]; do
    read -n 1
    if [[ "${REPLY,,}" =~ ^(y|n)$ ]]; then
      [ "${REPLY,,}" == "y" ] || REPLY="n"
      echo
    else if [ -z "$REPLY" ] && [ -n "$2" ]
      then REPLY="$2"; echo -e "\e[1A\e[${offset}C$REPLY"
      else [ -n "$REPLY" ] && echo; REPLY=; printf "\e[0my or n? \e[32m"; fi
    fi
  done
  printf "\e[0m"
}
```


### Loop on a question until it's valid

```bash
REPLY=
while [ -z "$REPLY" ]; do  # Here simply if not empty.
  read -p "Question: "
done
```


### Sudo keep-alive

_Source: https://gist.github.com/cowboy/3118588_

```bash
# Ask for the administrator password upfront.
sudo -v

# Sudo keep-alive: update existing sudo timestamp if set, otherwise do nothing.
while true; do sudo -n true; sleep 60; kill -0 "$$" || exit; done 2>/dev/null &
```
