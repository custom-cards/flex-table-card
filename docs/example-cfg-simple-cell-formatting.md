## Examples - Simple Cell Content Formatting

To use Home Assistant's default formatting for all state and attribute values, use `auto_format`:

``` yaml
type: custom:flex-table-card
entities:
  include: sensor.outdoor_sensor_air_temperature
auto_format: true
columns:
  - name: Outdoor Temperature
    data: state
```

Output:

| Outdoor Temperature |
| ------------------- |
| 64 °F               |

Values will be formatted using their display precision and unit of measurement, if defined.

You can combine auto and manual (or no) formatting. When using auto formatting, disable auto
formatting for a single column by adding `no_auto_format` to the column definition:

``` yaml
type: custom:flex-table-card
auto_format: true
entities:
  include: climate.downstairs
columns:
  - name: Name
    data: name
  - name: Min. Temp.
    data: min_temp
    suffix: " °C"
    no_auto_format: true
  - name: Max. Temp.
    data: max_temp
    suffix: " (hot!)"
```

Output:

| Name       | Min. Temp. | Max. Temp.   |
| ---------- | ---------- | ------------ |
| DOWNSTAIRS | 44.5 °C    | 95 °F (hot!) |


To manually format your table according to your needs, `flex-table-card` provides
several content formatting configurations allowing simple tweaking of the
displayed cell contents:

``` yaml
type: 'custom:flex-table-card'
title: Power Consumption (Top 20)
clickable: true
max_rows: 30
sort_by: power_consumption-
entities:
  include: 'sensor.*_energy(_[0-9]+)?'

columns:
  - data: node_id
    name: NodeID

  - data: power_consumption
    name: Power
    # append suffix' value to all cells ('W' as unit)
    suffix: W
    # prepend prefix' value to all cells 
    # ('>> ' just a random string for demonstration purposes)
    prefix: '>> '
    # align the contents of the cell, one of: 'left', 'center', 'right'
    align: right
    # to allow proper numbers-aware (default data-type is string) sorting use:
    modify: parseFloat(x)

  - name: Energy (kWh)
    data: state
    # more advanced data parsing to a float using a fixed number of decimals
    modify: parseFloat(x).toFixed(1)
    align: center
```

The formatting and string manipulation options can be combined with any other
formatting options, even with `modify`.  Formatting a cell using `align`,
`prefix`, `suffix` does not alter the cell contents for options like `sort_by`
or `strict`.  Whilst `modify` and `auto_format` *will* actually alter the cell 
contents **before** `sort_by` or `strict` are processed.

[Return to main README.md](../README.md)
