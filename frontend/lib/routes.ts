export function contentPath(value?: string | null) {
  const slug = value?.replace(/^\/+|\/+$/g, "");
  if (!slug || slug === "index") return "/";
  return `/${slug}/`;
}
