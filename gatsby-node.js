/* eslint-disable @typescript-eslint/no-var-requires */
const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)

const buildArticlePath = slug => {
  return path.join("/articles", slug)
}

exports.onCreateNode = ({ node, getNode, actions }) => {
  const { createNodeField } = actions
  if (node.internal.type === "MarkdownRemark") {
    const slug = createFilePath({
      basePath: "markdown",
      getNode,
      node,
      trailingSlash: false,
    })
    createNodeField({
      name: "defaultSlug",
      node,
      value: slug,
    })
    createNodeField({
      name: "defaultPath",
      node,
      value: buildArticlePath(slug),
    })
  }
}

exports.createSchemaCustomization = ({ actions, schema }) => {
  const { createTypes } = actions
  const typeDefs = [
    schema.buildObjectType({
      fields: {
        frontmatter: {
          resolve({ fields: { defaultSlug, defaultPath }, frontmatter }) {
            const { slug } = frontmatter

            return {
              slug: defaultSlug,
              path: slug ? buildArticlePath(slug) : defaultPath,
              draft: false,
              ...frontmatter,
            }
          },
          type: "Frontmatter",
        },
      },
      interfaces: ["Node"],
      name: "MarkdownRemark",
    }),
    `type Frontmatter {
      slug: String
      path: String
      draft: Boolean
    }`,
  ]
  createTypes(typeDefs)
}

exports.createPages = ({ actions, graphql }) => {
  const { createPage } = actions
  const postsTemplatePath = path.resolve(`src/templates/article.tsx`)
  return graphql(`
    {
      allMarkdownRemark(
        sort: { order: DESC, fields: [frontmatter___date] }
        ${
          process.env.NODE_ENV === "production"
            ? "filter: { frontmatter: { draft: { ne: true }}}"
            : ""
        }
        limit: 1000
      ) {
        nodes {
          id
          frontmatter {
            path
          }
        }
      }
    }
  `).then(result => {
    if (result.errors) {
      return Promise.reject(result.errors)
    }
    return result.data.allMarkdownRemark.nodes.forEach(
      ({ id, frontmatter: { path } }) => {
        createPage({
          component: postsTemplatePath,
          context: { id },
          path,
        })
      }
    )
  })
}
