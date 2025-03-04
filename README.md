---

# SteinLib Typescript Parser

Inspired by [Python SteinLib](https://github.com/leandron/steinlib)

[![npm package][npm-img]][npm-url]

> A Typescript parser for the SteinLib format

## Install

```bash
npm install steinlib-ts
```

## Usage

#### 1. Define callbacks

```ts
// calbacks.ts
const callbacks = {
  graph: (rawArgs: string, listArgs: string[]) => {
    // ...
  },
  terminal: (rawArgs: string, listArgs: string[]) => {
    // ...
  },
  coordinates: (rawArgs: string, listArgs: string[]) => {
    // ...
  },
  // ...
};
```

#### 2. Setup parser

```ts
import { SteinlibParser } from "steinlib-ts";
import { callbacks } from "./callbacks";

const filePath = "path/to/file.stp";
const file = fs.readFileSync(filePath, "utf8");
const lines = file.split("\n");
const parser = new SteinlibParser(lines, callbacks);

// Will call corresponding callbacks for each parsed line
parser.parse();
```

[npm-img]: https://img.shields.io/npm/v/steinlib-ts
[npm-url]: https://www.npmjs.com/package/steinlib-ts

## Examples

**1. Clone the repository**

```bash
git clone https://github.com/pietert2000/steinlib-ts.git
```

**2. Install dependencies**

```bash
cd steinlib-ts
npm i
```

**3. Run the demo**

```bash
bun examples/demo.ts
```
