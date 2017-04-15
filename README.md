# Pixiv-Bookmark-Downloader

Download your pixiv account bookmark using node.js

## Installation

```sh
    ~$ npm install pixiv-bookmark-downloader -g
```

## Getting your public bookmark

```sh
    ~$ pbd -u [username] -p [password]
```

The `[username]` and `[password]` is your pixiv account.

you can use last time login session without username/password or config file.

use `-h` or `--help` to see more argument.

When process done. Result will output to file `result.json`

##Features
- [x] Get all public/private bookmark
- [x] Download image from bookmark(`result.json`) (using `-d` or `--download`)(now is **testing** and **unstable**)

### File
| name(path) | Description |
|---|---|
| bin/pbd.js | Get all public bookmark script. |
| format_v1.json | result output example.(ver 1.5) |
| config_v1.json | config file example. |
| bookmark.js | Get bookmark single page example using jquery.(browser debug ver.) |
| page.js | Get image url example using jquery.(browser debug ver.) |
