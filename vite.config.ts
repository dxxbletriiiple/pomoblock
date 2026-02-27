import react from '@vitejs/plugin-react';
import { copyFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { defineConfig } from 'vite';

function copyManifestPlugin() {
	return {
		name: 'copy-extension-manifest',
		writeBundle() {
			mkdirSync(resolve(__dirname, 'dist'), { recursive: true });
			copyFileSync(
				resolve(__dirname, 'src/manifest.json'),
				resolve(__dirname, 'dist/manifest.json'),
			);
		},
	};
}

export default defineConfig(({ mode }) => {
	const withSourceMaps = mode !== 'prod';

	return {
		plugins: [react(), copyManifestPlugin()],
		base: './',
		build: {
			rollupOptions: {
				input: {
					popup: resolve(__dirname, 'index.html'),
					blocked: resolve(__dirname, 'blocked.html'),
					background: resolve(__dirname, 'src/background/index.ts'),
				},
				output: {
					entryFileNames: '[name].js',
					chunkFileNames: 'assets/[name]-[hash].js',
					assetFileNames: 'assets/[name]-[hash].[ext]',
				},
			},
			outDir: 'dist',
			emptyOutDir: true,
			sourcemap: withSourceMaps,
		},
	};
});
