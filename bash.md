# Bash

> 👋 Errors, improvements or other cool stuff? Let me know! 😀


### Change folder

```bash
mkdir -p foo/bar && cd "$_"  # Create and go to folder.
cd - &>/dev/null             # Return to previous folder.
```


### Ternary operator

```bash
[ condition ] && echo "yes" || echo "no"
```


### String comparison

| Expr               | Description                                                                          |
| ------------------ | ------------------------------------------------------------------------------------ |
| `=`, `==`, `!=`    | With `[ "$a" == "$b" ]` or `[ "$a" = "$b" ]` (whitespaces around `=` in single `[]`) |
|                    | ⚠️ `==` behaves differently within `[[ ]]` and `[ ]`                                  |
| `[[ $a == z* ]]`   | True if `$a` starts with an `"z"` (pattern matching).                                |
| `[[ $a == "z*" ]]` | True if `$a` is equal to `z*` (literal matching).                                    |
| `[ $a == z* ]`     | File globbing and word splitting take place.                                         |
| `[ "$a" == "z*" ]` | True if `$a` is equal to `z*` (literal matching).                                    |
| `<`, `>`           | In ASCII alphabetical order. Must be escaped in `[ "$a" \< "$b" ]`                   |
|                    |                                                                                      |
| `-z`               | String is null, i.e. zero length.                                                    |
| `-n`               | String is not null. String MUST be quoted.                                           |


### Integer and string operators

See: https://tldp.org/LDP/abs/html/comparison-ops.html

Integer comparisons: equal, not equal, greater, greater or equal, less, less or equal.
```bash
-eq, -ne, -gt, -ge, -lt, -le  # With [ "$a" -eq "$b" ]
<, <=, >, >=  # With (("$a" < "$b"))
```


### Compound comparison

`!` (not): Reverses the test.

```bash
[[ condition1 && condition2 ]] or [ "$expr1" -a "$expr2" ]  # AND
[[ condition1 || condition2 ]] or [ "$expr1" -o "$expr2" ]  # OR   
```


### Switch/case statement

```bash
shopt -s extglob  # Required only for extended pattern matching, see below.
case expression in
  pattern_1)
    statements
    ;;
  pattern_2 ) statement;;
  *         ) statement;;  # catchall, matches anything not matched above

  # Extended pattern matching, see below.
  a*             ) statement;;  # matches anything starting with "a"
  b?             ) statement;;  # matches any two-character string starting with "b"
  c[de]          ) statement;;  # matches "cd" or "ce"
  me?(e)t        ) statement;;  # matches "met" or "meet"
  @(a|e|i|o|u)   ) statement;;  # matches one vowel
  m+(iss)?(ippi) ) statement;;  # matches "miss" or "mississippi" or others
esac
```

Extended pattern matching:  
See: https://www.gnu.org/software/bash/manual/html_node/Pattern-Matching.html#Pattern-Matching

| Expr  | Description                         |
| ----- | ----------------------------------- |
| `?()` | zero or one occurrences of pattern  |
| `*()` | zero or more occurrences of pattern |
| `+()` | one or more occurrences of pattern  |
| `@()` | one occurrence of pattern           |
| `!()` | anything except the pattern         |


### Parameter substitution

See: https://www.tldp.org/LDP/abs/html/parameter-substitution.html

| Expr                   | Description                                                |
| ---------------------- | ---------------------------------------------------------- |
| `${variable-default}`  | If variable is unset, use default.                         |
| `${variable=default}`  | If variable is unset, set variable to default.             |
| `${variable+alt}`      | If variable is set, use alt, else use null string.         |
| `${variable:-default}` | With `":[-=+]"`, condition takes also "declared but null". |


### String manipulations

See: https://www.tldp.org/LDP/abs/html/string-manipulation.html

| Expr                               | Description                                                 |
| ---------------------------------- | ----------------------------------------------------------- |
| `${#string}`                       | Length                                                      |
|                                    |                                                             |
| `${string:position}`               | Substring, or positional parameter with `$*` and `$#`.      |
| `${string:position:length}`        | Substring.                                                  |
|                                    |                                                             |
| `${string#substring}`              | Deletes shortest match of $substring from front of $string. |
| `${string##substring}`             | Same but longest match.                                     |
| `${string%substring}`              | Shortest from back.                                         |
| `${string%%substring}`             | Longest from back.                                          |
|                                    |                                                             |
| `${string/substring/replacement}`  | Replace first match.                                        |
| `${string//substring/replacement}` | Replace all matches.                                        |
| `${string/#substring/replacement}` | Replace if matches front end of $string.                    |
| `${string/%substring/replacement}` | Replace if matches back end of $string.                     |
|                                    |                                                             |
| `${var^}`                          | Uppercase first char.                                       |
| `${var^^}`                         | Uppercase all chars.                                        |
| `${var,}`                          | Lowercase first char.                                       |
| `${var,,}`                         | Lowercase all chars.                                        |


### Dynamic variables

See: https://www.gnu.org/software/bash/manual/html_node/Shell-Parameter-Expansion.html#Shell-Parameter-Expansion

```bash
suffix=bar
foo_$suffix="foo bar"

varname=foo_$suffix
echo ${!varname}
```


### Arrays

See: https://www.gnu.org/software/bash/manual/html_node/Arrays.html

For read-only, use `declare -r*`.

```bash
declare -a array
declare -a array=( "value1" "value2" )

# Set
array+=( "value1" )
# ⚠️ `array+="foo"` appends to the first item => "value1foo"

# Get
echo "$array"       # First item, same as `${array[0]}`
echo "${array[1]}"  # Second item

echo "${array[@]}"   # List of values: `value1 value2`
echo "${!array[@]}"  # List of indexes: `0 1`
echo "${#array[@]}"  # Length: 2
```

**Associative Arrays:**
_⚠️ Order is not respected! Even when setting values directly in the `declare`._

```bash
declare -A dictionary
declare -A dictionary=( ["key1"]="value1" ["key2"]="value2" )

# Set
dictionary["key1"]="value1"
dictionary["key2"]="value2"
# Or…
dictionary+=(["key2"]="value2")

# Get
echo "${dictionary["key1"]}"

echo "$dictionary"        # ⚠️ Empty!
echo "${dictionary[@]}"   # List of values: `value1 value2`
echo "${!dictionary[@]}"  # List of keys: `key1 key2`
echo "${#dictionary[@]}"  # Length: 2

(( ${#dictionary[@]} == 0 )) && echo "empty"

# ⚠️ Order is not respected!
for key in ${!dictionary[@]}; do
  echo "${key}: ${dictionary[$key]}"
done

unset dictionary["key1"]  # Remove a given item
unset dictionary          # "Empty all values"
```

**Keep order in associative arrays:**

```bash
declare -a ordered_keys=( "key1" "key2" )
# Or…
dictionary["key1"]="value1"; ordered_keys+=( "key1" )
dictionary["key2"]="value2"; ordered_keys+=( "key2" )

for key in ${ordered_keys[@]}; do
  echo "${key}: ${dictionary[$key]}"
done
```

**Check if value in array:**  
_Source: https://stackoverflow.com/a/47541882/101831_

```bash
printf '%s\0' "${myarray[@]}" | grep -F -x -z -- 'myvalue'
```

- `-z/--null-data` - Lines are terminated by a zero byte instead of a newline.
- `-F/--fixed-strings` - Interpret PATTERNS as fixed strings, not regular expressions.
- `-x/--line-regexp` - Select only those matches that exactly match the whole line.
- `--` - marks the end of command-line options, making Grep process "myvalue" as a non-option argument even if it starts with a dash


### Sequences

| Expr                 | Description                                 |
| -------------------- | ------------------------------------------- |
| `seq [<min>] <max>`  |                                             |
|                      |                                             |
| `{from..to[..step]}` |                                             |
| `{10..20}`           | 10 11 12 13 14 15 16 17 18 19 20            |
| `{20..10..2}`        | 20 18 16 14 12 10                           |
| `{X..d..2}`          | X Z  ^ ` b d                                |
|                      |                                             |
| `{010..15}`          | Zero-padding 010 011 012 013 014 015        |
| `{000..10}`          | 000 001 002 003 004 005 006 007 008 009 010 |


### Extract directory, filename and extension

```bash
path="/path/to/foo.txt"
directory=$(dirname "$path")  # /path/to
file=$(basename "$path")      # foo.txt
filename="${file%.*}"         # foo
extension="${file##*.}"       # txt
```


### Arithmetic expansion and evaluation

```bash
(( a = 23 ))
(( t = a < 45 ? 7 : 11 ))  # Assignment with ternary operator.
(( a++ ))
(( --a ))
v=$(( a++ % 3 ))
```


### Execute command(s) on multiple items

```bash
for f in `ls *.jpeg`; do mv $f ${f/%.jpeg/.jpg}; done
for e in a b c; do command1 $e; command2; done
for i in {1..10}; do wget -o $i.txt https://example.com/data?id=$i; done
```


### Heredoc, allowing to pass a multiline text to an interactive command

⚠️ Inside the `EOF`s, the first character is a `\t` (tab).

```bash
<COMMAND> <<-EOF
	Lorem ipsum on multiple lines.
	The optional "-" in "<<-EOF" allow to ignore leading tabs.
	Can include $variable, ${variable}, `command`.
EOF

cat <<EOT > output.txt
To create a file with
multiple lines
use `cat`.
EOT
```


### To pass a multiline text as argument

```bash
<COMMAND> --arg="$(cat <<EOF
...
EOF
)"
```


### Current date/time

```bash
date +"%y%m%d-%H%M%S"
```


---


## Files

### File test operators

See: https://tldp.org/LDP/abs/html/fto.html

| Expr        | Description                                                  |
| ----------- | ------------------------------------------------------------ |
| `-e`        | File exists.                                                 |
| `-f`        | File is a regular file.                                      |
| `-d`        | File is a directory.                                         |
| `-s`        | File is not zero size.                                       |
|             |                                                              |
| `-h`        | File is a symbolic link                                      |
| `-L`        | File is a symbolic link                                      |
|             |                                                              |
| `-r`        | File has read permission (for the user running the test).    |
| `-w`        | File has write permission (for the user running the test).   |
| `-x`        | File has execute permission (for the user running the test). |
|             |                                                              |
| `f1 -nt f2` | File f1 is newer than f2.                                    |
| `f1 -ot f2` | File f1 is older than f2.                                    |



### Iterate/loop over lines of a file / Read file line by line

1. Simple but last line skipped if no `LF`.  
2. `|| [[ -n $line ]]` avoids the last line of the file to be skipped if there is no trailing line feed.

```bash
while read line; do echo "$line"; done < file.txt                        # 1
cat file.txt | while read line || [[ -n $line ]]; do echo "$line"; done  # 2
```


### Iterate/loop over files with filename containing spaces

```bash
find . -maxdepth 1 -name '*.txt' | while read f; do echo $f; done
```


### Rename daily files with week/day `W00D0`

```bash
w=1; d=1
find . -maxdepth 1 -name '*.mp3' | sort | while read f; do
  nf=$(echo "$f" | sed -E "s/^\.\/20([0-9]{2})-([0-9]{2})-([0-9]{2}) (.*)\.mp3$/W0${w}D${d} \4.\1\2\3.mp3/;s/W0([0-9]{2})/W\1/")
  mv "$f" "$nf"
  (( d++ % 5 )) || { d=1; (( w++ )); }
done
```


### Append a multiline text to a file

```bash
cat >> /path/to/file <<EOF
...
EOF
```


---


## Scripts

### Real path of current file

```bash
__FILE__=$(realpath "${BASH_SOURCE[0]}")
```

**Polyfill:**

```bash
if [ -z "$( which realpath )" ]; then
  function realpath() { [ -d "${1}" ] && printf "$( cd "${1}" >/dev/null 2>&1 && pwd )" || printf "${1}"; }
fi
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

**With piped commands:**
```bash
# cmd0 | cmd1 | cmd2
[ ${PIPESTATUS[0]} != 0 ] && { echo -e "Command failed, abort."; exit $?; }
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
# Parameters:
#   $1: The question.
#   $2: (optional) Default value, used when pressing enter.
# Usage:
#   - `if ask_yesno "Do you want to do this?" "y"; then echo "yes"; else echo "no"; fi`
#   - `(ask_yesno "Do you want to do this?") && echo "yes" || echo "no"`
ask_yesno() {
  local prefix="▷ "
  local answer=
  local offset=$( expr length "${prefix}${1} (y/n) " )
  case "$2" in
    "y") values="\e[36mY\e[0m/n";;
    "n") values="y/\e[36mN\e[0m";;
    *) values="y/n";;
  esac
  printf "${prefix}\e[1;37m${1}\e[0m (${values}) \e[36m"
  while [ -z "$answer" ]; do
    read -n 1 answer
    if [[ "${answer,,}" =~ ^(y|n)$ ]]; then
      [ "${answer,,}" == "y" ] || answer="n"
      echo
    elif [ -z "$answer" ] && [ -n "$2" ]; then
      answer="$2"
      echo -e "\e[1A\e[${offset}C${answer}"
    elif [ -n "$answer" ]; then
      echo
      answer=
      offset=$( expr length "${prefix}y or n? " )
      printf "\e[0m${prefix}y or n? \e[36m"
    fi
  done
  printf "\e[0m"
  [ "$answer" == "y" ] && return 0 || return 1
}
```

**Basic One-Liner Function:**
_First with default "no". Second with default "yes".
```bash
ask_yesno() { printf "\e[1;33m${1}\e[0m (y/N) \e[36m"; read -n 1; echo -e "\e[0m"; [ "${REPLY,,}" == "y" ] && return 0 || return 1; }
ask_yesno() { printf "\e[1;33m${1}\e[0m (Y/n) \e[36m"; read -n 1; echo -e "\e[0m"; [ "${REPLY,,}" == "n" ] && return 1 || return 0; }
```


### Loop on a question until it's valid

```bash
REPLY=
while [ -z "$REPLY" ]; do  # Here simply if not empty.
  read -p "Question: "
done
```


### Sudo keep-alive

<details>
<summary>This is a one-liner used for periodically refreshing a sudo authentication session without performing any actual tasks.</summary>

It keeps the sudo session alive by running a no-op `sudo -n true` command every 60 seconds. This can be useful in situations where you need to maintain sudo privileges for an extended period without having to re-enter your password each time you use a sudo command.

1. `while true; do ...; done`: This is a while loop that runs indefinitely (`true` is always true), creating a loop that will keep running until it's explicitly exited.

2. `sudo -n true`: This is the key part of the command. `sudo` is a command that allows you to execute other commands with elevated privileges (as a superuser). However, in this case, the `-n` option is used, which stands for "non-interactive." When `sudo -n` is used, it attempts to run the command `true` as a superuser without prompting for a password. The `true` command in Unix-like systems is a command that does nothing and always returns a "true" exit status. So essentially, `sudo -n true` is used to perform a no-op sudo command, which is just a way to refresh the sudo credentials without actually executing any real commands.

3. `sleep 60`: This part makes the script wait for 60 seconds.

4. `kill -0 "$$" || exit`: This part checks if the script is still running. `$$` is a special variable in Bash that holds the process ID (PID) of the current script. `kill -0` is used to check if a process with the given PID exists. If the process still exists, the `kill` command returns successfully (exit status 0), and the `||` operator ensures that the `exit` command is not executed. If the process does not exist (i.e., if the script has been terminated), the `kill` command returns a non-zero exit status, and the `exit` command is executed, which terminates the script.

5. `2>/dev/null`: This part redirects any error messages (file descriptor 2) to `/dev/null`, effectively suppressing error output.

6. `&`: This runs the entire loop in the background, allowing it to continue running in the background while you can interact with the terminal.
</details>

_Source: https://gist.github.com/cowboy/3118588_

```bash
# Ask for the administrator password upfront.
sudo -v

# Sudo keep-alive: update existing sudo timestamp if set, otherwise do nothing.
while true; do sudo -n true; sleep 60; kill -0 "$$" || exit; done 2>/dev/null &
```

**One-Liner Function:**
```bash
sudo_forever() { sudo -v; while true; do sudo -n true; sleep 60; kill -0 "$$" || exit; done 2>/dev/null & }
```
