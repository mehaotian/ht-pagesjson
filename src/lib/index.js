import hx from "hbuilderx"
import fs from "fs"
import path from "path"
import getPages from '../pages.js'

const log = (channel, line) => {
	let log = hx.window.createOutputChannel(channel);
	log.show()
	log.appendLine(line);
}

class Core {
	static getInstance() {
		if (!this.instance) {
			this.instance = new Core();
		}
		return this.instance;
	}

	constructor() {
		this.instance = null
	}

	pageRouter(res) {
		let nature = res.workspaceFolder.nature
		let fsPath = res.fsPath
		if (nature === 'UniApp_Vue') {
			let pagejson = path.join(fsPath, 'pages.js')
			if (fs.existsSync(pagejson)) {
				fs.unlinkSync(pagejson);
			}
			this._copyFile(path.join(__dirname, 'pages.js'), pagejson)
			log('插件开启成功',{
				level:'success',
				line:'uni-app 项目路由增强插件开启成功，开启成功后将生成一个 pages.js 文件，请勿删除和修改！'
			})
		} else {
			log('生成文件失败',{
				level:'error',
				line:'当前插件仅对 uni-app 项目生效！'
			})
		}
	}

	pageSubpackage(res) {
		let fsPath = res.fsPath
		let rootPath = res.workspaceFolder.uri.fsPath
		let rootName = path.relative(rootPath, fsPath)
		let subPackageData = {
			root: rootName.replace(/\\/g, '/')
		}
		if (rootName === 'pages') {
			log('生成文件失败',{
				level:'error',
				line:'pages 文件夹下禁止创建分包！'
			})
			return
		}
		let subPackagePath = path.join(fsPath, 'subPackage.json')
		if (fs.existsSync(subPackagePath)) {
			fs.unlinkSync(subPackagePath);
		}
		fs.writeFileSync(subPackagePath, JSON.stringify(subPackageData, null, 4))
		log('生成文件成功',{
			level:'success',
			line:'分包文件 subPackage.json 创建成功!'
		})
	}

	pageJson(res) {
		let fsPath = res.fsPath
		let rootPath = res.workspaceFolder.uri.fsPath
		let rootName = path.relative(rootPath, fsPath)
		rootName = path.basename(rootName).split('.')[0]
		let pageJson = {
			"path": rootName,
			"style": {
				"navigationBarTitleText": `${rootName} 页面`
			}
		}
		fs.writeFileSync(path.join(fsPath, '..', rootName + '.json'), JSON.stringify(pageJson, null, 4))
		log('生成文件成功',{
			level:'success',
			line:`页面配置文件 ${rootName}.json 创建成功!`
		})
	}

	buildJson(res) {
		let pageJsPath = path.join(res.fsPath,'pages.js')
		if (!fs.existsSync(pageJsPath)) {
			log('生成文件失败',{
				level:'error',
				line:`您尚未初始化 pages.js ，无需生成完整 pages.json！`
			})
			return 
		}
		let pageJsonPath = path.join(res.fsPath,'pages.json')
		let pagesJsonData = null
		try{
			pagesJsonData = require(pageJsonPath)
		}catch(e){
			//TODO handle the exception
			pagesJsonData = {}
			console.log(e);
			log('json 解析错误',{
				level:'error',
				line:e.toString()
			})
		}
		let pagesJson = getPages(pagesJsonData, {
			addDependency: () => {},
			rootPath: res.fsPath
		})
		console.log(pagesJson);
		fs.writeFileSync(path.join(res.fsPath,'pages.bak.json'), JSON.stringify(pagesJson,null,2))
		log('生成文件成功',{
			level:'success',
			line:'页面完整 pages.json 生成成功，生成文件为 pages.bak.json，请自行操作生成后文件！'
		})
	}

	_copyFile(from, to) {
		return fs.writeFileSync(to, fs.readFileSync(from))
	}
	/**
	 * 注册命令
	 */
	register() {
		return [
			hx.commands.registerCommand('extension.pageRouter', this.pageRouter.bind(this)),
			hx.commands.registerCommand('extension.pageSubpackage', this.pageSubpackage.bind(this)),
			hx.commands.registerCommand('extension.pageJson', this.pageJson.bind(this)),
			hx.commands.registerCommand('extension.buildJson', this.buildJson.bind(this))
		]
	}

}

export default Core
