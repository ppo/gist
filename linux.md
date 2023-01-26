# Linux

> 👋Errors, improvements or other cool stuff? Let me know! 😀


### List processes listening on a particular port

```bash
lsof -i :<port>
```


### Customizing `top` (information about processes)

```bash
top -n 20 -o mem -O cpu -stats state,time,cpu,mem,purg,threads,command,pid,pgrp,ppid
```

- `-n 20` Display up to `20` processes.
- `-o mem -O cpu` Sort by `mem`, then `cpu`.
- `-stats` Statistics to display. See the `-o` flag for the valid keys.
- `-user $(whoami)` Only display processes owned by the current user.
- `-pid <PID>` Only display the given process. May be specified multiple times.
