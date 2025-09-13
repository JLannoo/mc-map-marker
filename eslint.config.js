import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
	// Global ignore patterns
	globalIgnores(['**/node_modules/**', '**/dist/**', '**/build/**', '**/.git/**', '**/public/wasm/**', '**/lib/wasm/*.js']),
	{ 
		files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'], 
		plugins: { js }, 
		extends: ['js/recommended'], 
		languageOptions: { 
			globals: {
				...globals.browser, 
				...globals.node
			}
		},},
	tseslint.configs.recommended,
	pluginReact.configs.flat.recommended,
	{
		rules: {
			// Always ;
			'semi': ['error', 'always'],
			// use tabs
			'indent': ['error', 'tab'],
			// single quotes
			'quotes': ['error', 'single'],
			// No unused vars, but allow _var
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_', 'varsIgnorePattern': '^_' }],
			// React in scope
			'react/react-in-jsx-scope': 'off',
		},
	}
]);
