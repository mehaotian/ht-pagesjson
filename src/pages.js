
import fs from 'fs'
import path from 'path'
import {run,readFile} from './util'

function pages(pagesJson, {
	addDependency,
	rootPath
}) {
	if (!rootPath) {
		rootPath = __dirname
	}
	console.error('项目开启路由增强插件，该日志会打印多次,属于正常现象,请无视!');
	return run(pagesJson, addDependency, rootPath)
}
// pages(readFile(path.join(__dirname, 'pages.json')),()=>{})
export default pages
