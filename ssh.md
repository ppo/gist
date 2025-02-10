# SSH

> 👋 Errors, improvements or other cool stuff? Let me know! 😀


### Initialize SSH folder
```bash
mkdir ~/.ssh
chmod 700 ~/.ssh
```

### Config file

Path: `~/.ssh/config`

```bash
# /!\ Use `~`, `$HOME` doesn't work.

# macOS Sierra 10.12.2 or later:
# Automatically load keys into the ssh-agent and store passphrases in your keychain.
AddKeysToAgent yes
UseKeychain yes

# Default identity.
IdentityFile ~/.ssh/KEYNAME

# My server
Host my-shortcut example.com 123.123.123.123
  HostName example.com
  User foo
  IdentityFile ~/.ssh/foo@example

# Git repo
Host github
  HostName github.com
  User git
  IdentityFile ~/.ssh/me@github
```


### Generate SSH key for current user on local machine

```bash
keyname=$(echo "`whoami`@`hostname`" | cut -d'.' -f 1)
keydir="~/.ssh/${keyname}"
ssh-keygen -t rsa -b 4096 -f "$keydir" -C "$keyname" -N ""
ssh-add "$keydir"
```


### SSH key-based authentication on remote server

**Option 1:**

```bash
ssh-copy-id foo@example.com
```

**Option 2:**

```bash
cat "~/.ssh/${keyname}.pub" | ssh foo@example.com \
  "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cd ~/.ssh && touch authorized_keys && chmod 600 authorized_keys && cat >> authorized_keys"
```

**Option 3:**

Copy public key to clipboard

```bash
pbcopy < ~/.ssh/${keyname}.pub
```


### Remote diff

```bash
diff local-file.txt <(ssh user@remote "cat remote-file.txt")
diff <(ssh user@remote1 "cat remote-file.txt") <(ssh user@remote2 "cat remote-file.txt")
```
