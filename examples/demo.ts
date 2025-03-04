import { SteinlibParser } from "../src/";
import * as fs from "fs";
import { fileURLToPath } from "url";
import * as path from "path";

const callbacks = {
  comment(rawArgs: string, listArgs: string[]) {
    console.log("Comment section found");
  },

  comment__end(rawArgs: string, listArgs: string[]) {
    console.log("Comment section end");
  },

  coordinates(rawArgs: string, listArgs: string[]) {
    console.log("Coordinates section found");
  },

  eof(rawArgs: string, listArgs: string[]) {
    console.log("End of file found");
  },

  graph(rawArgs: string, listArgs: string[]) {
    console.log("Graph section found");
  },

  header(rawArgs: string, listArgs: string[]) {
    console.log("Header found");
  },

  terminals(rawArgs: string, listArgs: string[]) {
    console.log("Terminals section found");
  },
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function main() {
  const filePath = path.join(__dirname, "hello.stp");
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const lines = fileContent.split("\n");
  const myParser = new SteinlibParser(lines, callbacks);
  myParser.parse();
}

main();
