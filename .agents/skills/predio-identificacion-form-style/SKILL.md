---
name: predio-identificacion-form-style
description: Uniformiza formularios de rutas /proyectos/$projectId/predios/$codigo/* con el patrón visual de Identificación y codificación del predio. Usar al crear o modificar formularios prediales, especialmente paneles informativos, secciones, tablas y adjuntos.
---

# Estilo uniforme de formularios prediales

Referencia canónica: `src/routes/proyectos.$projectId.predios.$codigo.identificacion-codificacion.tsx`.

Usar junto con `project-form-layout`. Cuando una regla visual genérica difiera de este skill, aplicar este patrón específico en las rutas de predios.

## Jerarquía visual

- Mantener `ProjectPageHeader` y la navegación predial compartida.
- Contenedor principal blanco, `rounded border`, con padding interior `px-5 py-5`.
- Si existen pestañas, usar fondo blanco y solo una línea roja inferior para la pestaña activa.
- Títulos principales de sección con texto rojo `#dc2626`, tamaño `13px` y borde inferior gris.
- Paneles internos informativos con fondo blanco, borde gris y cabecera compacta: icono/título rojo más una línea inferior roja tenue.
- No usar franjas completas, barras o cabeceras de panel con fondo rojo.
- Reservar el fondo rojo sólido para botones primarios y pequeños indicadores cuando sea necesario.

## Componentes de referencia

```tsx
const RED = "#dc2626";
const inputCls =
  "h-8 w-full rounded border border-gray-300 bg-white px-2 text-[12px] focus:border-gray-500 focus:outline-none";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 mt-4 border-b pb-1 first:mt-0">
      <h3 className="text-[13px] font-semibold" style={{ color: RED }}>
        {children}
      </h3>
    </div>
  );
}

function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded border border-gray-200 bg-white px-3 py-2.5">
      <div className="mb-2 border-b border-red-200 pb-1.5 text-[#ef4444]">
        <h2 className="text-[10px] font-semibold tracking-wide">{title}</h2>
      </div>
      {children}
    </div>
  );
}
```

## Formularios, tablas y adjuntos

- Labels alineados a la derecha mediante `grid-cols-[180px_1fr]` cuando el ancho lo permita.
- Inputs compactos `h-8 text-[12px]`; valores informativos en fondo gris claro y solo lectura.
- Tablas con contenedor `rounded border`; encabezado `bg-gray-50 text-gray-600`, nunca fondo rojo completo.
- Bandejas de archivos con panel blanco y borde gris. Colocar `Subir archivo` o `Agregar` en la cabecera compacta, con icono Lucide.
- Mensajes de éxito, advertencia o error pueden usar fondos semánticos suaves.
- Botones Cancelar/Guardar dentro del formulario y al final; Cancelar con borde gris y Guardar rojo sólido.

## Verificación

Antes de terminar, comparar la ruta modificada con la referencia canónica y comprobar:

1. No quedan cabeceras de panel con fondo rojo completo.
2. Las secciones se distinguen por borde, espacio y tipografía, no por bloques de color intenso.
3. La densidad de labels e inputs coincide con Identificación y codificación.
4. Los botones de acción están al final del formulario.
