export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: ["/map", "/riders/:path*", "/messages", "/profile"],
};
