/** @type {import('next').NextConfig} */
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig = {
  // experimental: {},
  turbopack: false,
  // React Compiler is experimental and can emit non-standard source maps on some platforms (seen on Turbopack/Windows).
  // Disable for now to avoid "Invalid source map" errors during dev until the upstream bug is fixed.
  reactCompiler: false,

  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
    ],
  },

  // Headers for internationalization support
  async headers() {
    return [
      {
        source: "/:locale(en|ar)/:path*",
        headers: [
          {
            key: "Content-Language",
            value: "ar", // ثابتة، غيّرها لـ 'en' إذا أردت
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
