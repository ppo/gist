# SSH

> 👋Errors, improvements or other cool stuff? Let me know! 😀


**Initialize SSH folder**
```bash
mkdir ~/.ssh
chmod 700 ~/.ssh
```

**Config file:** `~/.ssh/config`
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


**Generate SSH key for current user on local machine**
```bash
keyname=$(echo "`whoami`@`hostname`" | cut -d'.' -f 1)
ssh-keygen -b 4096 -f ~/.ssh/$keyname -C $keyname -N ""
ssh-add ~/.ssh/$keyname
```


**SSH key-based authentication on remote server**
On local machine:
```bash
scp ~/.ssh/${keyname}.pub example.com:
```

On remote machine:
```bash
cat KEYNAME.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
rm KEYNAME.pub
```


**Copy public key to clipboard**
```bash
pbcopy < ~/.ssh/${keyname}.pub
```

**Remote diff**
```bash
diff local-file.txt <(ssh user@remote "cat remote-file.txt")
diff <(ssh user@remote1 "cat remote-file.txt") <(ssh user@remote2 "cat remote-file.txt")
```
