import fs from 'fs'
import path from 'path'
import { getContentByExt } from './utils'

const doReplace = (object = {}) => {
  for (const key in object) {
    if (Object.hasOwnProperty.call(object, key)) {
      const element = object[key];
      if (typeof element === 'string') {
        if (element.length > 0) {
          const strArray = element.trim().split('')
          const str1 = strArray[0].toUpperCase()
          const str2 = strArray.slice(1).join('').toLowerCase()
          object[key] = `${str1}${str2}`
        }
      } else {
        doReplace(element)
      }
    }
  }
}

function replace(filePath) {
  const fileName = path.basename(filePath)
  const dirName = path.dirname(filePath)
  const extName = path.extname(filePath)
  const targetPath = path.resolve(dirName, `replace.${fileName}`)
  const fileContent = require(filePath)
  doReplace(fileContent)
  fs.writeFileSync(targetPath, getContentByExt(JSON.stringify(fileContent, null, 2), extName), err => {
    console.log(`写入文件错误：${err}`)
    return false
  })
  return true
}

export { replace }