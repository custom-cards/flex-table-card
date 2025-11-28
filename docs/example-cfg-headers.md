## Examples - Column Header Contents

<!-- [full text section] -->

The displayed column header contents are choosen from the following, whatever
is found first will be considered the column header and no further search will
be conducted.

* explicitly set header: `columns::name` 
* identifier: `columns::id`
* content matcher string: `columns::data`

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
max_rows: 10
entities:
  include: zwave.*
freeze_row: 0 #Header will be freezed during scrolling down to table. 0 means header row but any row can be freezed eg. freeze_row: 8. 
columns:
  # add explicit column header: 'Aha Column'
  - name: Aha Column
    data: node_id
  # derived from 'id' option within 'columns'
  - id: my-col-id
    data: node_id
  # derived from (data) cell content matcher name, here: 'node_id'
  - data: node_id
  # fancier header using explicit text, icon, data-conversion. right text alignment
  - name: NodeID
    data: node_id
    icon: mdi:z-wave
    align: right

  # add another column using header: 'More Header'
  - name: More Header
    # match entity's attr(ibute) using (regex) 'sendTS'
    data: sendTS

  # one more column, header: 'Next Head'
  - name: Next Head
    # use entity's 'state' as content 
    # entity states are accessed via data (even if not within attributes)
    data: state
```

<!-- [example image section] -->
<!-- use issue #29 for dumping images and link them here -->
![image description](http://url/to/img.png)

[Return to main README.md](../README.md)
