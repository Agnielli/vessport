# VES Sport - Landing Page

Landing page moderna y funcional para VES Sport, empresa especializada en camisetas full-print personalizadas.

## Descripción

Sitio web completo desarrollado con Astro y Tailwind CSS v4 que presenta los servicios de VES Sport, incluyendo catálogo de productos, carrito de compras funcional y formulario de contacto.

## Características

- **Diseño Responsive**: Optimizado para todos los dispositivos (mobile-first)
- **Hero Section**: Sección de bienvenida con llamadas a la acción
- **Historia de la Empresa**: Información sobre misión y valores
- **Servicios**: 5 bloques promocionales de servicios especializados
- **Catálogo de Productos**: 6 modelos de camisetas con selector de talla y cantidad
- **Carrito de Compras**: Gestión de estado frontend completa
- **Formulario de Contacto**: Con validación del lado del cliente
- **SEO Optimizado**: Meta tags, Open Graph y estructura semántica
- **Animaciones Suaves**: Transiciones y efectos visuales con Tailwind CSS

## Tecnologías

- **Astro 5.2.5**: Framework web moderno
- **Tailwind CSS v4**: Framework de utilidades CSS
- **TypeScript**: Para tipado estático
- **Google Fonts**: Inter y Montserrat

## Estructura del Proyecto

```
/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Header.astro       # Navegación sticky
│   │   ├── Hero.astro          # Sección hero
│   │   ├── History.astro       # Historia de la empresa
│   │   ├── Services.astro      # Servicios ofrecidos
│   │   ├── Models.astro        # Catálogo y carrito
│   │   ├── Contact.astro       # Formulario de contacto
│   │   └── Footer.astro        # Pie de página
│   ├── layouts/
│   │   └── Layout.astro        # Layout principal
│   ├── pages/
│   │   └── index.astro         # Página principal
│   └── styles/
│       └── global.css          # Estilos globales con Tailwind
├── astro.config.mjs
├── package.json
└── README.md
```

## Instalación y Configuración

### Requisitos Previos

- Node.js 18+ instalado
- npm o yarn

### Pasos de Instalación

1. Clonar el repositorio:
```bash
git clone [repository-url]
cd project
```

2. Instalar dependencias:
```bash
npm install
```

3. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

El sitio estará disponible en `http://localhost:4321`

## Comandos Disponibles

| Comando | Acción |
|---------|--------|
| `npm install` | Instala las dependencias |
| `npm run dev` | Inicia servidor de desarrollo en `localhost:4321` |
| `npm run build` | Genera el sitio para producción en `./dist/` |
| `npm run preview` | Previsualiza la build localmente |

## Colores Corporativos

- **Primary**: #3899B7 (Azul turquesa)
- **Primary Dark**: #2a7a94
- **Secondary**: #000000 (Negro)
- **Accent**: #FFFFFF (Blanco)

## Funcionalidades del Carrito de Compras

El carrito de compras está completamente funcional en el frontend:

- Selección de tallas (XS, S, M, L, XL, XXL)
- Control de cantidad
- Agregar/eliminar productos
- Cálculo automático del total
- Persistencia durante la sesión
- Contador visual en el header

## Integración Backend Pendiente

El proyecto está preparado para integración backend con comentarios claros en el código:

### 1. Base de Datos (Supabase)

**Archivo**: `src/components/Models.astro`

```typescript
// TODO: Backend Integration - Replace with API call
// Example: const products = await fetch('/api/products').then(r => r.json());
```

**Tablas sugeridas**:
- `products`: Catálogo de productos
- `orders`: Pedidos de clientes
- `order_items`: Líneas de pedido

### 2. Formulario de Contacto

**Archivo**: `src/components/Contact.astro`

```typescript
// TODO: Backend Integration - Send form data to API
// Example:
// const response = await fetch('/api/contact', {
//   method: 'POST',
//   headers: { 'Content-Type': 'application/json' },
//   body: JSON.stringify(data)
// });
```

**Implementación sugerida**:
- Crear Edge Function en Supabase para envío de emails
- Guardar consultas en base de datos
- Configurar notificaciones por email

### 3. Pagos con Stripe

**Archivo**: `src/components/Models.astro`

```typescript
// TODO: Backend Integration - Stripe Payment Processing
// 1. Create a Stripe session with cart items
// 2. Redirect to Stripe checkout
```

**Pasos para integrar Stripe**:
1. Crear cuenta en Stripe
2. Obtener claves API (publicable y secreta)
3. Crear Edge Function para crear sesión de checkout
4. Configurar webhooks para confirmación de pago
5. Gestionar estados de pedidos

## SEO

El sitio incluye:
- Meta tags descriptivos
- Etiquetas Open Graph para redes sociales
- Twitter Cards
- Estructura semántica HTML5
- URLs amigables
- Optimización de imágenes

## Responsive Design

Breakpoints utilizados:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## Personalización

### Cambiar Colores

Editar el archivo `src/styles/global.css`:

```css
@theme {
  --color-primary: #3899b7;
  --color-primary-dark: #2a7a94;
  /* ... */
}
```

### Agregar Nuevos Productos

Editar el array `products` en `src/components/Models.astro`

### Modificar Servicios

Editar el contenido en `src/components/Services.astro`

## Rendimiento

- Carga asíncrona de fuentes de Google
- CSS optimizado con Tailwind
- Generación estática de páginas con Astro
- Imágenes optimizadas como SVG y gradientes CSS

## Compatibilidad con Navegadores

- Chrome (últimas 2 versiones)
- Firefox (últimas 2 versiones)
- Safari (últimas 2 versiones)
- Edge (últimas 2 versiones)

## Soporte

Para preguntas o problemas técnicos, contactar al equipo de desarrollo.

## Licencia

Copyright © 2025 VES Sport. Todos los derechos reservados.
# vessport
