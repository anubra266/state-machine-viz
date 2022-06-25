const baseConfig = {
  repo: 'https://github.com/chakra-ui/zag-docs',
  title: 'Zag Visualizer - Visualize ZagJs components',
  description: 'Visualizer for ZagJs components',
  url: 'https://vizualizer.zagjs.com',
  zag_url: 'https://zagjs.com',
};

const siteConfig = {
  ...baseConfig,
  projectName: 'zag-js-vizualizer',
  copyright: `Copyright &copy; ${new Date().getFullYear()}`,
  openCollective: {
    url: 'https://opencollective.com/chakra-ui',
  },
  author: {
    name: 'Abraham Anuoluwapo',
    github: 'https://github.com/anubra266',
    twitter: 'https://twitter.com/theanubra266',
    linkedin: 'https://linkedin.com/in/theanubra266',
    polywork: 'https://www.polywork.com/anubra266',
    email: 'anubra266@gmail.com',
  },
  repo: {
    url: 'https://github.com/chakra-ui/zag',
    editUrl: `${baseConfig.repo}/edit/main/data`,
    blobUrl: `${baseConfig.repo}/blob/main`,
  },
  discord: {
    url: 'https://zagjs.com/discord',
  },
  seo: {
    title: baseConfig.title,
    titleTemplate: '%s - Zag Visualizer',
    description: baseConfig.description,
    siteUrl: baseConfig.url,
    twitter: {
      handle: '@zag_js',
      site: baseConfig.url,
      cardType: 'summary_large_image',
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: baseConfig.url,
      title: baseConfig.title,
      description: baseConfig.description,
      site_name: baseConfig.title,
      images: [
        {
          url: `${baseConfig.zag_url}/open-graph/website.png`,
          width: 1240,
          height: 480,
        },
        {
          url: `${baseConfig.zag_url}/open-graph/twitter.png`,
          width: 1012,
          height: 506,
        },
      ],
    },
  },
};

export default siteConfig;
