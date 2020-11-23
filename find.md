# find

> 👋Errors, improvements or other cool stuff? Let me know! 😀


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
