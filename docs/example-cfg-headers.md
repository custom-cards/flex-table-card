## Examples - Column Header Contents

<!-- [full text section] -->

The displayed column header contents are choosen from the following, whatever
is found first will be considered the column header and no further search will
be conducted.

* explicitly set header: `columns::name` 
* identifier: `columns::id`
* content matcher string: `columns::attr`, `columns::prop` or `columns::attr_as_list`

Removing the header(s) is currently not supported, but you can empty the contents
simply by setting `name` to an empty string: "".

The alignment of the headers is derived from the cell contents, means that an
`align` option within the column cell content will also affect the header's 
alignment accordingly.

Furthermore an icon can be added. This is simply done by setting the option:
`icon` to the well known `mdi:my_icon_desc` icon identifier string.

<!-- [listing section] -->
```yaml

type: custom:flex-table-card 
max-rows: 10
entities:
  include: zwave.*

columns:
  # add explicit column header: 'Aha Column'
  - name: Aha Column
    attr: node_id
  # derived from 'id' option within 'columns'
  - id: my-col-id
    attr: node_id
  # derived from (attr) cell content matcher name, here: 'node_id'
  - attr: node_id
  # fancier header using explicit text, icon, data-conversion. right text alignment
  - name: NodeID
    attr: node_id
    icon: mdi:z-wave
    align: right

  # add another column using header: 'More Header'
  - name: More Header
    # match entity's attr(ibute) using (regex) 'sendTS'
    attr: sendTS

  # one more column, header: 'Next Head'
  - name: Next Head
    # use entity's 'state' as content 
    # (entity states are accessed via (prop)erties)
    prop: state
```

<!-- [example image section] -->
<!-- use issue #29 for dumping images and link them here -->
![image description](http://url/to/img.png)

[Return to main README.md](../README.md)
