# Flex Table

[![hacs_badge](https://img.shields.io/badge/HACS-Default-41BDF5.svg?style=for-the-badge)](https://github.com/hacs/integration) 
[![Version](https://img.shields.io/badge/version-0.7.4-green.svg?style=plastic)](#) 
[![stable-release-0.7.4](https://img.shields.io/badge/stable-release_0.7.4-green.svg?style=plastic)](#)  
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

* [Quick-Start](https://github.com/custom-cards/flex-table-card/tree/master/docs/example-cfg-basics.md)
* [(Configuration) Examples](https://github.com/custom-cards/flex-table-card/tree/master/docs)
  * [Basics](https://github.com/custom-cards/flex-table-card/tree/master/docs/example-cfg-basics.md)
  * [Column Data Selector](https://github.com/custom-cards/flex-table-card/tree/master/docs/example-cfg-data.md)
  * [Formatting](https://github.com/custom-cards/flex-table-card/tree/master/docs/example-cfg-simple-cell-formatting.md)
  * [Sorting & Strict](https://github.com/custom-cards/flex-table-card/tree/master/docs/example-cfg-sorting-strict.md)
  * [Headers](https://github.com/custom-cards/flex-table-card/tree/master/docs/example-cfg-headers.md)
  * [Advanced Cell Formatting](https://github.com/custom-cards/flex-table-card/tree/master/docs/example-cfg-advanced-cell-formatting.md)
  * [Formatting with CSS](https://github.com/custom-cards/flex-table-card/tree/master/docs/example-cfg-css.md)
  * [Auto Entities](https://github.com/custom-cards/flex-table-card/tree/master/docs/example-cfg-autoentities.md)
* [Configuration Reference](https://github.com/custom-cards/flex-table-card/tree/master/docs/config-ref.md)
* [How to Contribute](https://github.com/custom-cards/flex-table-card/tree/master/docs/contribute.md)
