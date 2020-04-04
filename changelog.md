## 0.0.1
- initial commit, forked from entity-attribute-card
- The goal is to provide a flexible table visualization
  for Lovelace.

## 0.2
- Functionality existing as initially planned:
- arbitrary number of columns
- regex based matching of anything that can be accessed through the hass-object (states, attributes, any properties of entities, anything that's visible) 
- restrictions in rows possible `max_rows`
- sorting by chosen column available `sort_by` (ascending and descending)
- column(s) might be hidden (to realize a hidden sorting) `hidden`
- `strict` forces each row to be completly filled with matched content, if not the row will be dropped
- using `attr_as_list` allows easy data visualization from external sources, like `appdaemon`
- in "productive" use now, will shortly go in Version 1.0

## 0.3
- added 'modify' to change cell/col contents using javascript's: eval()
- for 'prop' column contents 'object_id' and 'name' are made available to match: https://www.home-assistant.io/docs/configuration/state_object/

## 0.3.1
- flex-table-card now part of 'custom-cards' organization

## 0.3.2
- exluding mulitple items fixed
- sort_by works now also with 'props' columns thx @andreassolberg
- regular expressions now concated and applied instead on after another
- lots of cleanups

## 0.3.3
- minor improvements, code tidyness, changes for clickable rows started

## 0.4.0
- now with 'clickable' rows to show the entity_id's popup dialog for further information
- more or less full re-write introducing DataTable and DataRow as data representation objects

## 0.5.0
- allow sorting for multiple `attr_as_list` columns by using an `id`
- added `align` param to set text-alignment within a column including the header
- added `suffix` to add units or similar static after the actualy contents 
- added `prefix` which does what the name implies ;)
- smaller bugfixes like keeping the entity order consistent if no sorting is applied

## 0.5.1
- added `css` configuration parameter to allow arbitrary modifications of the used CSS styles.

## 0.5.2
- added `icon` configuration for adding an icon to column headers

## 0.6
- added `multi` instead of `attr` or `prop` for column/cell contents
  - `multi` consists of list of string-pairs e.g., ["attr", "node_id"]
	- allows multiple attributes or properties, whatever to be put into a 
	  single cell 
	- together with `modify:` and `css:` enables content-conditioned 
	  styling, like a cell changing cell-color depending on any state/attr/whatever
	- 'multi_delimiter' further allows to descide how the multiple items within
	  one cell get concatenated, i.e., which delimiter is to be found between the 
		chunks

## 0.6.1
- fixed #28 and #23, which mainly occured due to #24, which changed the "empty"
  behavior output of 'get_raw_data()' away from not-iterable 'null' to an empty Array
- fixed #26: use correct CSS variables to be compliant with theming 
- cleaned front-page README.md and introduced the 'docs' directory to keep all
  documentation there, included template for new doc generation
- added necessary files (info.md + hacs.yaml) for HACS
- fixed #22: using now proper 'strict' JavaScript 
- fixed #25 with PR #27: introduced auto-entities support, thanks @SBado

