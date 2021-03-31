# Bash

> 👋Errors, improvements or other cool stuff? Let me know! 😀


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
|                    | ⚠️ `==` behaves differently within `[[ ]]` and `[ ]`                                 |
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
