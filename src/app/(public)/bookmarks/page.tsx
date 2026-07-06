import { BookmarksClient } from "./bookmarks-client";

// Force dynamic rendering — prevents build-time prerendering
// which would try to initialize Prisma with potentially missing env vars.
export const dynamic = "force-dynamic";

export default function BookmarksPage() {
  return <BookmarksClient />;
}
