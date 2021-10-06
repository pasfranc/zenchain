import { zencode_exec } from "zenroom";
import * as dotenv from "dotenv";
import * as yaml from "js-yaml";
import * as fs from "fs";

const CONTEXT_PLACEHOLDER = "context.get(";
const UTF8 = "utf8";
const YML_EXT = ".yml";
const ZENROOM_EXT = ".zen";
const KEYS_EXT = ".keys";

enum BLOCK_TYPE {
  ZENROOM = "zenroom-contract",
  INPUT = "input",
  OUTPUT = "output",
}

export async function executeChain(ymlFile: string): Promise<any> {
  dotenv.config();

  const fileContents = fs.readFileSync("./" + ymlFile + YML_EXT, UTF8);
  const ymlContent: any = yaml.load(fileContents);

  const context: Map<string, any> = new Map<string, any>();
  const firstBlock: string = ymlContent.first;

  return await evaluateBlock(firstBlock, context, ymlContent);
}

async function evaluateBlock(
  block: string,
  context: Map<string, any>,
  ymlContent: any
): Promise<any> {
  console.log("Current block is " + block);
  const singleContext: any = { keys: {} };

  addKeysToContext(singleContext, block);
  storeContext(singleContext, block, ymlContent, context);
  iterateAndEvaluateExpressions(context.get(block), context);

  if (ymlContent.blocks[block].type === BLOCK_TYPE.ZENROOM) {
    const zenroomResult: any = await callZenroom(block, singleContext);
    singleContext.output = JSON.parse(zenroomResult.result);
    updateContext(singleContext, context, block);
  } else if (ymlContent.blocks[block].type === BLOCK_TYPE.OUTPUT) {
    console.log(context);
    return new Promise((resolve) => {
      resolve(singleContext.output);
    });
  }
  return await evaluateBlock(singleContext.next, context, ymlContent);
}

const iterateAndEvaluateExpressions = (obj: any, context: Map<string, any>) => {
  Object.keys(obj).forEach((key: string) => {
    if (typeof obj[key] === "string") {
      if (obj[key].includes(CONTEXT_PLACEHOLDER)) {
        const evaluate = new Function("obj", "context", "return " + obj[key]);
        obj[key] = evaluate(obj[key], context);
      }
    } else if (typeof obj[key] === "object") {
      iterateAndEvaluateExpressions(obj[key], context);
    }
  });
};

function updateContext(
  singleContext: any,
  context: Map<string, any>,
  block: string
) {
  context.set(block, singleContext);
}

function addKeysToContext(singleContext: any, block: string) {
  const keysFilePath = "./src/contracts/" + block + KEYS_EXT;
  const keysFileExists = fs.existsSync(keysFilePath);

  if (keysFileExists) {
    const keys = JSON.parse(fs.readFileSync(keysFilePath, UTF8));
    Object.keys(keys).forEach((key: string) => {
      singleContext.keys[key] = keys[key];
    });
  }
}

function storeContext(
  singleContext: any,
  block: string,
  ymlContent: any,
  context: Map<string, any>
) {
  Object.keys(ymlContent.blocks[block]).forEach((key: string) => {
    singleContext[key] = ymlContent.blocks[block][key];
  });

  updateContext(singleContext, context, block);
}

async function callZenroom(block: string, singleContext: any) {
  const contract = fs.readFileSync(
    "./src/contracts/" + block + ZENROOM_EXT,
    UTF8
  );

  const zenroomResult: any = await zencode_exec(contract, {
    data: JSON.stringify(singleContext.data),
    keys: JSON.stringify(singleContext.keys),
  });
  return zenroomResult;
}
