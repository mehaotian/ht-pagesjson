import path from 'path'
import {
	getPagesJsons,
	getSubPackages,
	getJsons,
	getPath
} from './pagesJsons.js'
import {readFile} from './file.js'

export function run(pagesJson, addDependency, rootPath) {
	let filesList = getPagesJsons(path.join(rootPath, 'pages'), rootPath)
	if (!pagesJson.pages) {
		pagesJson.pages = []
	}
	filesList = getSubPackages(filesList)
	// 拼接 pageJson pages
	filesList.pages.forEach(v => {
		let page = readFile(v.fsPath)
		let pageData = {
			...page
		}
		// 重新处理 path
		pageData.path = v.root + '/' + pageData.path
		getJsons(v, pagesJson, addDependency, pageData)
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
				let pageData = {
					...page
				}
				let rootPath = path.relative(root, v.root)
				rootPath = getPath(rootPath)
				pageData.path = rootPath + '/' + pageData.path
				if (pageData.path[0] === '/') {
					pageData.path = pageData.path.substr(1, pageData.path.length - 1)
				}
				getJsons(v, pageJsonSubpackages, addDependency, pageData)
				if (root) {
					let index = pagesJson.pages.findIndex(item => item.path === root + '/' + pageData.path)
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
				let pageData ={
					...page
				}
				let rootPath = path.relative(root, v.root)
				rootPath = getPath(rootPath)
				
				pageData.path = rootPath + '/' + pageData.path
				if (pageData.path[0] === '/') {
					pageData.path = pageData.path.substr(1, pageData.path.length - 1)
				}
				if (pageData) {
					subPackageData.push(pageData)
					if (root) {
						let index = pagesJson.pages.findIndex(item => item.path === root + '/' + pageData.path)
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
