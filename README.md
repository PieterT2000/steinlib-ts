# SteinLib Typescript Parser

Inspired by [Python SteinLib](https://github.com/leandron/steinlib)

[![npm package][npm-img]][npm-url]
[![Build Status][build-img]][build-url]
[![Issues][issues-img]][issues-url]
[![Commitizen Friendly][commitizen-img]][commitizen-url]
[![License][license-img]][license-url]

> A Typescript parser for the [SteinLib](https://steinlib.zib.de/format.php) format

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

[npm-img]: https://img.shields.io/npm/v/steinlib-ts
[npm-url]: https://www.npmjs.com/package/steinlib-ts
[commitizen-img]: https://img.shields.io/badge/commitizen-friendly-brightgreen.svg
[commitizen-url]: http://commitizen.github.io/cz-cli/
[issues-img]: https://img.shields.io/github/issues/PieterT2000/steinlib-ts
[issues-url]: https://github.com/PieterT2000/steinlib-ts/issues
[downloads-img]: https://img.shields.io/npm/dt/steinlib-ts
[downloads-url]: https://www.npmtrends.com/steinlib-ts
[build-img]: https://github.com/PieterT2000/steinlib-ts/actions/workflows/changeset.yaml/badge.svg
[build-url]: https://github.com/PieterT2000/steinlib-ts/actions/workflows/changeset.yaml
[license-img]: https://img.shields.io/github/license/PieterT2000/steinlib-ts
[license-url]: https://github.com/PieterT2000/steinlib-ts/blob/main/LICENSE
