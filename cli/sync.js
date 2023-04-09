import fs from 'fs'
import path from 'path'
import { getContentByExt } from './utils'

const syncJson = (json, targetJson) => {
  const obj = Array.isArray(json) ? [] : {}
  for (const [key, value] of Object.entries(json)) {
    if (typeof value === 'object') {
      obj[key] = syncJson(value, targetJson[key])
    } else {
      obj[key] = targetJson[key] ? targetJson[key] : json[key]
    }
  }
  return obj
}

async function sync (filePath, targetFilePath) {
  const targetFileParams = path.parse(targetFilePath)
  const fileJson = require(filePath)
  const targetFileJson = require(targetFilePath)
  const result = await syncJson(fileJson, targetFileJson)
  const targetPath = path.resolve(targetFileParams.dir, `sync.${targetFileParams.base}`)
  fs.writeFileSync(targetPath, getContentByExt(JSON.stringify(result, null, 2), targetFileParams.ext), err => {
    console.log(`写入文件错误：${err}`)
    return false
  })
  return true
}

export { sync }
