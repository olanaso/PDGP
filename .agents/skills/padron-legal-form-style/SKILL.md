---
name: padron-legal-form-style
description: "Estilo visual y de botones para todos los formularios nuevos dentro de un proyecto, replicando el patrón de Padrón Legal (PadronLegalForm.tsx). Aplica a cualquier formulario nuevo con títulos rojos por sección, labels alineados a la derecha en grid 180px/1fr, inputs compactos h-8 text-[12px], tab rojo superior, y footer con botones Cancelar/Guardar con iconos lucide-react."
---

# Estilo de formularios — Padrón Legal

Referencia canónica: `src/components/PadronLegalForm.tsx`. Todos los formularios nuevos dentro de un proyecto siguen este patrón.

## Tokens

```tsx
const RED = "#dc2626";
const inputCls = "h-8 px-2 text-[12px] border border-gray-300 rounded w-full bg-white focus:outline-none focus:border-gray-500";
const selectCls = inputCls + " appearance-none bg-white";
```

## Estructura

```tsx
<div className="bg-white rounded border">
  <div className="px-5 py-5">
    {/* Tab activo */}
    <div className="border-b mb-3">
      <div className="inline-block px-3 py-1.5 text-[12px] font-medium border-b-2"
           style={{ borderColor: RED, color: RED }}>
        {NombreFormulario}
      </div>
    </div>

    {/* Secciones */}
    <SectionTitle>Nombre sección</SectionTitle>
    <div className="grid grid-cols-2 gap-x-6 gap-y-2">
      <Field label="Etiqueta" required>
        <input className={inputCls} />
      </Field>
      {/* ... */}
    </div>

    {/* Footer con botones + ICONOS (obligatorio) */}
    <div className="flex justify-end gap-2 mt-5 pt-3 border-t">
      <button onClick={onCancel}
        className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] border border-gray-300 rounded hover:bg-gray-50">
        <X size={14} /> Cancelar
      </button>
      <button onClick={onSave}
        className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] text-white rounded"
        style={{ background: RED }}>
        <Save size={14} /> Guardar
      </button>
    </div>
  </div>
</div>
```

## Helpers obligatorios (copiar de PadronLegalForm)

```tsx
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b pb-1 mb-3 mt-4 first:mt-0">
      <h3 className="text-[13px] font-semibold" style={{ color: RED }}>{children}</h3>
    </div>
  );
}

function Field({ label, required, children, className = "" }) {
  return (
    <div className={`grid grid-cols-[180px_1fr] items-center gap-2 ${className}`}>
      <label className="text-[12px] text-right text-gray-700">
        {required && <span style={{ color: RED }}>* </span>}{label}
      </label>
      {children}
    </div>
  );
}
```

## Iconos en botones (obligatorio)

Todos los botones de acción llevan un icono `lucide-react` antes del texto, con `inline-flex items-center gap-1.5` y `size={14}`. Mapeo estándar:

| Acción            | Icono            |
| ----------------- | ---------------- |
| Guardar / Enviar  | `Save`           |
| Cancelar / Cerrar | `X`              |
| Agregar / Añadir  | `Plus`           |
| Editar            | `Pencil`         |
| Eliminar          | `Trash2`         |
| Buscar            | `Search`         |
| Descargar         | `Download`       |
| Subir / Importar  | `Upload`         |
| Enviar a revisión | `Send`           |
| Atrás             | `ArrowLeft`      |

Botón primario rojo: `style={{ background: RED }} className="... text-white"`.
Botón secundario: `border border-gray-300 hover:bg-gray-50`.

## Reglas

1. Fondo del card: `bg-white rounded border`, padding `px-5 py-5`.
2. Grid de 2 columnas para campos: `grid grid-cols-2 gap-x-6 gap-y-2`. Campo ancho completo → `className="col-span-2"` en `<Field>`.
3. Títulos de sección SIEMPRE en rojo (`#dc2626`) vía `SectionTitle`.
4. Inputs/selects compactos (`h-8 text-[12px]`). Nunca usar componentes shadcn `Input/Select` para no romper la densidad visual.
5. Botones de acción al final del formulario, alineados a la derecha, con borde superior (`border-t pt-3`).
6. Cumple además el skill `project-form-layout`: sin `AppSidebar`, con `ProjectPageHeader` y botones dentro del `<form>`.
