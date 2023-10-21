# grep

> 👋 Errors, improvements or other cool stuff? Let me know! 😀


### Extract only the part that matches

```bash
grep -oP "@version \K.+$" file  # Keep only the part after the \K.
grep -oP "(?<=PATTERN_BEFORE).+(?=PATTERN_AFTER)" file  # Extract the part in between.
```
