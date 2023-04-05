import fs from 'fs'
import nodeXlsx from 'node-xlsx'
import { getContentByExt } from './utils'

function getMessagesToImport(file) {
  const content = nodeXlsx.parse(file)
  if (!content) return false
  const mainSheet = content[0]
  const body = mainSheet.data.slice(1)
  return body;
}

function importFile(filePath, sourceFilePath, lang = 'unknown') {
  const bodyArray = getMessagesToImport(filePath)
  const fileName = path.basename(sourceFilePath)
  const dirName = path.dirname(sourceFilePath)
  const extName = path.extname(sourceFilePath)
  const targetPath = path.resolve(dirName, `import.${lang}.${fileName}`)
  const sourceFileContent = require(sourceFilePath)
  bodyArray.filter(item => !!item[0]).forEach(item => {
    const paths = item[1] && item[1].split('-')
    paths.reduce((pre, cur) => {
      const next = pre[cur]
      if (typeof next === 'string') {
        pre[cur] = item[8]
        return
      }
      return pre[cur]
    }, sourceFileContent)
  })
  fs.writeFileSync(targetPath, getContentByExt(JSON.stringify(sourceFileContent, null, 2), extName), err => {
    console.log(`写入文件错误：${err}`)
    return false
  })
  return true
}
export { importFile }