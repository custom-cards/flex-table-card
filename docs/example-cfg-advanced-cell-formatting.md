## Examples - Advanced Cell Content Formatting & Modification

**Monitoring and identifying nodes, which are not communicating anymore** with
the Z-Wave controller, can be extracted and also sorted according to their last
sent/received message with the following config:

``` yaml
type: 'custom:flex-table-card'

# restrict the number of rows to display to 25 
# happens AFTER any sorting, formatting, modification
max_rows: 25

# sort data by 'receivedTS' in descending order
#sort_by: sentTS-
sort_by: receivedTS-

title: Durations Since Last Message (recv. & sent by node)

# make every cell/row 'clickable': show entity-popup for more entity details
clickable: true   

entities:
  exclude:
    - zwave.unknown_device_*
    - zstick_gen5
  include: zwave.*

columns:
  # 1st + 2nd column are <NodeID> + <NodeName>, remember to set 'name' for a 
  # human-readable / fancy header content
  - name: NodeID
  	data: node_id
  - name: Name
    data: name

  # 'receivedTS' and 'sentTS' are strings like: '2020-12-24 00:40:57:758'
  # using 'modify' and a JavaScript expression the strings can be converted to
  # hours using 'Date.parse' and friends
  - data: receivedTS
    modify: Math.round((Date.now() - Date.parse(x)) / 36000.) / 100.
    name: Recv. Age (h)
  - data: sentTS
    modify: Math.round((Date.now() - Date.parse(x)) / 36000.) / 100.
    name: Sent Age (h)
```

Using `modify` virtually any operation on cell data is possible. Clearly the
trade-off is the increased configuration uglyness, which buys us well 
parsed and based on this parsed, then generated data.

\<example table cell content formatting\>

[Return to main README.md](../README.md)
