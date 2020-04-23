<?php
# URL: https://foo/bar/?param=1
#     /foo/bar/          |  $_SERVER["SCRIPT_URL"] or $_SERVER["PATH_INFO"]
#     /foo/bar/?param=1  |  $_SERVER["REQUEST_URI"]
#     http://foo/bar/    |  $_SERVER["SCRIPT_URI"]
#
# Apache defines `SCRIPT_URL` and `SCRIPT_URI`.
# PHP Development Server defines `PATH_INFO` but not `SCRIPT_URI`.

$path = rtrim($_SERVER["SCRIPT_URL"] ?: $_SERVER["PATH_INFO"], "/") ?: "/";