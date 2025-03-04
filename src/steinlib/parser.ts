import {
  SteinlibParsingException,
  UnrecognizedSectionException,
} from "./exceptions";
import {
  CoordinatesSectionParser,
  CommentSectionParser,
  GraphSectionParser,
  MaximumDegreesSectionParser,
  ObstaclesSectionParser,
  PresolveSectionParser,
  TerminalsSectionParser,
  SectionParser,
} from "./section";
import { ParsingState } from "./state";

function addRegexFlags(regex: RegExp, ...flags: string[]): RegExp {
  let flagsArray: string[] = [];
  if (regex.global) {
    flagsArray.push("g");
  }
  if (regex.ignoreCase) {
    flagsArray.push("i");
  }
  if (regex.multiline) {
    flagsArray.push("m");
  }

  flagsArray.push(...flags);

  return new RegExp(regex.source, [...new Set(flagsArray)].join(""));
}

type ParserType = {
  tokenRegex: RegExp;
  callbackMethod: string;
};

type SectionParserDefinition = new () => SectionParser;

class RootParser implements ParserType {
  tokenRegex: RegExp = /./;
  callbackMethod: string = "";

  matches(line: string, steinerInstance: any): RegExpMatchArray | null {
    if (!this.tokenRegex || !this.callbackMethod) {
      throw new Error(
        `${RootParser.name} must have a tokenRegex and callbackMethod`,
      );
    }

    const regexWithIgnoreCase = addRegexFlags(this.tokenRegex, "i");
    const matchingGroups = line.match(regexWithIgnoreCase);
    if (matchingGroups) {
      const callback = steinerInstance[this.callbackMethod];
      if (callback) {
        callback(line, matchingGroups.slice(1));
      }
    } else {
      throw new SteinlibParsingException(`Unexpected line: ${line}`);
    }

    return matchingGroups;
  }
}

class RootHeaderParser extends RootParser {
  tokenRegex = /^33D32945(?:\s+)(.+)$/;
  callbackMethod = "header";
}

class RootEofParser extends RootParser {
  tokenRegex = /^EOF$/;
  callbackMethod = "eof";
}

class RootSectionParser extends RootParser {
  tokenRegex = /^SECTION(?:\s+)(\w+)$/;
  callbackMethod = "section";
  sectionParsers: Record<string, SectionParserDefinition> = {
    Comment: CommentSectionParser,
    Coordinates: CoordinatesSectionParser,
    Graph: GraphSectionParser,
    MaximumDegrees: MaximumDegreesSectionParser,
    Obstacles: ObstaclesSectionParser,
    Presolve: PresolveSectionParser,
    Terminals: TerminalsSectionParser,
  };

  getSectionParser(line: string, steinerInstance: any): SectionParser {
    const sectionMatches = this.matches(line, steinerInstance);
    const sectionName = sectionMatches ? sectionMatches[1] : null;
    const SectionParser = sectionName ? this.sectionParsers[sectionName] : null;

    if (SectionParser) {
      const callback = steinerInstance[sectionName!.toLowerCase()];
      callback?.(line, sectionMatches!.slice(1));
    } else {
      const allKnownSectionNames = Object.keys(this.sectionParsers).join(", ");
      throw new UnrecognizedSectionException(
        `Invalid section identifier "${sectionName}". Known sections: ${allKnownSectionNames}.`,
      );
    }

    return new SectionParser();
  }
}

export class SteinlibParser {
  private _lines: string[];
  private _state: ParsingState;
  private _steinerInstance: any;
  private commentSymbol = "#";

  constructor(lines: string[], steinerInstance: any) {
    this._lines = lines;
    this._state = ParsingState.wait_for_header;
    this._steinerInstance = steinerInstance;
  }

  parse() {
    let sectionClass: SectionParser | null = null;

    const rootHeaderParser = new RootHeaderParser();
    const rootSectionParser = new RootSectionParser();
    const rootEofParser = new RootEofParser();

    for (const rawLine of this._lines) {
      const line = this._cleanupLine(rawLine);

      if (!line || this._isComment(line)) {
        continue;
      }

      if (this._state === ParsingState.wait_for_header) {
        rootHeaderParser.matches(line, this._steinerInstance);
        this._state = ParsingState.wait_for_section;
      } else if (this._state === ParsingState.wait_for_section) {
        try {
          sectionClass = rootSectionParser.getSectionParser(
            line,
            this._steinerInstance,
          );
          this._state = sectionClass.sectionStart(line);
        } catch (ex) {
          if (ex instanceof UnrecognizedSectionException) {
            throw ex;
          } else if (ex instanceof SteinlibParsingException) {
            if (rootEofParser.matches(line, this._steinerInstance)) {
              this._state = ParsingState.end;
            }
          }
        }
      } else if (this._state === ParsingState.inside_section) {
        // @ts-expect-error this state cannot be enetered before sectionClass is set during the wait_for_section state
        this._state = sectionClass.parseToken(line, this._steinerInstance);
      } else if (this._state === ParsingState.end) {
        throw new SteinlibParsingException('Unexpected "EOF".');
      }
    }

    if (this._state !== ParsingState.end) {
      throw new SteinlibParsingException("Illegal state.");
    }

    return this._steinerInstance;
  }

  private _cleanupLine(line: string): string {
    return line.trim();
  }

  private _isComment(line: string): boolean {
    return line.startsWith(this.commentSymbol);
  }
}
