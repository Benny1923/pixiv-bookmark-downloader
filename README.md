# Pixiv-Bookmark-Downloader

Download your pixiv account bookmark using node.js

## Installation

```sh
    ~$ npm install -g pixiv-bookmark-downloader
```

## How to update

```sh
    ~$ npm update -g pixiv-bookmark-downloader
    or
    ~$ npm install pixiv-bookmark-downloader@latest -g
```

## Getting your public bookmark

```sh
    ~$ pbd -u [username] -p [password]
```

## or private bookmark

```sh
    ~$ pbd -u [username] -p [password] -t hide
```

The `[username]` and `[password]` is your pixiv account.

you can use last time login session without username/password or config file.(session will be storage in `cookie.json`)
like:
```sh
   ~$ pbd
```

use `-h` or `--help` to see more argument.

When process done. Result will output to file `result.json`

## Features
- [x] Get all public/private bookmark
- [x] Download image from bookmark(`result.json`) (using `-d` or `--download`)
      (now is **testing** and **unstable**. But don't worry it can't broke your account.)
- [x] Download manga from bookmark(Same as above)
- [x] Download gif from bookmark(Same as above)

~~**Attention!!** since 2018/04/04, pixiv create new UI ,for now this feature is not available. see [this post](https://www.pixiv.net/info.php?id=4532)~~
fixed in 0.9.8

### File
| name(path) | Description |
|---|---|
| bin/pbd.js | Get all public bookmark script. |
| format_v1.json | result output example.(ver 1.5) |
| config_v1.json | config file example. |
| bookmark.js | Get bookmark single page example using jquery.(browser debug ver.) |
| page.js | Get image url example using jquery.(browser debug ver.) |

### Requirements
* async
* chalk
* cheerio
* commander
* fs
* gauge
* request
* request-progress
* tough-cookie-filestore
