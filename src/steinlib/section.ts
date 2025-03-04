import { SteinlibParsingException } from "./exceptions";
import { ParsingState } from "./state";

interface TokenMeta {
  regex?: string;
  next_state?: ParsingState;
}

class SectionParser {
  static DEFAULT_SECTION_END = {
    regex: "^END$",
    next_state: ParsingState.wait_for_section,
  };
  callbackToken: string = "";

  sectionStart(line: string): ParsingState {
    return ParsingState.inside_section;
  }

  convertIntDigitsWhenPossible(tokens: string[]): (string | number)[] {
    return tokens.map((t) => (/\d+/.test(t) ? parseInt(t, 10) : t));
  }

  getRegexForToken(token: string, meta: TokenMeta, line: string): string {
    return meta.regex || "";
  }

  getParsedTokens(
    line: string,
  ): [string | null, (string | number)[] | null, ParsingState] {
    let matchingName: string | null = null;
    let extractedTokens: (string | number)[] | null = null;
    let nextState = ParsingState.inside_section;
    const knownTokens = this.getKnownTokens();

    for (const [name, meta] of Object.entries(knownTokens)) {
      const tokenRegex = this.getRegexForToken(name, meta, line);
      const matches = line.match(new RegExp(tokenRegex, "i"));
      if (matches) {
        matchingName = name;
        extractedTokens = matches.slice(1);
        nextState = meta.next_state || ParsingState.inside_section;
      }
    }

    return [matchingName, extractedTokens, nextState];
  }

  parseToken(line: string, steinerInstance: any): ParsingState {
    const [name, tokens, nextState] = this.getParsedTokens(line);

    if (name) {
      const methodName = `${this.callbackToken}__${name}`;
      const convertedTokens = this.convertIntDigitsWhenPossible(
        tokens?.map((t) => `${t}`) || [],
      );
      const callback = steinerInstance[methodName];
      if (callback) {
        callback(line, convertedTokens);
      }
    } else {
      throw new SteinlibParsingException(
        `Error parsing the following line: ${line}`,
      );
    }

    return nextState;
  }

  getKnownTokens(): Record<string, TokenMeta> {
    return {};
  }
}

class CommentSectionParser extends SectionParser {
  callbackToken = "comment";

  getKnownTokens(): Record<string, TokenMeta> {
    return {
      name: { regex: '^Name(?:\\s+)"(.+)"$' },
      creator: { regex: '^Creator(?:\\s+)"(.+)"$' },
      remark: { regex: '^Remark(?:\\s+)"(.+)"$' },
      problem: { regex: '^Problem(?:\\s+)"(.+)"$' },
      end: SectionParser.DEFAULT_SECTION_END,
    };
  }
}

class CoordinatesSectionParser extends SectionParser {
  callbackToken = "coordinates";

  getKnownTokens(): Record<string, TokenMeta> {
    return {
      dd: {},
      end: SectionParser.DEFAULT_SECTION_END,
    };
  }

  getRegexForToken(token: string, meta: TokenMeta, line: string): string {
    if (token === "dd") {
      return this.getDdRegex(token, meta, line);
    }
    return meta.regex || "";
  }

  getDdRegex(token: string, meta: TokenMeta, line: string): string {
    const tokenCount = line.split(/\s+/).length - 1; // ignore the first "DD"
    return `^DD${"\\s+(\\d+)".repeat(tokenCount)}$`;
  }
}

class GraphSectionParser extends SectionParser {
  callbackToken = "graph";

  getKnownTokens(): Record<string, TokenMeta> {
    return {
      obstacles: { regex: "^Obstacles(?:\\s+)(.+)$" },
      nodes: { regex: "^Nodes\\s+(\\d+)$" },
      edges: { regex: "^Edges\\s+(\\d+)$" },
      arcs: { regex: "^Arcs\\s+(\\d+)$" },
      e: { regex: "^E\\s+(\\d+)\\s+(\\d+)\\s+(\\d+)$" },
      a: { regex: "^A\\s+(\\d+)\\s+(\\d+)\\s+(\\d+)$" },
      end: SectionParser.DEFAULT_SECTION_END,
    };
  }
}

class MaximumDegreesSectionParser extends SectionParser {
  callbackToken = "maximum_degrees";

  getKnownTokens(): Record<string, TokenMeta> {
    return {
      md: { regex: "^MD\\s+(\\d+)$" },
      end: SectionParser.DEFAULT_SECTION_END,
    };
  }
}

class PresolveSectionParser extends SectionParser {
  callbackToken = "presolve";

  getKnownTokens(): Record<string, TokenMeta> {
    return {
      fixed: { regex: "^FIXED\\s+(\\d+)$" },
      lower: { regex: "^LOWER\\s+(\\d+)$" },
      upper: { regex: "^UPPER\\s+(\\d+)$" },
      time: { regex: "^TIME\\s+(\\d+)$" },
      orgnodes: { regex: "^ORGNODES\\s+(\\d+)$" },
      orgedges: { regex: "^ORGEDGES\\s+(\\d+)$" },
      ea: { regex: "^EA\\s+(\\d+)\\s+(\\d+)\\s+(\\d+)\\s+(\\d+)$" },
      ec: { regex: "^EC\\s+(\\d+)\\s+(\\d+)\\s+(\\d+)$" },
      ed: { regex: "^ED\\s+(\\d+)\\s+(\\d+)\\s+(\\d+)$" },
      es: { regex: "^ES\\s+(\\d+)\\s+(\\d+)$" },
      end: SectionParser.DEFAULT_SECTION_END,
    };
  }
}

class ObstaclesSectionParser extends SectionParser {
  callbackToken = "obstacles";

  getKnownTokens(): Record<string, TokenMeta> {
    return {
      rr: { regex: "^RR\\s+(\\d+)\\s+(\\d+)\\s+(\\d+)\\s+(\\d+)$" },
      end: SectionParser.DEFAULT_SECTION_END,
    };
  }
}

class TerminalsSectionParser extends SectionParser {
  callbackToken = "terminals";

  getKnownTokens(): Record<string, TokenMeta> {
    return {
      terminals: { regex: "^Terminals\\s+(\\d+)$" },
      rootp: { regex: "^RootP\\s+(\\d+)$" },
      t: { regex: "^T\\s+(\\d+)$" },
      tp: { regex: "^TP\\s+(\\d+)$" },
      end: SectionParser.DEFAULT_SECTION_END,
    };
  }
}

export {
  SectionParser,
  CommentSectionParser,
  CoordinatesSectionParser,
  GraphSectionParser,
  MaximumDegreesSectionParser,
  PresolveSectionParser,
  ObstaclesSectionParser,
  TerminalsSectionParser,
};
