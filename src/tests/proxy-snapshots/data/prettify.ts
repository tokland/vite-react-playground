import pathM from "path";
import fs from "fs";
import prettier from "prettier";

const prettierPath = pathM.join(process.cwd(), ".prettierrc.json");
const prettierContents = fs.readFileSync(prettierPath, "utf8");
const options = JSON.parse(prettierContents);

export function prettify(tsCode: string): string {
    return prettier.format(tsCode, { parser: "typescript", ...options });
}
