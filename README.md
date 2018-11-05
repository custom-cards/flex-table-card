# Flex Table

Flex table aims for more flexibility for tabular-ish visuallization
needs, by realizing:

- unlimited columns / rows 
- various different data-sources may be used in a single table
- higher level of abstraction for content selection

Flex Table gives you the possibility to visualize any tabular data
within Lovelace. Especially for overview views high data density
can be easily realized, see Screenshots:

![showing an example how appdaemon collected data might be visualized](https://github.com/daringer/image_dump/raw/master/todos_and_garbage_collection.png.small.png)
![example showing **all** *power_consumption* entities including drain in one table](https://github.com/daringer/image_dump/raw/master/id_drain_power.png.small.png)
![example showing **all** *power_consumption* entities including drain in one table](https://github.com/daringer/image_dump/raw/master/id_drain_power.png.small.png)
![listing all zwave nodes and their respective last sent/received message (sorting needed :D)](https://github.com/daringer/image_dump/raw/master/zwave_last_msg_fromto.png.small.png )

**Options**

| Name           | Type    | Default       | Description
| ----           | ----    | -------       | -----------
| type           | string  | **required**  | `custom:flex-table-card`
| title          | string  | optional      | a title for the card
| strict         | bool    | optional      | if true, each cell must have a match, or the full row will be hidden
| entities       | section | **required**  | Section defining the entity *data sources*
| - include      | regexp  | **required**  | Defines the initial entity data source(s)
| - exclude      | regexp  |   optional    | Reduces the *included* data sources(s) 
| columns        | section | **required**  | section defining the number and contents for each cell
| - name         | string  |   optional    | Column header, may be omitted
| - attr         | regexp  | - required  - | matches to the first attribute found by this regex
| - prop         | string  | - is any of - | matches the entities object memebers, e.g. **state**
| - attr_as_list | string  | - those 3   - | the matched attribute is expected to contain a 
|                |         |               | list to be expanded down the table (see pic 1 + 2)

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
	
	# first the **canidate** entities will be selected
	entities:
	  include: zwave.*
		exclude: zwave.unknown_node*

	# secondly, the *column contents* are defined, there are
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
* hiding columns, to allow sorting of un-natural contents (e.g., dates)
* (click)-able sorting of columns 
* entity dialog box activiation on row-click
* find out if cards are allowed to span more width, and if how?
* introduce 'max_rows' to show only the most significant (top-ordered) ones
* some 'format' or 'filter' would also be nice to post-process data 
  (maybe bad within the frontend :/)
* generally 'functions' might be a thing, a sum/avg/min/max ? but is the
  frontend the right spot for a micro-excel?
* history / recorder access realization to match for historical data ...
