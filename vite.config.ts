import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, Plugin} from 'vite';

function serveApkPlugin(): Plugin {
  return {
    name: 'serve-apk-files',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.includes('.apk')) {
          const cleanUrl = req.url.split('?')[0];
          const localPath = path.join(process.cwd(), 'public', cleanUrl);
          if (fs.existsSync(localPath) && fs.statSync(localPath).isFile()) {
            const stat = fs.statSync(localPath);
            const filename = path.basename(localPath);
            res.writeHead(200, {
              'Content-Type': 'application/vnd.android.package-archive',
              'Content-Length': stat.size.toString(),
              'Content-Disposition': `attachment; filename="${filename}"`,
              'Cache-Control': 'no-cache, no-store, must-revalidate',
            });
            const readStream = fs.createReadStream(localPath);
            readStream.pipe(res);
            return;
          }
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), serveApkPlugin()],
    assetsInclude: ['**/*.apk'],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
