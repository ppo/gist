# Define coding styles for editors.
#
# Doc: https://editorconfig.org/#file-format-details
# Ref: https://github.com/editorconfig/editorconfig/wiki/EditorConfig-Properties


# Stop looking for other `.editorconfig` files in parent folders.
root = true


# DEFAULT VALUES
[*]
charset = utf-8
end_of_line = lf
indent_size = 2
indent_style = tab
insert_final_newline = true
max_line_length = 100  # Pylint default.
trim_trailing_whitespace = true


# CSV
[*.{csv,tsv}]
indent_size = 50    # Large columns.
indent_style = tab  # Used as column separator.

# DIFF FILES
[*.{diff,patch}]
indent_size = 4
trim_trailing_whitespace = false

# INI FILES
[{*.ini,setup.cfg}]
indent_size = 4

# MAKEFILES
[Makefile]
indent_size = 4

# MARKDOWN
[*.md]
indent_size = 4
trim_trailing_whitespace = false

# MINIFIED FILES
# They shouldn’t be changed.
[**.min.{css,html,js}]
indent_style = ignore
insert_final_newline = ignore

# RESTRUCTUREDTEXT
[*.rst]
indent_size = 4
