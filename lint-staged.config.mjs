/**
 * @filename: lint-staged.config.js
 * @type {import('lint-staged').Configuration}
 */
const config = {
  '*.{js,jsx,ts,tsx,mjs}': ['prettier --write', 'eslint --fix'],
  '*.{json,css,md}': ['prettier --write']
};

export default config;
