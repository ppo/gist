# Git

> 👋Errors, improvements or other cool stuff? Let me know! 😀


**Clone a repository in a folder**
```bash
git clone git@github.com:xxx/xxx.git dst_dir
```

**Initialize a folder**
```bash
git init
```

**Add a repository to an initialized folder**
```bash
git remote add origin git@github.com:xxx/xxx.git
git pull origin master
git branch --set-upstream-to=origin/master master
```

**Change remote URLs**
```bash
git remote -v  # Show remote URLs (fetch & push)
git remote set-url origin git@github.com:xxx/xxx.git
git remote -v
```

**Get latest tag/version**
```bash
git describe --tags --abbrev=0
```


#### Bump version

```bash
newVersion="0.2.0"
oldVersion=$(cat VERSION)
oldVersion=$(grep -oP "@version \K.+$" file)  # If your grep works with Perl regex.
oldVersion=$(grep -E -m 1 "@version (.+)$" file | sed -E "s/^.+@version (.+)$/\1/")
```

**Find all files containing the old version (/!\) and replace it.**
```bash
grep -rl "v${oldVersion//./\\.}" . | xargs sed -i "" -e "s/v${oldVersion//./\\.}/v${newVersion//./\\.}/g"
```

**Describe changes.**  
Update `CHANGELOG.md`

**Create locally.**
```bash
git add VERSION CHANGELOG.md
git commit -m "Short description of changes.\n\nMore details…"
git tag -a "v${newVersion}" -m "Bump version: $oldVersion → $newVersion"
```

**Push to repo.**
```bash
git push origin master
git push origin "v${newVersion}"
```
