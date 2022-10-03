import fs from "fs/promises"
import path from "path"
import Link from "next/link"
import { GetStaticProps, InferGetStaticPropsType } from "next"
import { serialize } from "next-mdx-remote/serialize"
import { getPostFileContents, getPostFiles, POSTS_PATH } from "../utils/posts"

export default function Index({
  posts,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    // <Layout>
    <>
      <h1>Home Page</h1>
      <p>
        Click the link below to navigate to a page generated by{" "}
        <code>next-mdx-remote</code>.
      </p>
      <ul>
        {posts.map((post: any) => (
          <li key={post.filePath}>
            <Link
              as={`/posts/${post.filePath.replace(/\.mdx?$/, "")}`}
              href={`/posts/[slug]`}
            >
              <a>{post.metadata.title}</a>
            </Link>
          </li>
        ))}
      </ul>
    </>
    // </Layout>
  )
}

export async function getStaticProps() {
  const postFiles = await getPostFiles()

  const posts = await Promise.all(
    postFiles.map(async (filePath) => {
      const postFileContents = await getPostFileContents(filePath)

      const { compiledSource: content, frontmatter: metadata } =
        await serialize(postFileContents, {
          parseFrontmatter: true,
        })

      return {
        metadata,
        filePath,
      }
    })
  )

  return { props: { posts } }
}
