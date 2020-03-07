# Flex Table

[![Version](https://img.shields.io/badge/version-0.5.2-green.svg?style=plastic)](#)
[![stability-stable-1.0-release-pending](https://img.shields.io/badge/stability-stable_1.0_release_incoming-green.svg?style=plastic)](#) 
[![maintained](https://img.shields.io/maintenance/yes/2019.svg?style=plastic)](#)
<a href="https://www.buymeacoffee.com/daringer" target="_blank"> <img src="https://cdn.buymeacoffee.com/buttons/lato-green.png" alt="Buy Me A Coffee Or Beer" height=18></a>

## Installation (quick & "dirty")

* Find your homeassistent directory containing your configuration (let's say `~/.homeassistant/`)
* Change into `~/.homeassistant/www` (create the `www` directory, if it is not existing, you then might have to restart HA)
* `$ wget https://raw.githubusercontent.com/custom-cards/flex-table-card/master/flex-table-card.js` downloads the `.js` file directly where it should reside
* Finally, add the following on top of your UI Lovelace configuration (means either via Config UI or .yaml)
``` yaml
resources:
  - type: js
    url: /local/flex-table-card.js
```
* Verify that it works with one of the examples below

## Configuration
The `flex-table-card` aims for more flexibility for tabular-ish visuallization needs, by realizing:

- unlimited columns / rows 
- various different data-sources may be used in a single table
- lots of possibilities for configuration: entity selection (include, exclude), (hidden-)column-sorting, js-based content manipulation, row limiting and more...

Flex Table gives you the possibility to visualize any tabular data within Lovelace. Especially overviews with high data densities can be easily realized. Some screenshots:

<img src="https://github.com/daringer/image_dump/raw/master/tbl1.png" width=20% /><img src="https://github.com/daringer/image_dump/raw/master/tbl2.png" width=20% /><img src="https://github.com/daringer/image_dump/raw/master/tbl3.png" width=20% /><span><img src="https://github.com/daringer/image_dump/raw/master/trash_tbl.png" width=20% /><img src="https://github.com/daringer/image_dump/raw/master/tbl4.png" width=20% /></span>


**Configuration Options**


***Top-level options***

| Name                 | Type     | Required?     | Description
| ----                 | ----     | ------------- | -----------
| type                 | string   | **required**  | `custom:flex-table-card`
| title                | string   |   optional    | A title for the card
| strict               | bool     |   optional    | If `true`, each cell must have a match, or row will be hidden
| sort_by              | col-id   |   optional    | Sort by column (see &lt;content&gt;), append '+' (ascending) or '-' (descending)
| max_rows             | int      |   optional    | Restrict the number of (shown) rows to this maximum number
| css                  | section  |   optional    | Adapt, extend the CSS-style of this flex-table instance
| clickable            | bool     |   optional    | Activates the entities' on-click popup dialog
| entities             | section  | **required**  | Section defining the entity *data sources* (see below)
| columns              | section  | **required**  | Section defining the column(s) (see below)
                      
                      
***2nd-level options: entity selection / querying / filtering***

| `entities`           | Type     | Required?     | Description
| ----                 | ----     | ------------- | -----------
| include              | regexp   | **required**  | Defines the initial entity data source(s)
| exclude              | regexp   |   optional    | Reduces the *included* data sources(s) 
                    

***2nd-level options: columns definition, each list-item defines a column***

| `columns`            | Type     | Required?     | Description
| ----                 | ----     | ------------- | -----------
| name                 | string   |   optional    | column header (if not set, &lt;content&gt; is used)
| icon                 | string   |   optional    | use `icon` inside header (left of `name`), typical `mdi:something` ([cheatsheet](https://cdn.materialdesignicons.com/4.5.95/))
| id                   | string   |   optional    | unique identifier e.g., to sort one of multiple equally referencing cells
| hidden               | bool     |   optional    | `true` to avoid showing the column (e.g., for sorting)
| modify               | string   |   optional*   | apply java-script code, `x` is data, i.e., `(x) => eval(<modfiy>)`
| align                | enum     |   optional    | text alignment, one of: `left`, `center`, `right` (default: `left`)
| prefix               | string   |   optional    | to be applied _before_ all cell contents 
| suffix               | string   |   optional    | to be appended _after_ all cell contents
|&nbsp;&lt;content&gt; |          | **required**  | see in `column contents` below, one of those must exist!

*Use `modify` with _caution_ and on your own risk only. This will directly execute code using `eval()`, which is by definition a safety risk. Especially avoid processing any third party APIs / contents with `flex-table-card` using the `modify` parameter, *only apply this parameter, if you are 100% sure about the contents and origin of the data.*

***2nd-level options: css adaptations***

| `css`                      | Type     | Required?     | Description
| ----                       | ----     | ------------- | -----------
| &lt;css_selector&gt;       | string   |   optional    | the original &lt;css_selector&gt; will be replaced with the this json value
| &lt;css_selector&gt;+      | string   |   optional    | &lt;css_selector&gt;'s contents are appended to the existing &lt;css_selector&gt;

`css` can contain arbitrary items, there is no checking or safety mechanism, means you can mess up your CSS-styles (of this specific flex-table card only). Providing a "+" at the end of the key translates to __appending__ the provided json-value to the (not necessarily) existing &lt;css_selector&gt;, omitting the "+" will always __replace__ the css-selector's contents. The current stock CSS style can be found here: [line 222](https://github.com/custom-cards/flex-table-card/blob/a5db6ee51c54240b64a304a33b452d87dc43e87f/flex-table-card.js#L222). The curly brackets are omitted, thus a &lt;css-selector&gt; and its assigned &lt;json-value&gt; always translate to: `<css-selector>: { <json-value> }`.
``` yaml
css: 
  /* remove borders from table (by appending 'border:0;' to its CSS */
  table+: "border: 0;"
  /* remove borders from table (but replace any other CSS statement for this selector (table) */
  table: "border:0;"
  /* complex selectors also work, as long as the json-key is in quotes */
  'tbody tr:nth-child(even)': 'background-color: #a2542f6;'
```

***3rd-level options: column (cell) content definition, one required and mutually exclusive***

| `column contents` | Type              | Description
| ---------------   | ----              | -----------
| attr              | regexp            | matches to the first attribute matching this regexp
| prop              | string            | matches the entity's state members, e.g. **state** (any from [here](https://www.home-assistant.io/docs/configuration/state_object/) )
| attr_as_list      | string            | matched attribute is expected to contain a list to be expanded down the table (see table 1, 2 and 3)
| multi             | list-of-2-strings | matches as the three above, but allows to select multiple different matches being concated using `multi_delimiter` see #19 for an example 
|                   |                   | on how to write yaml for this...
| multi_delimiter   | string            | defaults to ' ', which means `multi` will be concated together delimiting with a whitespace, change this to modify this behavior

**Examples**

- configuration of the contents is done by a two step approach
 
  - first the candidate **rows** have to be *queried* using 
    wildcarding/regular expressions, leading to a set of 
    entities (candidates)
  - eventually for each column a rule has to be given how 
    the matching should happen, matched e.g. attributes will 
    then be exposed as the contents of the row (cells)

``` yaml
type: custom:flex-table-card 
title: may be omitted, to be hidden

# 1st the **canidate** entities will be selected
entities:
  include: zwave.*
  exclude: zwave.unknown_node*

# 2nd, the *column contents* are defined, there are
# different ways to match contents:
columns:
  # example: match entity's attribute(s)
  - name: Column Header
    attr: receivedTS
    # extract only date from string
    modify: x.split("T")[0]
  - name: More Header
    attr: sendTS
  # example: match and show the given entity-property 
  #          e.g., the state (incl. any non-attr members)
  - name: Next Head
    prop: state
```

An extremly useful `flex-table-card` config: **List and sort all battery powered devices** and list them ascending by their battery level, so the next batteries to be replaced are always visible within the first row(s):

``` yaml
type: 'custom:flex-table-card'
sort_by: battery_level+
strict: true
title: Battery Levels
entities:
  exclude:
    - unknown_device
  include: zwave.*
columns:
  - attr: node_id
    name: NodeID
  - name: Name
    prop: name
  - attr: battery_level
    name: Reported Battery Level (%)
```

**Monitoring and identifying nodes, which are not communicating anymore** with the Z-Wave controller, can be extracted and also sorted according to their last sent/received message with the following config:

``` yaml
type: 'custom:flex-table-card'
max_rows: 25
#sort_by: sentTS- # <--- for last sent msg-based sorting
sort_by: receivedTS-
title: Durations Since Last Message (recv. & sent by node)
clickable: true   # <--- allows to click on row to show entity-popup for more information
columns:
  - attr: node_id
    name: NodeID
  - name: Name
    prop: name
  - attr: receivedTS
    modify: Math.round((Date.now() - Date.parse(x)) / 36000.) / 100.
    name: Recv. Age (h)
  - attr: sentTS
    modify: Math.round((Date.now() - Date.parse(x)) / 36000.) / 100.
    name: Sent Age (h)
entities:
  exclude:
    - zwave.unknown_device_*
    - zstick_gen5
  include: zwave.*
```

Further I also regulary have the need to 
transport, store and visualize non-trivial data
within the frontend, provided by appdaemon.

I use the **variable component**, which does 
simply nothing, despite providing an entity to be written
into from *appdaemon's* side via the set_variable() service.

To keep data ordered, passing a full (py-)list to the
service, leads to proper jsonification. But now we've done 
a reshape for the input data but luckily no problem. Nothing
more to adjust than to add a single keyword, with an obvious
naming:
  
``` yaml
type: custom:flex-table-card 
title: Fancy tabular data
# this matches then just the *variable component* entitiy
entities:
  include: variable.muell_tracker

# the columns are now similar, just with one match leading
# to severall lines being filled, check the screenshots:
columns:
  - name: Date
    attr_as_list: due_dates
  - name: Description
    attr_as_list: descriptions
```

A recuring pattern is a list of dicts (e.g., json objects). Using 
`attr_as_list` together with `modify`, one can select specifc 
json members, which then leads to multiple columns with the same 
`attr_as_list` param, just `modify` differs. The latter might be
unwanted if combined with `sort_by`, multiple columns would match
thus `sort_by` will simply not deliver expected behavior. Therefore
a column can additionally also have the `id` param which serves as
the unique (and overruling) identifier for any column reference. The
following example show-cases these concepts:

``` yaml
type: custom:flex-table-card 
title: List of json data nicely visualized
# the list shall be sorted by 'rating', a json member
sort_by: rating-
entities:
  # matching entity contains a list of json objects (dicts)
  include: sensor.items_with_details   

columns:
  - name: Name
    attr_as_list: details
    modify: x.name
  - name: Description
    attr_as_list: details
    modify: x.desc
  - name: Price
    attr_as_list: details
    modify: x.price
  - name: Rating
    attr_as_list: details
    # let's assume rating is just calculated from other members
    modify: 'x.price * x.available_pieces'
    # without adding `id` here the result would be not as expected 
    # (random? all sorted? nothing?)
    id: rating
```

Finally, an example for the newest `align`, `prefix`, `suffix` parameters:
``` yaml
title: Power Consumption (Top 20)
clickable: true
type: 'custom:flex-table-card'
max_rows: 30
sort_by: power_consumption-
columns:
  - attr: node_id
    name: NodeID
  - attr: power_consumption
    name: Power (W)
    suffix: u
    prefix: '>> '
    align: right
    modify: parseFloat(x)
  - name: Energy (kWh)
    prop: state
    modify: parseFloat(x).toFixed(1)
    align: center
entities:
  include: 'sensor.*_energy(_[0-9]+)?'
```
As usually the formatting and string manipulation parameters can be combined with all other already known ones, even with `modify`. Here it is important to know that `modify` will actually change the real contents of the cell, whilst `prefix` or `suffix` are applyied at the very end, so neither `prefix` nor `suffix` are taken into account for sorting. In contrast `modify` will alter the cell contents and will be applied before the sort takes place. 

Furthermore one can now set a text-alignment for each column, which also impacts the header, currently `left`, `center`, `right` can be set to obtain the expected results, if more is needed feel free to open an issue or discuss directly with me via discord or other channels.

**Current Issues / Drawbacks / Plans**

* add `json` column param that simply treats whatever is found as json data and will
	extract the given member(s), also a "modify" abstraction
* additional colunm *selector* for a service call maybe
* history / recorder access realization to match for historical data ...
* (click)-able sorting of columns   
* generally 'functions' might be a thing, a sum/avg/min/max ? but is the frontend the right spot for a micro-excel?
* there is **extreme need** for a seperate examples directory/examples.rd or similar... 

  * `multi` & `multi_delimiter` example is missing

