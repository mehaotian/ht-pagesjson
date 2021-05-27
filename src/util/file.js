import fs from 'fs'
import path from 'path'

export function readFile(fsPath) {
	let content = {}
	try {
		// TODO 不确认是否会有问题 ，待测试
		// content = content.replace(/\\\\u/, '\\u')
		content = require(fsPath)
	} catch (e) {
		content = false
	}
	return content
}
