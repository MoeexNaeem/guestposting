/** @type {import('next').NextConfig} */
const nextConfig = {
  // The Vite build ran the React Compiler; keep it so components behave the same.
  reactCompiler: true,
  serverExternalPackages: ['nodemailer', 'csv-parser'],
  // scripts/server/deploy.sh builds into .next-build while the live site keeps
  // serving .next, then swaps the folders.
  distDir: process.env.NEXT_DIST_DIR || '.next',
};

export default nextConfig;
