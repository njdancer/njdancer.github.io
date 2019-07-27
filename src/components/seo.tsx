/**
 * SEO component that queries for data with
 *  Gatsby's useStaticQuery React hook
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import { graphql, useStaticQuery } from "gatsby"
import Helmet from "react-helmet"
import React from "react"

export interface Props {
  description?: string
  lang?: string
  meta?: JSX.IntrinsicElements["meta"][]
  title: string
}

const SEO: React.FunctionComponent<Props> = ({
  description = "",
  lang = "en",
  meta = [],
  title,
}) => {
  const { site } = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
            description
            author
          }
        }
      }
    `
  )

  const metaDescription = description || site.siteMetadata.description

  const metaOptions: JSX.IntrinsicElements["meta"][] = [
    {
      content: metaDescription,
      name: `description`,
    },
    {
      content: title,
      property: `og:title`,
    },
    {
      content: metaDescription,
      property: `og:description`,
    },
    {
      content: `website`,
      property: `og:type`,
    },
    {
      content: `summary`,
      name: `twitter:card`,
    },
    {
      content: site.siteMetadata.author,
      name: `twitter:creator`,
    },
    {
      content: title,
      name: `twitter:title`,
    },
    {
      content: metaDescription,
      name: `twitter:description`,
    },
    ...meta,
  ]

  return (
    <Helmet
      htmlAttributes={{
        lang,
      }}
      meta={metaOptions}
      title={title}
      titleTemplate={`%s | ${site.siteMetadata.title}`}
    />
  )
}

export default SEO
