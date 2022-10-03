import { GetStaticProps, InferGetStaticPropsType } from "next"
import { serialize } from "next-mdx-remote/serialize"
import { MDXRemote } from "next-mdx-remote"
import { getPostFileContents, getPostFiles } from "../../utils/posts"
import invariant from "tiny-invariant"
import Link from "next/link"

export default function PostPage({
  mdxSource,
  metadata,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      <header>
        <nav>
          <Link href="/">
            <a>👈 Go back home</a>
          </Link>
        </nav>
      </header>
      <div className="post-header">
        <h1>{metadata.title}</h1>
      </div>
      <main>
        <MDXRemote {...mdxSource} />
      </main>

      <style jsx>{`
        .post-header h1 {
          margin-bottom: 0;
        }
        .post-header {
          margin-bottom: 2rem;
        }
        .description {
          opacity: 0.6;
        }
      `}</style>
    </>
  )
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  invariant(typeof params?.slug === "string", "Page requires slug in params")

  const postFileContents = await getPostFileContents(`${params.slug}.mdx`)

  const { frontmatter: metadata, ...mdxSource } = await serialize(
    postFileContents,
    {
      parseFrontmatter: true,
    }
  )

  return {
    props: {
      mdxSource,
      metadata,
    },
  }
}

export const getStaticPaths = async () => {
  const postFilePaths = await getPostFiles()

  const paths = postFilePaths
    // Remove file extensions for page paths
    .map((path) => path.replace(/\.mdx?$/, ""))
    // Map the path into the static paths object required by Next.js
    .map((slug) => ({ params: { slug } }))

  return {
    paths,
    fallback: false,
  }
}
