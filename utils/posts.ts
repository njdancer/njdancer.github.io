import path from "path"
import fs from "fs/promises"

export const POSTS_PATH = path.join(process.cwd(), "posts")

export const getPostFiles = async () => {
  const postDirContents = await fs.readdir(POSTS_PATH)
  return postDirContents.filter((path) => /\.mdx?$/.test(path))
}

export const getPostFileContents = (filePath: string) =>
  fs.readFile(path.join(POSTS_PATH, filePath), "utf8")
