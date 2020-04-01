# Flex Table

[![Version](https://img.shields.io/badge/version-0.6-green.svg?style=plastic)](#)
[![stable-release-0.6](https://img.shields.io/badge/stable-release_0.6-green.svg?style=plastic)](#) 
[![maintained](https://img.shields.io/maintenance/yes/2020.svg?style=plastic)](#)
<a href="https://www.buymeacoffee.com/daringer" target="_blank"> <img src="https://cdn.buymeacoffee.com/buttons/lato-green.png" alt="Buy Me A Coffee Or Beer" height=18></a>

## Installation using HACS ([Home Assistant Community Store](https://hacs.xyz/docs/installation/manual))

* quicker, better, faster, easier - use HACS inside your frontend, if unavailable [here is how to install HACS](https://hacs.xyz/docs/installation/manual)
* either search for `flex` or visit `/hacs/repository/156292058` relative to your home-assistant web base-url
* hit `install` and it's done, only thing remaining is adding the appropriate url + type to your *lovelace ui config* (please scroll down to see the HACS generated url to be used)

## Installation (as quick, only manual updates, better for developers)

* Find your homeassistent directory containing your configuration (let's say `~/.homeassistant/`)
* Change into `~/.homeassistant/www` (create the `www` directory, if it is not existing, you then might have to restart HA)
* `$ wget https://raw.githubusercontent.com/custom-cards/flex-table-card/master/flex-table-card.js` downloads the `.js` file directly where it should reside
* Finally, add the following on top of your UI Lovelace configuration (means either via Config UI or .yaml)
``` yaml
resources:
  - type: module
    url: /local/flex-table-card.js
```
* Verify that it works with one of the examples below

## Documentation - Table of Contents

* [Configuration Reference](docs/config-ref.md)
* [How to Contribute](docs/contribute.md)
* **(Configuration) Examples**
  * [Basics](docs/example-cfg-basics.md)
  * [Formatting](docs/example-cfg-simple-cell-formatting.md)
  * [Sorting & Strict](docs/example-cfg-sorting-strict.md)
  * [Headers](docs/example-cfg-headers.md)
  * [Attribute as List](docs/example-cfg-attr-as-list.md)
  * [Advanced Cell Formatting](docs/example-cfg-basics.md)
  * [Formatting with CSS](docs/example-cfg-css.md)
  * [Column Multi-Data Matching](docs/example-cfg-column-multi.md)
