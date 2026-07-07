# Table Canvas Sync Spec

## Source of truth

Zustand store owns:
- spaces
- selectedSpaceId
- camera
- settings
- demoMode/demoCells

## Required sync

Table → Canvas:
- name changes label
- area changes radius
- category/privacy changes style
- add/delete rows update cells

Canvas → Table:
- drag position persists
- selection can highlight row

View switch:
- no reset
- no sample regeneration if spaces exist
- camera persists
- settings persist
