import { PatternFilter } from "@decaf-ts/logging";

export class PasswordFilter extends PatternFilter {
  constructor() {
    super(/["'](password)["']\s?[:=]\s?["'](.+?)["']/gms, (substring: string, type: string, content: string) => {
      // const { env, level } = Environment;
      // if (env === "production") return `"${type}": <ommited>`;
      // if (
      //   NumericLogLevels[level as LogLevel] >=
      //   NumericLogLevels[LogLevel.debug]
      // )
      // return `"${type}": ${content.substring(0, 1)}${new Array(content.substring(1, content.length - 2).length).fill("*").join("")}${content.substring(content.length - 1)}`;
      return `"${type}": ${new Array(content.length).fill("*").join("")}`;
    });
  }
}

export class FileContentFilter extends PatternFilter {
  constructor() {
    super(/(["'])(xmlContent|fileContent|content)\1(\s?[:=]\s?)(["'])(.+?)\4/gm, (match: string, ...groups: string[]) => {
      const [quote, key, equality, otherQuote, content] = groups;
      return `${quote}${key}${quote}${equality}${otherQuote}${content.substring(0, 5)}...${content.substring(content.length - 6)}${otherQuote}`;
    });
  }
}
