# Bash

> 👋Errors, improvements or other cool stuff? Let me know! 😀


**Real path of current file.**
```bash
__FILE__=$(realpath "${BASH_SOURCE[0]}")
```

**Directory of current file.**
```bash
__DIR__="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
```

**Script is being executed or sourced?**
```bash
[ "${BASH_SOURCE}" == "$0" ] && echo "Executed" || echo "Sourced"
```


**Positional and special parameters.**

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


**Abort script if command execution failed.**  
```bash
[ $? != 0 ] && { echo -e "Command failed, abort."; exit $?; }
```

**Change folder.**  
```bash
mkdir -p foo/bar && cd "$_"  # Create and go to folder.
cd - &>/dev/null             # Return to previous folder.
```


**Iterate/loop over parameters.**  
```bash
for arg in "$@"; do echo $arg; done
```

**Shift parameters (i.e. remove the first one).**  
_Calling `script.sh a b c` outputs `Before: 3 a b c / After: 2 b c`._

```bash
echo -n "Before: $# $@"; shift; echo " / After: $# $@"
```  

**Iterate/loop over parameters, emptying them.**  
_Calling `script.sh a b c` outputs `Before: 3 a b c / After: 0`._

```bash
echo -n "Before: $#"
while (( "$#" )); do echo -n " $1"; shift; done
echo " / After: $# $@"
```

**Iterate/loop over lines of a file / Read file line by line.**  
1. Simple but last line skipped if no `LF`.  
2. `|| [[ -n $line ]]` avoids the last line of the file to be skipped if there is no trailing line feed.

```bash
while read line; do echo "$line"; done < file.txt                        # 1
cat file.txt | while read line || [[ -n $line ]]; do echo "$line"; done  # 2
```

**Ternary operator.**  
```bash
[ condition ] && echo "yes" || echo "no"
```


**Switch/case statement.**
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


**Compound comparison.**  
`!` (not): Reverses the test.

```bash
[[ condition1 && condition2 ]] or [ "$expr1" -a "$expr2" ]  # AND
[[ condition1 || condition2 ]] or [ "$expr1" -o "$expr2" ]  # OR   
```

**File test operators.**  
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


**Integer and string operators.**  
See: https://tldp.org/LDP/abs/html/comparison-ops.html  
Integer comparisons: equal, not equal, greater, greater or equal, less, less or equal.
```bash
-eq, -ne, -gt, -ge, -lt, -le  # With [ "$a" -eq "$b" ]
<, <=, >, >=  # With (("$a" < "$b"))
```

**String comparison.**

| Expr               | Description                                                                          |
| ------------------ | ------------------------------------------------------------------------------------ |
| `=`, `==`, `!=`    | With `[ "$a" == "$b" ]` or `[ "$a" = "$b" ]` (whitespaces around `=` in single `[]`) |
|                    | ⚠️ `==` behaves differently within `[[ ]]` and `[ ]`                                 |
| `[[ $a == z* ]]`   | True if `$a` starts with an `"z"` (pattern matching).                                |
| `[[ $a == "z*" ]]` | True if `$a` is equal to `z*` (literal matching).                                    |
| `[ $a == z* ]`     | File globbing and word splitting take place.                                         |
| `[ "$a" == "z*" ]` | True if `$a` is equal to `z*` (literal matching).                                    |
| `<`, `>`           | In ASCII alphabetical order. Must be escaped in `[ "$a" \< "$b" ]`                   |
|                    |                                                                                      |
| `-z`               | String is null, i.e. zero length.                                                    |
| `-n`               | String is not null. String MUST be quoted.                                           |


**Parameter substitution.**
See: https://www.tldp.org/LDP/abs/html/parameter-substitution.html

| Expr                   | Description                                                |
| ---------------------- | ---------------------------------------------------------- |
| `${variable-default}`  | If variable is unset, use default.                         |
| `${variable=default}`  | If variable is unset, set variable to default.             |
| `${variable+alt}`      | If variable is set, use alt, else use null string.         |
| `${variable:-default}` | With `":[-=+]"`, condition takes also "declared but null". |


**String manipulations.**  
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

**Sequences.**  

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


**Extract directory, filename and extension.**
```bash
path="/path/to/foo.txt"
directory=$(dirname "$path")  # /path/to
file=$(basename "$path")      # foo.txt
filename="${file%.*}"         # foo
extension="${file##*.}"       # txt
```


**Arithmetic expansion and evaluation.**
```bash
(( a = 23 ))
(( t = a < 45 ? 7 : 11 ))  # Assignment with ternary operator.
(( a++ ))
(( --a ))
```


**Execute command(s) on multiple items.**
```bash
for f in `ls *.jpeg`; do mv $f ${f/%.jpeg/.jpg}; done
for e in a b c; do command1 $e; command2; done
for i in {1..10}; do wget -o $i.txt https://example.com/data?id=$i; done

# If file names contain spaces.
find . -name "*.png" -print0 | while read -d $'\0' f; do mv "$f" "${f/find/replace}"; done
```


**Heredoc, allowing to pass a multiline text to an interactive command.**  
⚠️ Inside the `EOF`s, the first character is a `\t` (tab).

```bash
<COMMAND> <<-EOF
	Lorem ipsum on multiple lines.
	The optional "-" in "<<-EOF" allow to ignore leading tabs.
	Can include $variable, ${variable}, `command`.
EOF
```

**To append a multine text to a file.**
```bash
cat >> /path/to/file <<EOF
...
EOF
```

**To pass a multine text as argument.**
```bash
<COMMAND> --arg="$(cat <<EOF
...
EOF
)"
```


**Ask the user for input.**
```bash
read -p "Username: " username_var
read -sp "Password: " password_var
```

**Ask a question and answer below (with a leading `>`).**
```bash
echo -ne "Question?\n> "; read
```

**With `-n 1`, return/submit automatically when a/one character is typed.**  
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


**Loop on a question until it's valid.**
```bash
REPLY=
while [ -z "$REPLY" ]; do  # Here simply if not empty.
  read -p "Question: "
done
```


**Current date/time.**
```bash
date +"%y%m%d-%H%M%S"
```
