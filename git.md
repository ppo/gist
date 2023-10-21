# Git

> 👋 Errors, improvements or other cool stuff? Let me know! 😀


### Clone a repository in a folder

```bash
git clone git@github.com:xxx/xxx.git dst_dir
```


### Initialize a folder

```bash
git init
```


### Add a repository to an initialized folder

```bash
git remote add origin git@github.com:xxx/xxx.git
git pull origin master
git branch --set-upstream-to=origin/master master
```


### Change remote URLs

```bash
git remote -v  # Show remote URLs (fetch & push)
# Or: git remote get-url origin
git remote set-url origin git@github.com:xxx/xxx.git
git remote -v
```


### Get latest tag/version

```bash
git describe --tags --abbrev=0
```


### Remove files from Git index (without removing them from filesystem)

```bash
git rm --cached path/to/file
git rm --cached 'path/to/*'  # Or "*" must be escaped: path/to/\*
```


### Diff binary `.plist` files

*See: https://confusatory.org/post/133141617492/git-diff-for-binary-apple-property-list-files*

Local:

```bash
git config diff.plist.textconv 'plutil -convert xml1 -o -'
echo '*.plist diff=plist' >> .gitattributes
```

Global:
```bash
git config --global diff.plist.textconv 'plutil -convert xml1 -o -'
git config --global core.attributesfile $HOME/.gitattributes
echo '*.plist diff=plist' >> $HOME/.gitattributes
```


## Bump version

```bash
newVersion="0.2.0"
oldVersion=$(cat VERSION)
oldVersion=$(grep -oP "@version \K.+$" file)  # If your grep works with Perl regex.
oldVersion=$(grep -E -m 1 "@version (.+)$" file | sed -E "s/^.+@version (.+)$/\1/")
```


### Find all files containing the old version (/!\) and replace it.

```bash
grep -rl "${oldVersion//./\\.}" . | xargs sed -i "" -e "s/${oldVersion//./\\.}/${newVersion//./\\.}/g"
```


### Describe changes.

Update `CHANGELOG.md`


### Create locally.

```bash
git add VERSION CHANGELOG.md
git commit -m "Short description of changes.\n\nMore details…"
git tag -a "${newVersion}" -m "Bump version: $oldVersion → $newVersion"
```


### Push to repo.

```bash
git push origin master
git push origin "${newVersion}"
```
