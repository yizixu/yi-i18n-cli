#!/usr/bin/env node
import { Command } from "commander";
import * as inquirer from "inquirer";
import { spinning } from "./utils.js";
import { initProject } from "./init";
import { getGitConfig } from "./git";
import { importFile } from "./import";
import { replace } from "./replace";
import { translate } from "./translate";

const program = new Command();

program
  .version("0.0.1", "-v, --version")
  .description("一个关于国际化的CLI")
  .option("--init", "初始化项目")
  .option("--git", "初始化git仓库")
  .option("-i, --import <file> <sourceFile> <lang>", "导入翻译后的excel文件(国际化文件地址，参照的模板国际化文件地址，生成文件的语言标识)")
  .option("-r, --replace <file>", "替换前后空格以及首字母大写（国际化文件地址）")
  .option("-t, --translate <file> <from> <to>", "翻译国际化文件（国际化文件地址，源语言，目标语言）")
  .parse(process.argv);

const options = program.opts();
const args = program.args;
console.log(options, args);

if (options.init) {
  (async () => {
    const result = await inquirer.prompt({
      type: "confirm",
      name: "confirm",
      default: false,
      message: "项目中是否已存在project相关目录？",
    });
    if (result.confirm) {
      const value = await inquirer.prompt({
        type: "input",
        name: "dir",
        message: "请输入相关目录：",
      });
      spinning("初始化项目", async () => {
        return await initProject(value.dir);
      });
    } else {
      spinning("初始化项目", async () => {
        return await initProject();
      });
    }
  })();
}

if (options.git) {
  spinning("拉取git仓库代码", async () => {
    return await getGitConfig();
  });
}

if (options.import) {
  spinning("导入文件", () => {
    if (options.import === true || options.sourceFile === true) {
      console.log("请按格式输入：--import <file> <sourceFile> <lang>");
      return false;
    }
    return importFile(options.import, args[0], args[1]);
  });
}

if (options.replace) {
  spinning("替换文件", () => {
    if (options.replace === true) {
      console.log("请按格式输入：--replace [file]");
      return false;
    }
    return replace(options.replace);
  });
}

if (options.translate) {
  spinning("翻译文件", async () => {
    if (options.translate === true) {
      console.log("请按格式输入：--translate <file> <from> <to>");
      return false;
    }
    return await translate(options.translate, args[0], args[1]);
  });
}
