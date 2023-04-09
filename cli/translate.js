import fs from 'fs'
import path from 'path'
import { getContentByExt, isOriginLang, translateText, splitStrings } from './utils'

const splitJson = (json, fromLang) => {
  const strChunks = []
  const maxLength = 2000
  const joinString = (json) => {
    let str = ''
    for (const [, value] of Object.entries(json)) {
      if (typeof value === 'object') {
        str += joinString(value)
      } else {
        if (!isOriginLang(fromLang, value)) continue
        if ((str.length + value.length) > maxLength) {
          strChunks.push(str)
          str = ''
        }
        if (value.length > maxLength) {
          strChunks.push(splitStrings(value, maxLength))
        } else {
          str += `${value}/n`
        }
      }
    }
    return str
  }
  strChunks.push(joinString(json))
  return strChunks
}

const translateJson = async (json, fromLang, toLang) => {
  const strArr = splitJson(json, fromLang)
  let translatedStr = ''
  for (const value of strArr) {
    if (typeof value === 'object') {
      for (const valueItem of value) {
        translatedStr += await translateText(valueItem, fromLang, toLang)
      }
      translatedStr += '/n'
    } else {
      translatedStr += await translateText(value, fromLang, toLang)
    }
  }
  return translatedStr
}

const fillToJson = (json, strArr, fromLang) => {
  const result = Array.isArray(json) ? [] : {}
  for (const [key, value] of Object.entries(json)) {
    if (typeof value === 'object') {
      result[key] = fillToJson(value, strArr, fromLang)
    } else {
      if (!isOriginLang(fromLang, value)) {
        result[key] = value
      } else {
        result[key] = (strArr.shift() || '').trim()
      }
    }
  }
  return result
}

async function translate (filePath, from, to) {
  const fileParams = path.parse(filePath)
  const targetPath = path.resolve(fileParams.dir, `translate.${fileParams.base}`)
  const fileJson = require(filePath)
  const translatedString = await translateJson(fileJson, from, to)
  const fileContent = await fillToJson(fileJson, translatedString.split('/n'), from)
  fs.writeFileSync(targetPath, getContentByExt(JSON.stringify(fileContent, null, 2), fileParams.ext), err => {
    console.log(`写入文件错误：${err}`)
    return false
  })
  return true
}

export {
  translate
}
