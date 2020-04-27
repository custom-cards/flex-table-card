## Examples - Simple Cell Content Formatting

To render your table according to your needs `flex-table-card` provides
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
or `strict`.  Whilst 'modify' *will* actually alter the cell contents
**before** `sort_by` or `strict` are processed.

Another detail worth mentioning is that `align` does *also* affect the column's
header and not only the contents, if your needs differ, please use `css` instead.

[Return to main README.md](../README.md)
