import fs from 'fs'
import { exec } from 'child_process'
import { promisify } from 'util'
import PROJECT_CONFIG from './const'
import path from 'path'

async function getGitConfig () {
  const CONFIG_FILE = path.resolve(process.cwd(), PROJECT_CONFIG.configFile)
  if (!fs.existsSync(CONFIG_FILE)) {
    console.log('配置文件不存在，请先进入配置文件存放的文件目录下\n')
    return false
  } else {
    const CONFIG = require(CONFIG_FILE)
    let count = 0
    while (count < CONFIG.git.length) {
      await initGitRepo(CONFIG.git[count], CONFIG.dir)
      count++
    }
    return true
  }
}

const execPromise = promisify(exec)

async function initGitRepo ({ name, repository, branch, i18n }, dir) {
  if (!name || !repository || !branch || !i18n) {
    console.log('git信息填写不完整\n')
    return
  }
  const DIR_PATH = path.resolve(process.cwd(), dir)
  const GIT_PATH = path.resolve(DIR_PATH, name)
  if (!fs.existsSync(GIT_PATH)) {
    console.log(`文件夹${GIT_PATH}不存在\n`)
    console.log(`仓库${repository}下载中...\n`)
    await execPromise(`git clone ${repository}`, { cwd: DIR_PATH })
    console.log(`稀疏检出${i18n}中...\n`)
    await execPromise('git config core.sparseCheckout true', { cwd: GIT_PATH })
    await execPromise(`git sparse-checkout set ${i18n}`, { cwd: GIT_PATH })
    console.log(`切换至${branch}分支\n`)
    await execPromise(`git checkout ${branch}`, { cwd: GIT_PATH })
  } else {
    console.log(`文件夹${GIT_PATH}已存在\n`)
    console.log(`拉取${repository}代码\n`)
    await execPromise('git pull', { cwd: GIT_PATH })
  }
}

export { getGitConfig, initGitRepo }
