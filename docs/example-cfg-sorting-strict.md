## Examples - Sorting and *Strict* Row Visibility

An extremly useful `flex-table-card` config: <br/>**List and sort all battery
powered devices** by their battery level, so the next batteries to be
replaced are visible within the first row(s):

``` yaml
type: 'custom:flex-table-card'

# use the column's attr(ibute) as reference for the column to be sorted
# the '+' explicitly sets ascending order, '-' sets descending order 
sort_by: battery_level+

# ensure that only rows are diplayed, which do have matched and valid contents
# within all(!) columns, means if the attr(ibute) 'battery_level' does not 
# exist within an entity, the entity and thus the row will not be displayed.
strict: true
title: Battery Levels

entities:
  # both 'include' and 'exclude' can either been set to a single (regex) string
  # or to a list-of (regex) strings
  exclude:
    - unknown_device
  include: zwave.*

columns:
  - name: NodeID
    data: node_id
  - name: Name
    data: name
  - name: Reported Battery Level (%)
    data: battery_level
```

[Return to main README.md](../README.md)
