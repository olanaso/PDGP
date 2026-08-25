---
name: project-form-layout
description: Convenciones de layout para formularios y páginas en este proyecto. Úsalo cuando crees o edites cualquier ruta bajo /proyectos/$projectId/* (formularios internos de un proyecto) o rutas globales como /proyectos, /seguridad, /configuracion. Define cuándo mostrar el AppSidebar, cómo usar ProjectPageHeader, y dónde van los botones de acción.
---

# Layout de formularios — Plataforma Digital de Gestión de Predios

## Regla 1 — Sidebar (menú principal)

El `AppSidebar` SOLO aparece en rutas globales (nivel lista). NUNCA dentro de un proyecto.

**Mostrar AppSidebar** (envolver con `SidebarProvider` + `<AppSidebar />`):
- `/proyectos` (lista de proyectos)
- `/seguridad`
- `/configuracion`
- Cualquier ruta nueva que NO sea hija de `/proyectos/$projectId/...`

**NO mostrar AppSidebar** (no importar `AppSidebar` ni `SidebarProvider`):
- Todas las rutas `src/routes/proyectos.$projectId.*` (Datos técnicos, Base gráfica, Equipos, Requerimientos, Códigos de planos/predios, Registro de capa, etc.)

Si creas una nueva página interna de proyecto, NO añadas el sidebar aunque copies una página global como base.

## Regla 2 — Cabecera de página de proyecto

Todas las páginas internas de un proyecto usan el componente compartido `ProjectPageHeader` (`src/components/ProjectPageHeader.tsx`). Estructura:

- Botón **Atrás** (izquierda)
- Breadcrumb: `/ Proyecto {nombre} / {Título de la página}`
- Slot `right`: badge de estado (ej. "Datos técnicos", "Borrador", "En revisión"). Los títulos de sección dentro de la página van en rojo (clase `text-destructive` o equivalente del tema).

```tsx
<ProjectPageHeader
  projectName={proyecto.nombre}
  title="Base gráfica"
  right={<Badge>Borrador</Badge>}
/>
```

NO uses `ProjectPageHeader` para colocar botones de acción (Guardar, Enviar, etc.). El `right` es solo para estado/badge.

## Regla 3 — Botones de acción dentro del formulario

Los botones de acción de un formulario (Guardar borrador, Enviar a revisión, Cancelar, etc.) van **dentro del formulario**, al final de la columna del formulario — nunca en la cabecera ni flotando fuera del card.

Patrón:

```tsx
<form>
  {/* secciones del formulario ... */}
  <section>{/* Trazabilidad u otra última sección */}</section>

  <div className="flex justify-end gap-2 pt-4">
    <Button variant="outline">Guardar borrador</Button>
    <Button>Enviar a revisión</Button>
  </div>
</form>
```

## Checklist al crear/editar una ruta

1. ¿Es hija de `/proyectos/$projectId/...`? → SIN sidebar, CON `ProjectPageHeader`.
2. ¿Es global (lista/seguridad/configuración)? → CON `AppSidebar` + `SidebarProvider`.
3. ¿El formulario tiene botones de acción? → Van dentro del `<form>`, al final, alineados a la derecha.
4. ¿La cabecera lleva badge de estado? → Pásalo por `right`, nunca botones.
