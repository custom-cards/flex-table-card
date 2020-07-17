# Flex Table

[![Version](https://img.shields.io/badge/version-0.7-green.svg?style=plastic)](#)
[![stable-release-0.7](https://img.shields.io/badge/stable-release_0.7-green.svg?style=plastic)](#) 
[![maintained](https://img.shields.io/maintenance/yes/2020.svg?style=plastic)](#)
<a href="https://www.buymeacoffee.com/daringer" target="_blank"> <img src="https://cdn.buymeacoffee.com/buttons/lato-green.png" alt="Buy Me A Coffee Or Beer" height=18></a>

## Installation using HACS ([Home Assistant Community Store](https://hacs.xyz))

* Use [HACS](https://hacs.xyz) inside your frontend, if unavailable [here is how to install HACS](https://hacs.xyz/docs/installation/manual)
* Search for `flex-table`, hit `install`, done!
* Add the appropriate lines as provided by [HACS](https://hacs.xyz) to your *lovelace ui config* 

## Installation (as quick, only manual updates, better for developers)

* Find your home-assistent config-dir (e.g., `~/.homeassistant/`) and change into `~/.homeassistant/www` (create if needed)
* Run `$ wget https://raw.githubusercontent.com/custom-cards/flex-table-card/master/flex-table-card.js` to get the `.js` file
* Add at the top of your UI Lovelace config (via *lovelace ui config* or within `.yaml`)
``` yaml
resources:
  - type: module
    url: /local/flex-table-card.js
```

## Quick-Start & Documentation

* [Quick-Start](docs/example-cfg-basics.md)
* [(Configuration) Examples](docs/)
  * [Basics](docs/example-cfg-basics.md)
  * [Column Data Selector](docs/example-cfg-data.md)
  * [Formatting](docs/example-cfg-simple-cell-formatting.md)
  * [Sorting & Strict](docs/example-cfg-sorting-strict.md)
  * [Headers](docs/example-cfg-headers.md)
  * [Advanced Cell Formatting](docs/example-cfg-advanced-cell-formatting.md)
  * [Formatting with CSS](docs/example-cfg-css.md)
  * [Auto Entities](docs/example-cfg-autoentities.md)
* [Configuration Reference](docs/config-ref.md)
* [How to Contribute](docs/contribute.md)
