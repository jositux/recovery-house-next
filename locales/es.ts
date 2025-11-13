export default {
  title: "Bienvenido",
  description: "Esta es una aplicación con soporte multiidioma",
  greeting: "Hola, mundo",
  switchLanguage: "Cambiar idioma",
  currentLanguage: "Idioma actual",

  nav: {
    home: "Inicio",
    about: "Acerca de",
    services: "Servicios",
  },

  home: {
    title: "Página de Inicio",
    subtitle: "Bienvenido a nuestra aplicación multiidioma",
    paragraph1: "Esta aplicación demuestra cómo implementar internacionalización (i18n) en Next.js.",
    paragraph2: "Puedes cambiar entre español e inglés usando el selector de idioma en la parte superior.",
    paragraph3: "Las rutas se actualizarán automáticamente: /es para español y /en para inglés.",
  },

  about: {
    title: "Acerca de Nosotros",
    subtitle: "Conoce más sobre nuestro proyecto",
    mission: "Nuestra Misión",
    missionText: "Crear aplicaciones web accesibles y multiidioma que lleguen a usuarios de todo el mundo.",
    vision: "Nuestra Visión",
    visionText: "Ser líderes en desarrollo de aplicaciones internacionales con la mejor experiencia de usuario.",
    team: "Nuestro Equipo",
    teamText: "Contamos con un equipo diverso de desarrolladores apasionados por la tecnología y la innovación.",
  },

  services: {
    title: "Nuestros Servicios",
    subtitle: "Soluciones profesionales para tu negocio",
    service1: {
      title: "Desarrollo Web",
      description: "Creamos sitios web modernos y responsivos utilizando las últimas tecnologías como Next.js y React.",
    },
    service2: {
      title: "Internacionalización",
      description: "Implementamos soporte multiidioma en tu aplicación para alcanzar mercados globales.",
    },
    service3: {
      title: "Optimización SEO",
      description: "Mejoramos el posicionamiento de tu sitio web en los motores de búsqueda.",
    },
  },

  metadata: {
    title: "Aplicación Multiidioma | Inicio",
    description:
      "Una aplicación moderna con soporte completo para español e inglés. Descubre cómo implementar i18n en Next.js de forma profesional.",
    keywords: "multiidioma, i18n, Next.js, React, español, inglés, internacionalización",
    author: "Tu Empresa",
    ogTitle: "Aplicación Multiidioma - Soporte Español e Inglés",
    ogDescription: "Aplicación web moderna con internacionalización completa en español e inglés",

    about: {
      title: "Acerca de Nosotros | Aplicación Multiidioma",
      description:
        "Conoce nuestra misión, visión y equipo. Creamos aplicaciones web accesibles y multiidioma para usuarios de todo el mundo.",
    },

    services: {
      title: "Nuestros Servicios | Aplicación Multiidioma",
      description:
        "Ofrecemos desarrollo web, internacionalización y optimización SEO. Soluciones profesionales para tu negocio global.",
    },
  },
} as const
