# find

> 👋 Errors, improvements or other cool stuff? Let me know! 😀


### Exec

Format: `-exec <command> <terminator>`

- **`{}`:** Is replaced by the current file name being processed. It doesn't have to be quoted (`"{}"`).
- **`\;`:** As `;` has a meaning for the shell, it must be escaped for `find` to get it.

**`\;` vs. `+`:**

- With `;`, the command is executed on each matched item.

    Command: `find . -type f -exec echo {} \; | wc -l`  
    Similar to: `echo 1; echo 2; echo 3`  
    Result: `3`

- With `+`, the command is executed once with the list of all the matched items.

    Command: `find . -type f -exec echo {} + | wc -l`  
    Similar to: `echo 1 2 3`  
    Result: `1`


### Find & delete

```bash
find . -name ".DS_Store" -delete
```


### Find & delete in max 2 sub-directories

```bash
find . -maxdepth 2 -name ".git*" -exec rm -rf {} \;
```


### Another find & delete

```bash
find . -name "Icon?" -print0 | xargs -0 rm
```


### Find broken symlinks

```bash
find -L . -type l
```


### Find & replace in place

```bash
find . -type f -name "*.py" -exec sed -i 's/find/replace/g' {} \;
```
