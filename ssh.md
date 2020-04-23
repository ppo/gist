# SSH

> 👋Errors, improvements or other cool stuff? Let me know! 😀


# Initialize SSH folder.
mkdir ~/.ssh
chmod 700 ~/.ssh


#BEGIN: Config file: ~/.ssh/config
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
#END: Config file: ~/.ssh/config


# Generate SSH key for current user on local machine.
keyname=$(echo "`whoami`@`hostname`" | cut -d'.' -f 1)
ssh-keygen -b 4096 -f ~/.ssh/$keyname -C $keyname -N ""
ssh-add ~/.ssh/$keyname


# SSH key-based authentication on remote server.
# 1. On local machine:
scp ~/.ssh/${keyname}.pub example.com:

# 2. On remote machine:
cat KEYNAME.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
rm KEYNAME.pub


# Copy public key to clipboard.
pbcopy < ~/.ssh/${keyname}.pub


# Remote diff
diff local-file.txt <(ssh user@remote "cat remote-file.txt")
diff <(ssh user@remote1 "cat remote-file.txt") <(ssh user@remote2 "cat remote-file.txt")
