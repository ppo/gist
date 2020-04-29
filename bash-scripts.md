# Bash & Scripts

> 👋Errors, improvements or other cool stuff? Let me know! 😀


**Real path of current file**
```bash
__FILE__=$(realpath "${BASH_SOURCE[0]}")
```

**Directory of current file**
```bash
__DIR__="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
```

**Is script being executed or sourced?**
```bash
[ "${BASH_SOURCE}" == "$0" ] && echo "Executed" || echo "Sourced"
```

**Positional and special parameters**  
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


**Abort script if command execution failed**
```bash
[ $? != 0 ] && { echo -e "Command failed, abort."; exit $?; }
```


### Parameters

**Iterate/loop over parameters**  
```bash
for arg in "$@"; do echo $arg; done
```

**Shift parameters (i.e. remove the first one)**  
_Calling `script.sh a b c` outputs `Before: 3 a b c / After: 2 b c`._

```bash
echo -n "Before: $# $@"; shift; echo " / After: $# $@"
```  

**Iterate/loop over parameters, emptying them**  
_Calling `script.sh a b c` outputs `Before: 3 a b c / After: 0`._

```bash
echo -n "Before: $#"
while (( "$#" )); do echo -n " $1"; shift; done
echo " / After: $# $@"
```

**@TODO** `getopts`


### User Input

**Ask the user for input**
```bash
read -p "Username: " username_var
read -sp "Password: " password_var
```

**Ask a question and answer below (with a leading `>`)**
```bash
echo -ne "Question?\n> "; read
```

**With `-n 1`, return/submit automatically when a/one character is typed**  
As user's input is displayed, use an `echo` to go to a new line after read  
but only if the answer is not empty (empty means user pressed enter).

```bash
ask_yesno() {
  REPLY=
  printf "$1 (y/n) "
  while [ -z "$REPLY" ]; do
    read -n 1
    [[ "${REPLY,,}" =~ ^(y|n)$ ]] \
      && { [ "${REPLY,,}" == "y" ] || REPLY="n"; } \
      || { [ -n "$REPLY" ] && echo; REPLY=; printf "y or n? "; }
  done
  echo
}

ask_yesno "Do you want to do this?"
[ $REPLY == "y" ] && echo "yes" || echo "no"
```

**Loop on a question until it's valid**
```bash
REPLY=
while [ -z "$REPLY" ]; do  # Here simply if not empty.
  read -p "Question: "
done
```
