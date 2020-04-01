## Examples - Attribute as List (`attr_as_list`)

I regulary have the need to transport, store and visualize non-trivial data
to the frontend, provided by appdaemon or other sources not represented 
within regular entities.

I use the [variable
component](https://github.com/snarky-snark/home-assistant-variables) to create
initially empty entities. These can be filled with content using
the`set_variable()` service.

To keep data ordered, passing a full (py-)list to the service, leads to proper
jsonification. Using the `attr_to_list` content matcher within `columns` will 
expand this list to a row for each item:
  
``` yaml
### warning: 
###   this snippet will not work without 3rd party components
###   and configurations!

type: custom:flex-table-card 
title: Fancy tabular data

# this matches just the *variable component* entitiy
entities:
  include: variable.muell_tracker

# the columns are now similar, just with one match leading
# to severall lines being filled:
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
### warning: 
###   this snippet will not work without 3rd party components
###   and configurations!

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
    # without adding `id` here the sorting would be not as expected 
    id: rating
```

[Return to main README.md](../README.md)
