import fs from 'fs'
import PROJECT_CONFIG from './const'
import { getContentByExt } from './utils'

function initProject (path) {
  /** 初始化配置文件夹 */
  if (path) {
    if (!fs.existsSync(path)) {
      console.log(`输入的目录${path}不存在\n`)
      return false
    }
    console.log(`输入的目录${path}存在\n`)
    initProjectJson(path)
  } else {
    if (!fs.existsSync(PROJECT_CONFIG.dir)) {
      fs.mkdirSync(PROJECT_CONFIG.dir)
      console.log(`默认${PROJECT_CONFIG.dir}目录已生成\n`)
    } else {
      console.log(`默认${PROJECT_CONFIG.dir}目录已存在\n`)
    }
    initProjectJson(PROJECT_CONFIG.dir)
  }
  return true
}

function initProjectJson (projectDir) {
  const CONFIG_PATH = PROJECT_CONFIG.configFile
  if (fs.existsSync(CONFIG_PATH)) {
    console.log(`配置文件${CONFIG_PATH}已存在\n`)
  } else {
    const fileContent = {
      dir: projectDir,
      git: [
        {
          name: '',
          repository: '',
          branch: '',
          i18n: ''
        }
      ],
      regExp: {
        zh: ''
      },
      baidu: {
        appId: '',
        appKey: '',
        keyMap: {
          'zh-CN': 'zh'
        }
      }
    }
    fs.writeFileSync(CONFIG_PATH, getContentByExt(JSON.stringify(fileContent, null, 2), '.js'))
    console.log(`配置文件${CONFIG_PATH}已生成\n`)
  }
  console.log(`请按照文档指引填写${CONFIG_PATH}\n`)
}

export { initProject, initProjectJson }
