# Scripts

## Activos
- `inventario-snapshot-daily.ps1` — snapshot diario de valor de inventario (tarea programada `3P-Inventario-Snapshot-Diario`).
- `register-snapshot-task.ps1` — registra la tarea programada del snapshot.
- `deploy/` — scripts de publicación a GitHub Pages (`PUBLICAR_3P_WEBSITE.bat`, `PUBLICAR_AUTOMATICO.ps1`, `PUBLICAR_RAPIDO.ps1`, `deploy-to-github.ps1`).

## `legacy/` — un solo uso, conservados por si se reutilizan
- Editor GLB / coloreado de modelos 3D (`add-color-to-glb.js`, `color-glb.bat`, `color-glb-simple.cjs`, guías y su `package.json` con deps).
- Extracción de imágenes de PDFs (`extract-images.cjs`, `extract-pdf-images.cjs`, `extract-puppeteer.cjs`, `read-pdf.cjs`).
- `screenshot-dashboard.cjs` — capturas del dashboard.
- `update-logo.py` — actualización puntual del logo.
- `api-stub/` — servidor stub viejo, reemplazado por el backend real en `api/`.
