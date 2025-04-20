/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'lh3.googleusercontent.com', // Dominios de Google para imágenes de perfil
      'source.boringavatars.com',  // Avatares generados para reviewers
    ],
  },
};

module.exports = nextConfig;
