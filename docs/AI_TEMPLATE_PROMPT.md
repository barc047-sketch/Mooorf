# AI Template Prompt (V4.5B)

User-facing prompt below the line — paste it into Gemini / Claude / ChatGPT / NotebookLM together with your project brief to generate ZONUERT-ready tables. Output format matches [IMPORT_TEMPLATE_SPEC.md](IMPORT_TEMPLATE_SPEC.md).

---

You are generating a spatial program dataset for ZONUERT, a space-program visualization tool. From my project brief, produce SIX tables named exactly: **PROJECT, FLOORS, SPACES, RELATIONSHIPS, FLOWS, CATEGORIES**.

**Format rules (strict):**
- Use the exact headers below, in this order. No extra columns, no merged cells, no markdown formatting (bold/links/bullets) inside cells, no decorative prose inside cells.
- Numbers are plain numerics — `area` is a number only, never "120 sqm".
- Use short codes: category = PUB, SPB, SPR, PRI, SER, UTL, RET, ADM, CIR, OUT, TEC, EMG, EDU, HLT, FNB, STO. Privacy = P0 (public), P1 (semi-public), P2 (semi-private), P3 (private), P4 (restricted), P5 (service-only). Relationship type = S3 (strong), S2 (medium), S1 (weak), AV (avoid), CF (conflict), DEP (dependent), ADJ (adjacent), VIS (visual), ACC (direct access).
- Every space MUST have `floor_id`, `category`, and `privacy`.
- All ids must be unique. RELATIONSHIPS and FLOWS reference spaces by their `id`.

**Headers:**
- PROJECT: `field,value` — rows for project_name, typology, location_country, location_state, location_city, authority, site_area, site_area_unit (sqm or sqft), total_built_up_area, floors_count, road_width, land_use.
- FLOORS: `id,name,level,elevation,area_target,visible,locked,notes` (level: 0 = ground, -1 = basement, 1 = first…).
- SPACES: `id,parent_id,floor_id,code,name,area,unit,category,privacy,zone,user_group,priority,shape,color,gradient_from,gradient_to,x,y,locked,visible,notes` (leave x, y, color, gradients empty — the app fills them).
- RELATIONSHIPS: `id,from,to,type,strength,access,avoid,conflict,notes`.
- FLOWS: `id,name,flow_type,start,end,via,intensity,color,speed,notes` (flow_type: visitor/staff/service/goods/emergency; via = semicolon-separated space ids).
- CATEGORIES: `code,name,color,gradient_to,default_privacy,legend_order,description` — output this sheet ONLY if my brief needs non-default categories; otherwise write "DEFAULT".

**Content rules:**
- Realistic architectural program: sensible areas, service/technical spaces included, circulation and toilets not forgotten, basement for parking/plant where appropriate.
- Balance categories (public, private, service, circulation, admin, utility) to the brief's typology.
- After the tables, list any assumptions or data you could not derive as a separate **VALIDATION NOTES** section — never inside table cells.

---

*App-side note: generated tables import via the (future) XLSX/CSV importer; validation per `src/domain/graph/import-contract.ts`.*
