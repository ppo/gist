# rsync

> 👋Errors, improvements or other cool stuff? Let me know! 😀


### Rsync update and delete, recursive, and preserve all (times, permissions, owner/group)

`rsync -au --delete --progress <FROM> <TO>`


### Rsync only the specified files and folders (with their content)

`rsync --include-from=rsync-files.txt <FROM> <TO>`

With `rsync-files.txt`:
```
my-dir/
my-file.txt
- /*
```


### Short/clean output format (operation and short filename)

`rsync --out-format="%o %n"`

[Syntax reference](https://download.samba.org/pub/rsync/rsyncd.conf.html) (under "log format")  
Default: `%o %h [%a] %m (%u) %f %l`

```
%a the remote IP address (only available for a daemon)
%b the number of bytes actually transferred
%B the permission bits of the file (e.g. rwxrwxrwt)
%c the total size of the block checksums received for the basis file (only when sending)
%C the full-file checksum if it is known for the file. For older rsync protocols/versions,
  the checksum was salted, and is thus not a useful value (and is not displayed when that
  is the case). For the checksum to output for a file, either the --checksum option must
  be in-effect or the file must have been transferred without a salted checksum being used.
  See the --checksum-choice option for a way to choose the algorithm.
%f the filename (long form on sender; no trailing "/")
%G the gid of the file (decimal) or "DEFAULT"
%h the remote host name (only available for a daemon)
%i an itemized list of what is being updated
%l the length of the file in bytes
%L the string " -> SYMLINK", " => HARDLINK", or "" (where SYMLINK or HARDLINK is a filename)
%m the module name
%M the last-modified time of the file
%n the filename (short form; trailing "/" on dir)
%o the operation, which is "send", "recv", or "del." (the latter includes the trailing period)
%p the process ID of this rsync session
%P the module path
%t the current date time
%u the authenticated username or an empty string
%U the uid of the file (decimal)
```
