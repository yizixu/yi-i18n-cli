import ora from 'ora';
/**
 * 进度条加载
 * @param text
 * @param callback
 */
async function spinning(text, callback) {
  const spinner = ora(`${text}中...\n`).start();
  if (callback) {
    if (await callback()) {
      spinner.succeed(`${text}成功\n`);
    } else {
      spinner.fail(`${text}失败\n`);
    }
  } else {
    spinner.fail(`${text}失败\n`);
  }
}
/**
 * 根据格式区分文件生成内容
 * @param text
 * @param callback
 */
function getContentByExt(content, ext) {
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
 * @param callback
 */
function sleep(min, max) {
  const duration = Math.floor(Math.random() * max) + min
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, duration * 1000);
  });
}
export { spinning, getContentByExt, sleep }