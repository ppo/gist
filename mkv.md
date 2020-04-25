# mkv

> 👋Errors, improvements or other cool stuff? Let me know! 😀


[MKVToolNix](https://mkvtoolnix.download/) – Matroska tools for Linux/Unix and Windows


**View info about a file**
```bash
mkvinfo filename
```

**Modify default audio &amp; subtitle tracks**
_The track identifier is not the track number but (a|s) and its index starting from 1._

```bash
mkvpropedit filename \
  --edit track:a1 --set flag-default=0 \  # Disable first audio track (a1).
  --edit track:a2 --set flag-default=1 \  # Enable second audio track (a2).
  --edit track:s1 --set flag-default=0    # Disable first subtitles (s1).
```
