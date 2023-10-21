# Regular Expressions

> 👋 Errors, improvements or other cool stuff? Let me know! 😀


### Add thousand separators

```python
RE_NUMBER_FORMAT = re.compile(r"\B(?=(\d{3})+(?!\d))")
RE_NUMBER_FORMAT.sub(",", str(value))
```

#### Explanation

_Source: [regular expressions 101](https://regex101.com/r/EiQ2pl/1)_

`/\B(?=(\d{3})+(?!\d))/gm`

- `\B` assert position where \b does not match.
- `(?=(\d{3})+(?!\d))` Positive Lookahead: Assert that the Regex below matches.
    - `(\d{3})+` 1st Capturing Group
        - `+` matches the previous token between one and unlimited times, as many times as possible, giving back as needed (greedy).  
          _☝️ A repeated capturing group will only capture the last iteration. Put a capturing group around the repeated group to capture all iterations or use a non-capturing group instead if you're not interested in the data._
        - `\d` matches a digit (equivalent to [0-9]).
        - `{3}` matches the previous token exactly 3 times.
    - `(?!\d)` Negative Lookahead: Assert that the Regex below does not match.
        - `\d` matches a digit (equivalent to [0-9]).
- Global pattern flags:
    - `g` modifier: global. All matches (don't return after first match).
    - `m` modifier: multi line. Causes `^` and `$` to match the begin/end of each line (not only begin/end of string).
