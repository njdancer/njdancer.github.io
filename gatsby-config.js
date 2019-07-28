/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/camelcase */
const path = require("path")

module.exports = {
  plugins: [
    `gatsby-plugin-react-helmet`,
    {
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
      resolve: `gatsby-source-filesystem`,
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      options: {
        background_color: `#663399`,
        display: `minimal-ui`,
        icon: `src/images/gatsby-icon.png`,
        name: `gatsby-starter-default`,
        short_name: `starter`,
        start_url: `/`,
        theme_color: `#663399`, // This path is relative to the root of the site.
      },
      resolve: `gatsby-plugin-manifest`,
    },
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
    "gatsby-plugin-typescript",
    {
      options: {
        test: /\.(?:t|j)sx?$/,
      },
      resolve: "gatsby-plugin-eslint",
    },
    {
      options: {
        components: path.join(__dirname, "src/components"),
        images: path.join(__dirname, "src/images"),
        pages: path.join(__dirname, "src/pages"),
        src: path.join(__dirname, "src"),
      },
      resolve: "gatsby-plugin-root-import",
    },
    {
      options: {
        name: `markdown-pages`,
        path: `${__dirname}/src/markdown`,
      },
      resolve: `gatsby-source-filesystem`,
    },
    "gatsby-transformer-remark",
    "gatsby-plugin-extract-schema",
  ],
  siteMetadata: {
    author: `@gatsbyjs`,
    description: `Kick off your next, great Gatsby project with this default starter. This barebones starter ships with the main Gatsby configuration files you might need.`,
    title: `Gatsby Default Starter`,
  },
}
