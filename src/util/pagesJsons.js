import fs from 'fs'
import path from 'path'

export function getPagesJsons(fspath, rootPath) {
	let fileLists = findJsonFile(fspath, rootPath)
	return fileLists
}

export function getPath(fsPath) {
	return fsPath.replace(/(\/|\\)/g, '/')
}

export function getSubPackages(filesList) {
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

export function getJsons(v, pagesJson, addDependency, page) {
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

function findJsonFile(fspath, rootPath) {
	let filesList = []
	let files = fs.readdirSync(fspath);
	files.forEach(function(item, index) {
		let fPath = path.join(fspath, item);
		let stat = fs.statSync(fPath);
		if (stat.isDirectory() === true) {
			let files = findJsonFile(fPath, rootPath)
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
