## Examples - Basics

Configuration of `flex-table-card` is done by a two step approach:

  - first the candidate **rows** have to be *queried* using 
    wildcarding/regular expressions, leading to a set of 
    entities (candidates)
  - for each **column** a rule has to be given how 
    the matching should happen, matched e.g. attributes will 
    then be exposed as the contents of the row (cells)

All (configuration) listings to be found within this documentation are valid 
in terms of syntax and copy & paste ready to be used as starting point for your
own configuration.

Let's start with a basic example and short descriptions for each config option:

``` yaml
# mandatory to define a flex-table-card config section
type: custom:flex-table-card 

# the card title, shown if option is set, otherwise no title is shown
title: may be omitted, to be hidden

# 1st the **canidate** entities will be selected
entities:
  # match all entity_ids starting with 'zwave.*'
  include: zwave.*
  # exclude entity_ids starting with 'zwave.unknown_node*'
  exclude: zwave.unknown_node*

# 2nd the *column contents* are defined, there are
# different ways to match contents:
columns:
  # add column using header: 'Column Header'
  - name: Column Header
    # match entity's attribute using 'receivedTS' 
    data: receivedTS

  # add another column using header: 'More Header'
  - name: More Header
    # match entity's attribute using 'sendTS'
    data: sendTS

  # one more column, header: 'Next Head'
  - name: Next Head
    # use entity's 'state' as content 
    # (entity states are accessed also via data (even if not directly within its attributes))
    data: state
```

This configuration will lead to a 3 column wide table with the rows being 
equal to all entities matched within the `entities` section. 

It is also possible to use multiple `include` and `exclude` filters,
simply use both optionally as a list of strings:
```
type: custom:flex-table-card
title: multiple includes and excludes example
entities:
  include: 
    - sensor.*
    - binary_sensor.foo
  exclude:
    - sensor.unwanted_sensor_id 
    - sensor.more_unwanted
```
In order for an entity to get included, **any** `include` expression is sufficient for inclusion. 
To be excluded from the entity set, only **one** `exclude` expression match is required.


[Return to main README.md](../README.md)
