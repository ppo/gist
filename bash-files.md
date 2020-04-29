# Bash & Files

> 👋Errors, improvements or other cool stuff? Let me know! 😀


**File test operators**  
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


**Iterate/loop over lines of a file / Read file line by line**  
1. Simple but last line skipped if no `LF`.  
2. `|| [[ -n $line ]]` avoids the last line of the file to be skipped if there is no trailing line feed.

```bash
while read line; do echo "$line"; done < file.txt                        # 1
cat file.txt | while read line || [[ -n $line ]]; do echo "$line"; done  # 2
```

**Iterate/loop over files with filename containing spaces.**
```bash
find . -maxdepth 1 -name '*.txt' | while read f; do echo $f; done
```

**Rename daily files with week/day `W00D0`.**
```bash
w=1; d=1
find . -maxdepth 1 -name '*.mp3' | sort | while read f; do
  nf=$(echo "$f" | sed -E "s/^\.\/20([0-9]{2})-([0-9]{2})-([0-9]{2}) (.*)\.mp3$/W0${w}D${d} \4.\1\2\3.mp3/;s/W0([0-9]{2})/W\1/")
  mv "$f" "$nf"
  (( d++ % 5 )) || { d=1; (( w++ )); }
done
```

**Append a multiline text to a file**
```bash
cat >> /path/to/file <<EOF
...
EOF
```
