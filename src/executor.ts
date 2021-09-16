import { zencode_exec } from "zenroom";
import * as dotenv from "dotenv";
import * as yaml from "js-yaml";
import * as fs from "fs";

const CONTEXT_PLACEHOLDER = "context.get(";
const UTF8 = "utf8";
const YML_EXT = ".yml";
const ZENROOM_EXT = ".zen";

enum BLOCK_TYPE {
  ZENROOM = "zenroom-contract",
  INPUT = "input",
  OUTPUT = "output",
}

export async function execute(ymlFile: string): Promise<any> {
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
  const singleContext: any = {};

  iterateAndEvaluateExpressions(ymlContent.blocks[block], context);
  storeContext(singleContext, block, ymlContent, context);

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

const iterateAndEvaluateExpressions = (obj: any, context: any) => {
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

function storeContext(
  singleContext: any,
  block: string,
  ymlContent: any,
  context: Map<string, any>
) {
  singleContext.name = block;
  singleContext.keys = ymlContent.blocks[block].keys;
  singleContext.data = ymlContent.blocks[block].data;
  singleContext.output = ymlContent.blocks[block].output;
  singleContext.next = ymlContent.blocks[block].next;
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
