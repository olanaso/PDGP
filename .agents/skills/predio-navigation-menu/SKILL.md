---
name: predio-navigation-menu
description: Modifica la navegación predial compartida del mapa y de las pantallas /proyectos/$projectId/predios/$codigo/* de este proyecto. Usar al crear, ordenar, renombrar, describir o enlazar menús y submenús del flujo predial.
---

# Menú de navegación predial

Mantén sincronizados el menú desplegable del mapa y la navegación lateral persistente de las pantallas del predio.

## Fuente compartida

- Edita la estructura, descripciones, rutas e iconos en `src/components/predioNavigationConfig.ts`.
- `contextMenuItems` corresponde al flujo privado y `estatalMenuItems` al estatal. Reutiliza un mismo objeto cuando un bloque sea común a ambos.
- Registra cada pantalla navegable en `PredioRoute` y `routeByKey`.
- `src/components/PredioActions.tsx` consume la configuración en el mapa; `src/components/PredioWorkspaceNavigation.tsx` la consume en la barra lateral.

## Convenciones visuales

- Los menús principales, es decir los elementos de profundidad cero, pueden mostrar un icono rojo.
- Los submenús nunca muestran iconos, tanto en la barra lateral como en el desplegable del mapa. Conserva su jerarquía mediante indentación de texto.
- Resalta únicamente la ruta activa y conserva abiertos los grupos que contienen esa ruta.
- Usa `description` como ayuda contextual. Muestra una descripción breve bajo el encabezado principal cuando aporte contexto; en los submenús úsala como tooltip para no ensanchar la navegación.

## Rutas y formularios

- Enlaza una pantalla existente cuando cubra el contenido solicitado y actualiza su título para que coincida con el menú.
- Si no existe una pantalla equivalente, crea una ruta con un formulario vacío: solo el proyecto, código de predio u otro contexto inequívoco puede aparecer precargado y en modo lectura.
- Para formularios nuevos aplica también las skills `project-form-layout` y `padron-legal-form-style`.
- Al cambiar de predio desde el selector superior, conserva la sección actual mediante la misma ruta y los nuevos parámetros.

## Verificación

- Ejecuta ESLint sobre los archivos modificados y `npm run build` para regenerar y validar `src/routeTree.gen.ts`.
- Comprueba que las rutas nuevas respondan y que los menús privado y estatal compartan correctamente los bloques comunes.
