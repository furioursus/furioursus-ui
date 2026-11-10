import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

// Builds the Vue components into dist/vue/ as one ES module (Vue left external) plus style.css.
export default defineConfig({
	plugins: [vue()],
	build: {
		outDir: "dist/vue",
		emptyOutDir: true,
		minify: false,
		lib: {
			entry: "src/vue/index.js",
			formats: ["es"],
			fileName: () => "index.js",
			cssFileName: "style",
		},
		rollupOptions: { external: ["vue"] },
	},
	test: {
		environment: "jsdom",
		include: ["src/**/*.spec.js"],
	},
});
