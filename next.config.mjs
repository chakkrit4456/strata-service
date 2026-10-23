/** @type {import('next').NextConfig} */
export default {
  serverExternalPackages: ["pg"],
  experimental: { serverActions: { bodySizeLimit: "12mb" } },
};
