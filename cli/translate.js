import fs from 'fs'
import md5 from 'md5'
import path from 'path'
import { getContentByExt, sleep } from './utils'
import { readFromCsv, appendToCsv } from './csv'
import PROJECT_CONFIG from './const'

const csvFilePath = path.resolve(process.cwd(), PROJECT_CONFIG.csvPath)

const translateText = async (text, fromLang, toLang) => {
  const cacheKey = `${text}_${fromLang}_${toLang}` // 构造缓存键

  const records = await readFromCsv(csvFilePath)
  const cachedTranslation = records.find(record => record[0] === cacheKey)
  // check if the translation result is already cached
  if (cachedTranslation) {
    return cachedTranslation[1]
  }
  // 如果缓存中没有对应的翻译结果，则调用百度翻译接口进行翻译，并将结果保存到缓存中
  const apiResult = await baiduTranslate(text, fromLang, toLang)
  await appendToCsv(csvFilePath, [cacheKey, apiResult])
  return apiResult
}

const baiduTranslate = async (text, fromLang, toLang) => {
  await sleep(1, 2)
  const USER_CONFIG_PATH = path.resolve(process.cwd(), PROJECT_CONFIG.configFile)
  const USER_CONFIG = require(USER_CONFIG_PATH)
  const { appId, appKey } = USER_CONFIG.baidu || {}
  const apiUrl = `http://api.fanyi.baidu.com/api/trans/vip/translate?q=${text}&from=${fromLang}&to=${toLang}&appid=${appId}&salt=${Date.now()}&sign=${md5(appId + text + Date.now() + appKey)}` // API URL
  const response = await fetch(apiUrl)
  const result = await response.json()
  if (result.error_code) {
    console.error(result.error_msg)
    return text
  } else {
    return result.trans_result[0].dst
  }
}

// 切分字符串
const splitStrings = (text, maxLength) => {
  const chunks = []
  while (text.length > maxLength) {
    const chunk = text.slice(0, maxLength)
    chunks.push(chunk)
    text = text.slice(maxLength)
  }
  chunks.push(text)
  return chunks
}

const splitJson = (json, maxLength = 2000) => {
  const strChunks = []
  const joinString = (json) => {
    let str = ''
    for (const [, value] of Object.entries(json)) {
      if (typeof value === 'object') {
        str += joinString(value)
      } else {
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
  const strArr = splitJson(json)
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

const fillToJson = (json, strArr) => {
  const result = Array.isArray(json) ? [] : {}
  for (const [key, value] of Object.entries(json)) {
    if (typeof value === 'object') {
      result[key] = fillToJson(value, strArr)
    } else {
      result[key] = strArr.shift().trim()
    }
  }
  return result
}

async function translate (filePath, from, to) {
  const fileName = path.basename(filePath)
  const dirName = path.dirname(filePath)
  const extName = path.extname(filePath)
  const targetPath = path.resolve(dirName, `translate.${fileName}`)
  const fileJson = require(filePath)
  const translatedString = await translateJson(fileJson, from, to)
  const fileContent = await fillToJson(fileJson, translatedString.split('/n'))
  fs.writeFileSync(targetPath, getContentByExt(JSON.stringify(fileContent, null, 2), extName), err => {
    console.log(`写入文件错误：${err}`)
    return false
  })
  return true
}

export {
  translate
}
