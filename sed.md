# sed

> 👋Errors, improvements or other cool stuff? Let me know! 😀

```bash
sed 's/find/replace/g'         # Find & replace.
sed '/filter/s/find/replace/'  # Find & replace in lines matching filter.

sed '/find/d'        # Delete line.
sed '1d;2d'          # Delete first and second lines.
sed '3d'             # Delete third line.
sed '$d'             # Delete last line.
sed '/<!--/,/-->/d'  # Delete lines from/to regexs.

sed '/find/y/abc/ABC/'  # Find & translate.

sed 's/^/replace/'  # Prepend to file.
sed '\$atext'       # Append to file.
```


### Find & replace in place

```bash
sed -i 's/find/replace/g' -i file
sed -i '' -e 's/find/replace/g' file           # If error with previous command on Mac.
sed -i '.original' -e 's/find/replace/g' file  # Creates a backup "file.original". /!\ No space between -i and ''.
```


### Find & replace in multiple files

```bash
find . -type f -name "*.py" -exec sed -i "s/find/replace/g" {} \;
grep -rl "list files containing this" . | xargs sed -i "" -e "s/find/replace/g"
```


### Multiple commands

```bash
sed -e 'cmd1' -e 'cmd2' -i file
sed 'cmd1,cmd2' file
```


### Replace from-to

```bash
sed -i '/from_pattern/, /to_pattern/ s/find/replace/' file
sed -i '/VARNAME = {/, /^}/ s/^/# /' file  # Example: Commenting a dictionary defined on several lines.
```


### Insert a block of text in a file
_Source: https://www.baeldung.com/linux/file-insert-multiple-lines_

#### Inline

```bash
sed -i '/from_pattern/anew line 1\nnew line 2' file
```

#### From a file

```bash
sed -i '/from_pattern/r new_content_file' file
```

#### From STDIN

```bash
cat << EOF | sed -i '/from_pattern/r /dev/stdin' file
new line 1
new line 2
EOF
```


### Replace a block of text with the content of a file

_Source: https://stackoverflow.com/a/2700594/101831_

```bash
sed -i '' -ne '/BEGIN_PATTERN/ {' -e 'p; r replace_file.txt' -e ':a; n; /END_PATTERN/ {p; b}; ba' -e '}; p' file
```
