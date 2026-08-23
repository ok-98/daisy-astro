import type { StorybookConfig } from '@storybook/html-vite';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin, ViteDevServer } from 'vite';
import { mergeConfig } from 'vite';
import { getViteConfig } from 'astro/config';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';

function astroRenderMiddleware(): Plugin {
  return {
    name: 'astro-render-middleware',
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/__astro-render', async (req: IncomingMessage, res: ServerResponse) => {
        try {
          const url = new URL(req.url ?? '', 'http://localhost');
          const component = url.searchParams.get('component');
          const props = JSON.parse(url.searchParams.get('props') ?? '{}');
          if (!component) throw new Error('Missing "component" query param');

          const mod = await server.ssrLoadModule(component);
          const container = await AstroContainer.create();
          const html = await container.renderToString(mod.default, { props });

          res.setHeader('Content-Type', 'text/html');
          res.end(html);
        } catch (error) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'text/plain');
          res.end(error instanceof Error ? error.stack : String(error));
        }
      });
    },
  };
}

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|ts)'],
  framework: '@storybook/html-vite',
  addons: ['@storybook/addon-docs'],
  async viteFinal(config, { configType }) {
    const astroViteConfigFn = getViteConfig({});
    const astroViteConfig = await astroViteConfigFn({
      command: configType === 'PRODUCTION' ? 'build' : 'serve',
      mode: configType === 'PRODUCTION' ? 'production' : 'development',
    });

    return mergeConfig(config, {
      plugins: [...(astroViteConfig.plugins ?? []), astroRenderMiddleware()],
      resolve: astroViteConfig.resolve,
    });
  },
};

export default config;
