export interface JsonPlaceholderPost {
  id: number;
  title: string;
  body: string;
}

export async function fetchLatestPosts(limit: number): Promise<JsonPlaceholderPost[]> {
  const response = await fetch(`https://jsonplaceholder.typicode.com/posts?_limit=${limit}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch posts: ${response.status}`);
  }
  return response.json() as Promise<JsonPlaceholderPost[]>;
}
