

/** @type { import('@storybook/html-vite').StorybookConfig } */
const config = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-actions",
    "@storybook/addon-interactions"
  ],
  "framework": "@storybook/html-vite",
  async viteFinal(config) {
    config.build = config.build || {};
    config.build.rollupOptions = config.build.rollupOptions || {};
    config.build.chunkSizeWarningLimit = 3000;
    config.build.rollupOptions.output = config.build.rollupOptions.output || {};

    config.build.rollupOptions.output.manualChunks = (id) => {
      if (!id.includes('node_modules')) {
        return;
      }
      if (id.includes('/storybook/') || id.includes('/@storybook/')) {
        return 'vendor-storybook';
      }
      if (id.includes('/axe-core/')) {
        return 'vendor-a11y';
      }
      return 'vendor';
    };
    return config;
  }
};
export default config;
