import fs from 'fs'
import path from 'path'
import { getContentByExt, isOriginLang, translateText, splitStrings, getLangKey } from './utils'

const translateJson = async (json, fromLang, toLang, maxLength = 100) => {
  const result = Array.isArray(json) ? [] : {}
  for (const [key, value] of Object.entries(json)) {
    if (typeof value === 'object') {
      result[key] = await translateJson(value, fromLang, toLang)
    } else {
      if (!isOriginLang(fromLang, value)) {
        result[key] = value
        continue
      }
      if (value.length > maxLength) {
        let strRes = ''
        for (const valueSplitted of splitStrings(value, maxLength)) {
          strRes += await translateText(valueSplitted, fromLang, toLang)
        }
        result[key] = strRes
      } else {
        result[key] = await translateText(value, fromLang, toLang)
      }
    }
  }
  return result
}

async function translateSingle (filePath, from, to) {
  from = getLangKey(from)
  to = getLangKey(to)
  const fileParams = path.parse(filePath)
  const targetPath = path.resolve(fileParams.dir, `translate.${to}${fileParams.ext}`)
  const fileJson = require(filePath)
  const result = await translateJson(fileJson, from, to)
  fs.writeFileSync(targetPath, getContentByExt(JSON.stringify(result, null, 2), fileParams.ext), err => {
    console.log(`写入文件错误：${err}`)
    return false
  })
  return true
}

export {
  translateSingle
}
