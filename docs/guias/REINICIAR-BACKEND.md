# Cómo reiniciar el backend de 3P

## El problema

El backend (`uvicorn.exe`) se ejecuta a través de la **tarea programada** `3P-Website-Backend` de Windows. Esa tarea está configurada para correr con **privilegios elevados** (`RunLevel: Highest`), por lo que el proceso `uvicorn.exe` termina corriendo con nivel de integridad **Alto**.

Kimi / la terminal de Bash corre con nivel de integridad **Medio** (usuario normal). Windows no permite que un proceso Medio mate un proceso Alto, por eso los comandos automáticos desde Kimi fallan con:

```
Stop-Process : No se puede detener el proceso "uvicorn" debido al error siguiente: Acceso denegado
```

Cuando se lanza `Start-Process powershell -Verb runAs`, Windows muestra el diálogo de UAC en el escritorio. Si se confirma, el reinicio funciona; si no se ve o se cancela, falla. **No es confiable hacerlo 100 % automático desde Kimi** porque requiere interacción del usuario con el diálogo de seguridad de Windows.

## Métodos confiables para reiniciar

### Método 1 — PowerShell como administrador (recomendado)

1. Presiona la tecla Windows y escribe `PowerShell`.
2. Haz clic derecho en **Windows PowerShell** → **Ejecutar como administrador**.
3. Acepta el diálogo de UAC.
4. Pega y ejecuta:

```powershell
cd "C:\Projects\PAGINA WEB 3P\api\tools"
.\restart-backend.ps1
```

5. Espera el mensaje `Backend iniciado.`

### Método 2 — Administrador de tareas

1. Presiona `Ctrl + Shift + Esc`.
2. Busca `uvicorn.exe` en la pestaña **Procesos**.
3. Clic derecho → **Finalizar tarea**.
4. La tarea programada `3P-Website-Backend` lo levantará automáticamente en unos segundos (tiene un delay de 1 minuto aproximadamente).

### Método 3 — Reiniciar la computadora

Las tareas programadas se ejecutan al iniciar sesión. Si no hay prisa, reiniciar la PC es el método más limpio.

## Cómo verificar que reinició

Desde Kimi o PowerShell:

```powershell
tasklist | findstr uvicorn
```

El **PID debe cambiar** después del reinicio. También se puede consultar:

```powershell
curl https://api.3psadecv.com/health
```

Debe responder `{"status":"ok"}`.

## Cómo saber si el backend tiene el código nuevo

Después de reiniciar, revisa la fecha/hora del proceso:

```powershell
Get-Process uvicorn | Select-Object Id, StartTime
```

Si `StartTime` es posterior a la última modificación de código, el backend está corriendo con la versión nueva.

## Nota para cambios futuros

Siempre que se modifique un archivo de `api/app/...` (backend), es necesario reiniciar `uvicorn` para que cargue los cambios. Los cambios de frontend (`src/...`) solo requieren `npm run build` y `npm run deploy`.

## Configuración actual de la tarea programada

- **Nombre:** `3P-Website-Backend`
- **Acción:** ejecutar `powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File "C:\Projects\PAGINA WEB 3P\api\tools\start-backend-hidden.ps1"`
- **Usuario:** `VENTAS-3P\Ventas-3P`
- **Nivel de ejecución:** `Highest` (administrador)
- **Comportamiento con múltiples instancias:** `IgnoreNew` (no inicia una nueva si ya hay una corriendo)

Por eso, si el proceso viejo no se mata primero, la tarea programada no inicia una nueva instancia.
