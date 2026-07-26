/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@careeros/shared"],
  serverExternalPackages: ["pdfkit"],
  // Old candidate slugs → new home. Handles bookmarks/open tabs after the module rename.
  async redirects() {
    return [
      { source: "/candidate", destination: "/candidate/tracker", permanent: false },
      { source: "/candidate/dashboard", destination: "/candidate/tracker", permanent: false },
      { source: "/candidate/jobby", destination: "/candidate/tracker", permanent: false }
    ];
  }
};

export default nextConfig;
