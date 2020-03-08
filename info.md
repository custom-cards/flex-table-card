# Flex Table Card - Flex Table - Highly customizable, Data visualization for [Home Assistant](https://github.com/home-assistant/home-assistant) Lovelace UI

## Usage Examples

* power consumption on one view for _all_ your devices (sorted by consumption)
* battery status for all devices at once, never forget replacing one
* clickable entity pop-ups (option), any number of rows/cols, icon support, full customizable CSS
* any tabular data can be visualized, formatted & modified

  * calendar data, shopping-lists, train arrivals, ... 

*example images pending, [check github until then](https://github.com/daringer/flex-table-card/)*


## Configuration

Flex Table Card comes with a vast amount of configurability, please visit the
[github page](https://github.com/daringer/flex-table-card/) for many more details, examples and
documentation.

Before we directly quick-start with a more complex table, here is a very basic configuration 
showing battery states, if available:

```yaml
type: 'custom:flex-table-card'
title: Battery Levels																
entities:
  include: zwave.*               /* simply try all entity_ids starting with 'zwave.*'   */
sort_by: battery_level+	         /* the ones without a battery will be automatically be */
strict: true                     /* be removed (`strict`)                               */
clickable: true                  /* on row-click show entity pop-up with details        */

columns:	                         /* start with (cell)content definition                 */
	- attr: node_id
	  name: NodeID                   /* we show two columns: "NodeID" and "Battery Level"   */
	- attr: battery_level            /* 'suffix' is automatically appended as formatting    */
		name: Battery Level
		suffix: ' %'
```

The following more advanced listing is to show all your devices with an attribute named `power_consumption`, 
sorted descending, just the top 10 power consumers, including various details:

```yaml
type: 'custom:flex-table-card'
entities:	                        /* 1st filter all entity_ids (+attributes) by */
  include: 'sensor.*_energy(_[0-9]+)?'  /* this (*)-regex, each match represents a row in flex-table  */

title: Power Consumption (Top 20)       /* set header/title (skip to hide)                         */
clickable: true                         /* make each row clickable to show the entity id's pop-up  */
sort_by: power_consumption-             /* sort column `power_cosumption` in descending order (-)  */
strict: true                            /* any column not containing any data (or null) is skipped */
max_rows: 20                            /* show a maximum of 20 rows                               */

columns:                                 /* now the column(s) configuration follows:                  */
  - attr: node_id                        /* any of 'attr', 'prop', 'attr_as_list' or 'multi' defines  */
    name: NodeID                         /* the _contents_ for this cell                              */
    align: center                        /* cell content alignment (defaults to 'left')               */
    icon: 'mdi:z-wave'                   /* include icon in header next to 'name'                     */

  - attr: power_consumption              /* as above an attribute is extracted from the row-entity    */
    name: Power
    align: right                        
    modify: parseFloat(x)                /* modify the cell-contents using js, number conversion         */
    suffix: ' W'                         /* as the name suggest: "what to append" as opposed to 'prefix' */

  - prop: state                          /* pure entity-properties can also be referenced                */
    name: Energy                        
    modify: parseFloat(x).toFixed(1)     /* ensure consistent and professional look                      */
    align: right                        
    suffix: ' kWh'
```

* * *
