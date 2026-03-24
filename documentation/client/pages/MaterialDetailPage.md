[🏠 Home](../../README.md) · [↑ Client](../README.md)

---

# client/src/pages/MaterialDetailPage.jsx

## What is this file?

The **material detail page** at `/materials/:id`. Shows the full details of a single material including:

- Stock level with a progress bar (turns red when low)
- A metric bar with 4 figures: in-stock quantity, cost per unit, low-stock threshold, and estimated stock value
- A details grid with all fields (type, colour, SKU, supplier, description, etc.)
- A record info card at the bottom (created/updated timestamps)

## Parameters

Reads `id` from the URL via `useParams()`.

## Key features

- **Low stock alert:** A warning banner appears above the metric bar if stock is below the threshold
- **Linear progress bar:** A fill-bar shows stock level compared to 4× the threshold (turning red when critical)
- **Edit button:** Opens `MaterialFormModal` in edit mode

## State

| Variable | Description |
|---|---|
| `material` | The loaded material record |
| `materialTypes` | All types (needed by the edit modal) |
| `loading` | Whether data is loading |
| `error` | Error message if loading fails |
| `editOpen` | Whether the edit modal is open |

## Key functions

### `load()`
Fetches two things in parallel:
1. `GET /api/materials/:id` — the material record
2. `GET /api/material-types` — all types (needed by the edit form)

### `handleSave(form)`
Calls `PUT /api/materials/:id` and reloads the page after success.

## Unit labels

The file contains a local `UNIT_LABELS` map that converts database unit codes (`mm`, `cm2`, `piece`, etc.) to human-readable labels (`mm`, `cm²`, `pcs`).

## Relationship to other files

- Uses `MaterialFormModal`: [components/modals/MaterialFormModal.jsx](../components/modals/MaterialFormModal.md)
- Uses `RecordInfo`: [components/common/RecordInfo.jsx](../components/common/RecordInfo.md)
- Uses `DetailRow`: [components/common/DetailRow.jsx](../components/common/DetailRow.md)
- API docs: [server/routes/materials.md](../../server/routes/materials.md)
