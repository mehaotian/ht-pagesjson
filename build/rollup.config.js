const path = require('path');
const {
	babel
} = require('@rollup/plugin-babel');
const {
	nodeResolve
} = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const json = require('@rollup/plugin-json');
const copy = require('rollup-plugin-copy')
const resolveFile = function(filePath) {
	return path.join(__dirname, '..', filePath)
}

const babelOptions = {
	babelHelpers: 'bundled',
	"presets": ['@babel/preset-env'],
}
const globals = {
	hbuilderx: 'hbuilderx',
	path: 'path',
	fs: 'fs'
}

const plugins = [
	json(),
	nodeResolve(),
	commonjs(),
	babel(babelOptions),
]
module.exports = [
{
	input: resolveFile('src/extension.js'),
	output: {
		file: resolveFile('dist/extension.js'),
		format: 'umd',
		name: 'extension'
	},
	globals,
	plugins: [
		...plugins,
		copy({
			targets: [
			{
				src: 'src/package.json',
				dest: 'dist'
			},{
				src: 'README.md',
				dest: 'dist'
			}]
		})
	],
}, {
	input: resolveFile('src/pages.js'),
	output: {
		file: resolveFile('dist/pages.js'),
		name: 'package',
		format: 'cjs'
	},
	globals,
	plugins,
}]
