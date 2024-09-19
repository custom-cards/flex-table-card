## Examples - Column Data Selector 

<!-- [full text section] -->

### Generic 
`data` serves as the content selector for the respective column. It behaves smart in terms of what 
is actually selected as data to be shown within each cell. In particular the following rules apply
for the assigned value of `data`:

* `name` = *friendliest name* will be selected
* `object_id` = full entity *path* without domain
* `icon` = renders the entity's current icon (`entity.attributes.icon`) into the cell
* `device` = name of the device that the entity belongs to, if available
* `area` = name of the area that the entity or its device is assigned to, if available
* `_state`= is a *hack* to be able to select `entity.attributes.state` as data
* any `key in this.entity` (e.g., `entity_id`, `state`, ...)
* otherwise a key within `this.entity.attributes` will be assumed 

When accessing attributes, sometimes an attribute object will itself contain objects.
In that case, you can access the lower object using dotted notation.  eg: object1.object2.field1

If the chosen `data` selector does not resolve to something useful, the
cell will be marked with an error - collection/rendering should continue w/o any 
issues. 

**Row expansion from a list** will be automatically applied (by testing the selected data 
for being an `Array.isArray()`). 

**Multiple, different selectors can be used** for a single column data selection by just separating 
each one using a comma `,`. If multiple selectors are used the resulting data is concatenated using 
`multi_delimiter`, which defaults to a whitespace ' '.

Note that even if a `device` or an `area` is defined for an `entity`, it may not be available for `flex-table` to display.

### Migration from versions < 0.7
Since version 0.7 the old selectors (`attr`, `prop`, `attr_as_list`, `multi`) are all replaced by
`data`, which is a don't care & drop-in replacement for the old selectors. In particular `attr`, 
`prop` and `attr_as_list` can be transitioned one-to-one, just replace `attr`, `prop` or 
`attr_as_list` with `data` and things will be selected identically. 

Only `multi` needs minor adaptations, the previously used list-of-string-pairs shall now be noted as a 
comma delimited list instead. So e.g.,

```yaml
multi:
  - - attr
    - node_id
  - - attr
    - power_consumption
```

shall now be written as:

```yaml
data: node_id,power_consumption
```
<!-- [listing section] -->
### Full example
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
  - data: node_id,power_consumption,node_id
    name: My Multi-Item-Field
    # the default 'multi_delimiter' is a whitespace: ' '
    multi_delimiter: ','
```

<!-- [example image section] -->
<!-- use issue #29 for dumping images and link them here -->
<!-- ![image description](http://url/to/img.png) -->

[Return to main README.md](../README.md)
