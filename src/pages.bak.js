const fs = require('fs')
const path = require('path')

function getFiles(fspath,rootPath) {
	let fileLists = findJsonFile(fspath,rootPath)
	return fileLists
}

function findJsonFile(fspath,rootPath) {
	let filesList = []
	let files = fs.readdirSync(fspath);
	files.forEach(function(item, index) {
		let fPath = path.join(fspath, item);
		let stat = fs.statSync(fPath);
		if (stat.isDirectory() === true) {
			let files = findJsonFile(fPath,rootPath)
			filesList.push(...files)
		}
		if (stat.isFile() === true) {
			// 获取文件名
			let name = item.split('.')[0]
			name = name + '.json'
			let relativePsth = path.relative(rootPath, fPath)
			let pagePath = path.join(fPath, '..', name)
			const exists = fs.existsSync(pagePath)
			if (pagePath === fPath) {
				let data = {
					fsPath: fPath,
					root: getPath(path.join(relativePsth, '..')),
					name: item
				}
				if (item.indexOf('subPackage.json') !== -1) {
					data.children = []
				}
				filesList.push(data)
			}
		}
	});
	return filesList
}

function readFile(fsPath) {
	let content = fs.readFileSync(fsPath).toString()
	if (content) {
		try {
			// TODO 不确认是否会有问题 ，待测试
			// content = content.replace(/\\\\u/, '\\u')
			content = JSON.parse(content)
		} catch (e) {
			content = false
		}
		return content
	}
	return false
}

function getSubPackages(filesList) {
	let pagesJosn = {
		pages: [],
		subPackages: {}
	}
	let subPackages = filesList.filter(v => v.name === 'subPackage.json')
	filesList.forEach(v => {
		let subData = subPackages.find(item => v.root.indexOf(item.root) !== -1 && item.name !== v.name)
		if (subData) {
			if (!pagesJosn.subPackages[subData.root]) {
				pagesJosn.subPackages[subData.root] = subData
			}
			pagesJosn.subPackages[subData.root].children.push(v)
		} else {
			if (v.name !== 'subPackage.json') {
				pagesJosn.pages.push(v)
			}
		}
	})
	return pagesJosn
}

function getJsons(v, pagesJson, addDependency, page) {
	if (page) {
		//  增加文件依赖，当该文件发生变化后，会触发编译器热更新
		addDependency(v.fsPath)
		if (pagesJson.pages.length > 0) {
			let pageItemIndex = pagesJson.pages.findIndex(v => v.path === page.path)
			if (pageItemIndex === -1) {
				pagesJson.pages.push(page)
			} else {
				pagesJson.pages[pageItemIndex] = page
			}
		} else {
			pagesJson.pages.push(page)
		}

	}
}

function getPath(fsPath) {
	return fsPath.replace(/(\/|\\)/g, '/')
}

function run(pagesJson, addDependency,rootPath) {
	let filesList = getFiles(path.join(rootPath, 'pages'),rootPath)
	if (!pagesJson.pages) {
		pagesJson.pages = []
	}
	filesList = getSubPackages(filesList)
	// 拼接 pageJson pages
	filesList.pages.forEach(v => {
		let page = readFile(v.fsPath)
		// 重新处理 path
		page.path = v.root + '/' + page.path
		getJsons(v, pagesJson, addDependency, page)
	})

	// 拼接 pageJson subpackages
	for (let root in filesList.subPackages) {
		let packages = filesList.subPackages[root]
		if (!pagesJson.subPackages) {
			pagesJson.subPackages = []
		}
		let packageItemIndex = pagesJson.subPackages.findIndex(v => path.join(v.root) === path.join(root))
		if (packageItemIndex !== -1) {
			let pageJsonSubpackages = pagesJson.subPackages[packageItemIndex]
			if (!pageJsonSubpackages.pages) {
				pageJsonSubpackages.pages = []
			}
			packages.children.forEach(v => {
				let page = readFile(v.fsPath)
				let rootPath = path.relative(root, v.root)
				rootPath = getPath(rootPath)
				page.path = rootPath + '/' + page.path
				if (page.path[0] === '/') {
					page.path = page.path.substr(1, page.path.length - 1)
				}
				getJsons(v, pageJsonSubpackages, addDependency, page)
				if (root) {
					let index = pagesJson.pages.findIndex(item => item.path === root + '/' + page.path)
					if (index !== -1) {
						pagesJson.pages.splice(index, 1)
					}
				}
			})
		} else {
			let subPackageData = []
			addDependency(packages.fsPath)
			packages.children.forEach(v => {
				addDependency(v.fsPath)
				let page = readFile(v.fsPath)
				let rootPath = path.relative(root, v.root)
				rootPath = getPath(rootPath)
				page.path = rootPath + '/' + page.path
				if (page.path[0] === '/') {
					page.path = page.path.substr(1, page.path.length - 1)
				}
				if (page) {
					subPackageData.push(page)
					if (root) {
						let index = pagesJson.pages.findIndex(item => item.path === root + '/' + page.path)
						if (index !== -1) {
							pagesJson.pages.splice(index, 1)
						}
					}
				}
			})
			pagesJson.subPackages.push({
				root: getPath(root),
				pages: subPackageData
			})
		}
	}
	// 设置首页
	let pageItem = pagesJson.pages.find(v => v.path === pagesJson.home)
	let pageItemIndex = pagesJson.pages.findIndex(v => v.path === pagesJson.home)
	if (pageItemIndex !== -1) {
		pagesJson.pages.splice(pageItemIndex, 1)
		pagesJson.pages.unshift(pageItem)
	}
	return pagesJson
}


// run(readFile(path.join(__dirname, 'pages.json')), () => {})

module.exports = function(pagesJson, {
	addDependency,
	rootPath
}) {
	if(!rootPath){
		rootPath = __dirname
	}
	console.error('项目开启路由增强插件，该日志会打印多次,属于正常现象,请无视!');
	return run(pagesJson, addDependency,rootPath)
}
