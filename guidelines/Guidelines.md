# Add your own guidelines here

# Reglas y Sistema de Diseño para LUNIA

## 1. Estetica General y Colores
* Fondo Principal: Siempre oscuro mistico (#030108 o degradados a #0a041a).
* Color Primario (Neon): Cian Neon (#00f5ff) para acciones principales, bordes activos y acentos clave.
* Color Secundario (Cosmico): Morado Neon (#a855f7) para resplandores, degradados y efectos GodRays.
* Color Acento: Rosa Neon (#ec4899) exclusivo para detalles sutiles o estados de energia.

# 1.1 Otros colores (opción 2)
* Fondo Principal: Azul noche profundo (#0F1C30 o degradados hacia el negro).
* Color Secundario (Estructuras y Cards): Azul marino frio (#304A6E).
* Color Primario (Acentos y Botones): Azul medio frio (#668DC0).
* Color Claridad / Acompanamiento: Azul hielo / violeta claro (#C0D0EF).
* Color Neutro / Bordes: Gris plateado frio (#C2C6CE).

# 1.2 Indicaciones de tipografias
* Tipografia:
  * Titulo Principal / Brand: 'Cinzel Decorative', 'Playfair Display', serif (Letra esthetic tipo Nirand).
  * Subtitulos y Encabezados: 'Cinzel', serif (En mayusculas con espaciado amplio letter-spacing: 0.1em).
  * Textos, Botones e Inputs: 'Plus Jakarta Sans', sans-serif (Precision medica y alta legibilidad).

## 2. Botones (Buttons)
* Boton Primario:
  * Estilo: Fondo con degradado de cristal (linear-gradient), borde cian brillante de 1px (rgba(0, 245, 255, 0.4)), bordes completamente redondeados (borderRadius: 26px).
  * Comportamiento: Debe tener sombra de neon suave (box-shadow) y un icono a la derecha.
* Boton Secundario / Transparente:
  * Estilo: Sin fondo o con fondo de cristal sutil, texto en color purpura claro o blanco.

## 3. Campos de Entrada (Inputs y Contenedores)
* Estilo Glassmorphism: Todos los inputs y cards deben tener fondo semi-transparente (rgba(255, 255, 255, 0.04)), borde purpura/cian muy delgado y desenfoque de fondo (backdropFilter: 'blur(16px)').
* Formato de Texto: Las etiquetas (labels) sobre los inputs siempre deben ir en mayusculas, tamano pequeno (10px o 11px), en negrita (fontWeight: 700) y con espaciado entre letras (letterSpacing: '0.12em').
* Modo Oscuro: Los selectores de fecha (type="date") siempre deben tener la propiedad colorScheme: "dark".

## 4. Mascota y Elementos Misticos
* LUNIA (Mascota): Debe estar siempre flotando con una animacion suave arriba y abajo (y: [0, -8, 0]).
* Efecto Shockwave: Al hacer clic en LUNIA o presionar un boton importante, debe emitirse un anillo de luz en expansion.
* Geometria Sagrada (SacredHalo / CrystalSphere): Siempre deben estar centradas detras de la mascota o el contenedor principal con opacidad sutil para dar profundidad 3D.

## 5. Arquitectura de Codigo
* Disposicion: Usar siempre Flexbox o CSS Grid. Evitar posiciones absolutas a menos que sea para fondos, estrellas o efectos de iluminacion.
* Animaciones: Usar framer-motion para transiciones entre pasos de onboarding y pantallas (AnimatePresence).
* Componentes: Mantener cada paso del onboarding o tarjeta en su propio archivo dentro de src/components/.
