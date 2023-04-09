import fs from 'fs'
import ora from 'ora'
import path from 'path'
import md5 from 'md5'
import PROJECT_CONST from './const'
import { readFromCsv, appendToCsv } from './csv'

const USER_CONFIG_PATH = path.resolve(process.cwd(), PROJECT_CONST.configFile)
let USER_CONFIG = null

function initUserConfig () {
  if (!fs.existsSync(USER_CONFIG_PATH)) {
    console.log(`${PROJECT_CONST.configFile}配置文件不存在，请先执行--init初始化配置`)
    process.exit(1)
  }
  if (!USER_CONFIG) {
    USER_CONFIG = require(USER_CONFIG_PATH)
  }
}

/**
 * 进度条加载
 * @param text
 * @param callback
 */
async function spinning (text, callback) {
  const spinner = ora(`${text}中...\n`).start()
  if (callback) {
    if (await callback()) {
      spinner.succeed(`${text}成功\n`)
    } else {
      spinner.fail(`${text}失败\n`)
    }
  } else {
    spinner.fail(`${text}失败\n`)
  }
}
/**
 * 根据格式区分文件生成内容
 * @param content
 * @param ext
 * @return callback
 */
function getContentByExt (content, ext) {
  switch (ext) {
    case '.js':
      return `module.exports = ${content}`
    case '.json':
      return content
    default:
      return content
  }
}
/**
 * 睡眠指定范围的时间
 * @param min
 * @param max
 * @return callback
 */
function sleep (max) {
  const duration = (Math.random() + max).toFixed(2)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, duration * 1000)
  })
}
/**
 * 按最大长度切割字符串为数组
 * @param {*} text 文字
 * @param {*} maxLength 最大长度
 * @returns {array} 文字数组
 */
function splitStrings (text, maxLength = 100) {
  const chunks = []
  while (text.length > maxLength) {
    const chunk = text.slice(0, maxLength)
    chunks.push(chunk)
    text = text.slice(maxLength)
  }
  chunks.push(text)
  return chunks
}
/**
 * 计算字符是否是当前语言
 * @param {string} lang 语言
 * @param {string} value 值
 * @return {boolean} isTrue
 */
function isOriginLang (lang, value) {
  initUserConfig()
  if (!USER_CONFIG.regExp || !USER_CONFIG.regExp[lang]) {
    console.log(`${PROJECT_CONST.configFile}配置文件中属性regExp未配置正确，请先正确配置源语言正则`)
    process.exit(1)
  }
  const reg = USER_CONFIG.regExp[lang]
  const count = (value.match(reg) || []).length
  return !!count
}
/**
 * 翻译策略
 * @param {string} text 翻译文案
 * @param {string} fromLang 源语言
 * @param {string} toLang 目标语言
 * @returns {string} 翻译结果
 */
async function translateText (text, fromLang, toLang) {
  const CSV_FILE_PATH = path.resolve(process.cwd(), PROJECT_CONST.csvPath)
  // 构造缓存键
  const cacheKey = `${text}_${fromLang}_${toLang}`
  // 检查翻译结果是否已经缓存
  const records = await readFromCsv(CSV_FILE_PATH)
  const cachedTranslation = records.find(record => record[0] === cacheKey)
  if (cachedTranslation) {
    return cachedTranslation[1]
  }
  // 如果缓存中没有对应的翻译结果，则调用百度翻译接口进行翻译，并将结果保存到缓存中
  const apiResult = await baiduTranslate(text, fromLang, toLang)
  await appendToCsv(CSV_FILE_PATH, [[cacheKey, apiResult]])
  return apiResult
}
/**
 * 百度翻译
 * @param {string} text
 * @param {string} fromLang
 * @param {string} toLang
 * @returns {string} 翻译结果
 */
async function baiduTranslate (text, fromLang, toLang) {
  initUserConfig()
  await sleep(1)
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

function getLangKey (lang) {
  initUserConfig()
  const { keyMap = {} } = USER_CONFIG.baidu || {}
  const res = keyMap[lang]
  return res || lang
}

export {
  spinning,
  getContentByExt,
  sleep,
  isOriginLang,
  translateText,
  splitStrings,
  getLangKey
}
