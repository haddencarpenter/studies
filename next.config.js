const withLess = require("next-with-less");
const { withSuperjson } = require('next-superjson')


module.exports = withLess(withSuperjson()({
  lessLoaderOptions: {
    /* ... */
  },
  reactStrictMode: true,
  staticPageGenerationTimeout: 60 * 60,
  images: {
    domains: ['assets.coingecko.com'],
  },
}));