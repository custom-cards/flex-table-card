# Flex Table

Flex table aims for more flexibility for tabular-ish visuallization
needs, by realizing:

- unlimited columns / rows 
- various different data-sources may be used in a single table
- higher level of abstraction for content selection

Flex Table gives you the possibility to visualize any tabular data
within Lovelace. Especially for overview views high data density
can be easily realized, see Screenshots:

![3 columns, sorted by last sent message, best for network and node diagnosis, only 20 rows shown](https://github.com/daringer/image_dump/raw/master/tbl1.png)
![2 (3) columns, one is hidden (see table 1) to sort with, restricted to 20 rows allows cross-table-layout-alignment](https://github.com/daringer/image_dump/raw/master/tbl2.png)
![all power & energy reporting nodes, sorted by current power consumption, restricted to 20 rows, top consumer always directly visible](https://github.com/daringer/image_dump/raw/master/tbl3.png)
![trash collection dates, simple example, gets updates from appdaemon](https://github.com/daringer/image_dump/raw/master/trash_tbl.png)

**Options**

| Name           | Type     | Default       | Description
| ----           | ----     | -------       | -----------
| type           | string   | **required**  | `custom:flex-table-card`
| title          | string   |   optional    | a title for the card
| strict         | bool     |   optional    | if true, each cell must have a match, or the full row will be hidden
| sort_by        | col-attr |   optional    | sort flex-table by the given column (attr), append '+' or '-' for ascending or descending
| max_rows       | int      |   optional    | restrict the number of (shown) rows to this maximum number
| entities       | section  | **required**  | Section defining the entity *data sources*
| - include      | regexp   | **required**  | Defines the initial entity data source(s)
| - exclude      | regexp   |   optional    | Reduces the *included* data sources(s) 
| columns        | section  | **required**  | section defining the number and contents for each cell
| - name         | string   |   optional    | Column header, may be omitted
| - hidden       | bool     |   optional    | set to 'true' to avoid showing the colum in the frontend (e.g., for sorting)
| - modify       | string   |   optional    | apply given java-script code to data, `x` is data, i.e., `(x) => eval(<modfiy>)`
| - attr         | regexp   | - required  - | matches to the first attribute found by this regex
| - prop         | string   | - is any of - | matches the entities object memebers, e.g. **state** (any from here: [here](https://www.home-assistant.io/docs/configuration/state_object/) )
| - attr_as_list | string   | - those 3   - | the matched attribute is expected to contain a 
|                |          |               | list to be expanded down the table (see table 1, 2 and 3)

**Example**

- configuration of the contents is done by a two step approach
 
  - first the candidate **rows** have to be *queried* using 
	  wildcarding/regular expressions, leading to a set of 
		entities (candidates)
  - eventually for each column a rule has to be given how the
	  matching should happen, matched e.g. attributes will then 
		be exposed as the contents of the row (cells).

```yaml
- type: custom:flex-table-card 
  title: may be omitted, to be hidden

  # 1st the **canidate** entities will be selected
  entities:
    include: zwave.*
    exclude: zwave.unknown_node*

  # 2nd, the *column contents* are defined, there are
  # different ways to match contents:
  columns:
    # example: match in entity attributes
    - name: Column Header
      attr: *.receivedTS
    - name: More Header
      attr: *.sendTS
    # example: match and show the sone entity-property 
    #          e.g., the state (incl. any non-attr members)
    - name: Next Head
      prop: state
```

Further I also regulary have the need to 
transport, store and visualize non-trivial data
within the frontend, provided by appdaemon.

I use the **variable component**, which does 
simply nothing, despite providing an entity to be written
into from *appdaemon's* side via the set_variable() service.

To keep data ordered, passing a full (py-)list to the
service, leads to proper jsonification. But now we've done 
a reshape for the input data but luckily no problem. Nothin
more to adjust than to add a single keyword, with an obvious
naming:

```yaml
- type: custom:flex-table-card 
  title: Fancy tabular data
  # this matches then just the *variable component* entitiy
  entities:
    include: variable.muell_tracker

  # the columns are now similar, just with one match leading
  # to severall lines being filled, check the screenshots:
  columns:
    - name: Date
      attr_as_list: *.due_dates
    - name: Description
      attr_as_list: *.descriptions
```

**Current Issues / Drawbacks / Plans**

* additional colunm *selector* for a service call maybe
* (click)-able sorting of columns 
* entity dialog box activiation on row-click
* find out if cards are allowed to span more width, and if how?
* some 'format' or 'filter' would also be nice to post-process data (maybe bad within the frontend :/)
* generally 'functions' might be a thing, a sum/avg/min/max ? but is the frontend the right spot for a micro-excel?
* history / recorder access realization to match for historical data ...
