export default {
  title: "Welcome",
  description: "This is an application with multilingual support",
  greeting: "Hello, world",
  switchLanguage: "Switch language",
  currentLanguage: "Current language",

  nav: {
    home: "Home",
    about: "About",
    services: "Services",
  },

  home: {
    title: "Home Page",
    subtitle: "Welcome to our multilingual application",
    paragraph1: "This application demonstrates how to implement internationalization (i18n) in Next.js.",
    paragraph2: "You can switch between Spanish and English using the language selector at the top.",
    paragraph3: "Routes will automatically update: /es for Spanish and /en for English.",
  },

  about: {
    title: "About Us",
    subtitle: "Learn more about our project",
    mission: "Our Mission",
    missionText: "Create accessible and multilingual web applications that reach users worldwide.",
    vision: "Our Vision",
    visionText: "Be leaders in international application development with the best user experience.",
    team: "Our Team",
    teamText: "We have a diverse team of developers passionate about technology and innovation.",
  },

  services: {
    title: "Our Services",
    subtitle: "Professional solutions for your business",
    service1: {
      title: "Web Development",
      description: "We create modern and responsive websites using the latest technologies like Next.js and React.",
    },
    service2: {
      title: "Internationalization",
      description: "We implement multilingual support in your application to reach global markets.",
    },
    service3: {
      title: "SEO Optimization",
      description: "We improve your website's ranking in search engines.",
    },
  },

  metadata: {
    title: "Multilingual Application | Home",
    description:
      "A modern application with full support for Spanish and English. Discover how to implement i18n in Next.js professionally.",
    keywords: "multilingual, i18n, Next.js, React, Spanish, English, internationalization",
    author: "Your Company",
    ogTitle: "Multilingual Application - Spanish & English Support",
    ogDescription: "Modern web application with complete internationalization in Spanish and English",

    about: {
      title: "About Us | Multilingual Application",
      description:
        "Learn about our mission, vision and team. We create accessible and multilingual web applications for users worldwide.",
    },

    services: {
      title: "Our Services | Multilingual Application",
      description:
        "We offer web development, internationalization and SEO optimization. Professional solutions for your global business.",
    },
  },
} as const
