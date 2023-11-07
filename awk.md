# awk

> 👋 Errors, improvements or other cool stuff? Let me know! 😀


### Print the n-th column

```bash
awk '{print $n}'  

echo "a b c d" | awk '{print $2}'  # Output: b
```


### Print specific lines of a file

```bash
cat file.txt | awk '{if (NR>=123 && NR<=125) print}'
```

**`NR`:** The ordinal number of the current record from the start of input.  Inside a BEGIN action the value shall be 
zero. Inside an END action the value shall be the number of the last record processed.


### Print date and time columns

```bash
ls -l | sed '1d' | awk '{print $6,$7}'  
```


### Replace new lines

```bash
cat file.txt | awk '{printf $0}'      # …with nothing.
cat file.txt | awk '{printf $0 " "}'  # …with spaces.
```


### Format output using a variable and a column from the file

`%-10s` = adding spaces to the right.  
`%6s` = right align, adding spaces to the left.

```bash
cat $filename | awk "{printf \"│ %-10s │ %6s │\", \"$filename\", \$2}"
```
