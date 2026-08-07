# Stub local de CJ_OS Core API

Servidor ligero escrito en Python puro (sin dependencias externas) para probar el portal `/dashboard` del sitio web sin necesidad de tener el backend real de CJ_OS.

## Uso

1. Asegúrate de tener `.env.local` configurado:

```env
VITE_API_BASE_URL=http://localhost:8000
```

2. Inicia el stub:

```bash
python scripts/api-stub/server.py
```

3. En otra terminal, inicia el frontend:

```bash
npm run dev
```

4. Accede a `http://localhost:5173/login` y usa:

- Usuario: `admin`
- Contraseña: `admin123`

## Notas

- Este stub **no** reemplaza al backend real de CJ_OS Core.
- Devuelve datos de ejemplo con la misma estructura documentada en `docs/guias/API-CJ-OS-CORE.md`.
- Acepta cualquier token JWT válido generado por él mismo; no hace validación real.
- Cuando el backend real esté disponible, solo cambia `VITE_API_BASE_URL`.
