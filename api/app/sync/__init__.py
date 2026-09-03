"""Sync Excel → SQLite (Fase 2).

Los Excel maestros (vales/pedidos) se leen en SOLO LECTURA, se copian a un
archivo temporal local y sus hojas se guardan como JSON en las tablas
`sync_*` de users.db. Los getters de `app/services/excel.py` leen esas
tablas cuando `USE_SYNC_TABLES=true` (con fallback al Excel en vivo).

NUNCA se escribe en los Excel origen (regla de oro, especialmente
BD_ALMACEN_3P.xlsx).
"""
