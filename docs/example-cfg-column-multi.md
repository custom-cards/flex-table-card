## Examples - DEPRECATED - Multi-Content Selection

**deprecated: no need to use `multi` anymore, just comma-separate the selectors in `data` as 
[shown here](example-cfg-data.md)**

<!-- [full text section] -->
To have multiple attributes or generally data items within the cells of a given
column, `flex-table-card` provides `multi` as a cell content matcher.

As to be seen in the following listing, the *yaml* notation is by far not pretty
due to the needed *list-of-list-of-(2)-strings* within `multi`. *yaml* in fact
supports both notations, but mostly converts to the first one, converting it to
not-really-human-friendly.

<!-- [listing section] -->
```yaml
type: 'custom:flex-table-card'
title: Power Consumption (Top 10)
entities:
  include: 'sensor.*_energy(_[0-9]+)?'
columns:
  - data: node_id
    name: NodeID
  - data: power_consumption
    name: Power
  - data: state
    name: Energy

  - name: My Multi-Item-Field
    # the default 'multi_delimiter' is a whitespace: ' '
    multi_delimiter: ','
    # match 'attr: node_id', 'attr:power_consumption' and 'prop:state' into each
    # cell and concat all using the previously defined: 'multi_delimiter' 
    multi:
      - - attr
        - node_id
      - - attr
        - power_consumption
      - [prop, state]
```

<!-- [example image section] -->
<!-- use issue #29 for dumping images and link them here -->
<!-- ![image description](http://url/to/img.png) -->

[Return to main README.md](../README.md)
