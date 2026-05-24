#!/usr/bin/env node
import {
  __publicField
} from "./chunk-PKBMQBKP.js";

// src/engine.ts
import * as fs5 from "fs/promises";
import * as np4 from "path";
import assert from "assert";

// src/content.ts
import * as fs from "fs/promises";
import * as np from "path";

// src/processors.ts
import { unified } from "unified";

// node_modules/unist-util-is/lib/index.js
var convert = (
  // Note: overloads in JSDoc can’t yet use different `@template`s.
  /**
   * @type {(
   *   (<Condition extends string>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & {type: Condition}) &
   *   (<Condition extends Props>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & Condition) &
   *   (<Condition extends TestFunction>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & Predicate<Condition, Node>) &
   *   ((test?: null | undefined) => (node?: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node) &
   *   ((test?: Test) => Check)
   * )}
   */
  /**
   * @param {Test} [test]
   * @returns {Check}
   */
  (function(test) {
    if (test === null || test === void 0) {
      return ok;
    }
    if (typeof test === "function") {
      return castFactory(test);
    }
    if (typeof test === "object") {
      return Array.isArray(test) ? anyFactory(test) : (
        // Cast because `ReadonlyArray` goes into the above but `isArray`
        // narrows to `Array`.
        propertiesFactory(
          /** @type {Props} */
          test
        )
      );
    }
    if (typeof test === "string") {
      return typeFactory(test);
    }
    throw new Error("Expected function, string, or object as test");
  })
);
function anyFactory(tests) {
  const checks = [];
  let index2 = -1;
  while (++index2 < tests.length) {
    checks[index2] = convert(tests[index2]);
  }
  return castFactory(any);
  function any(...parameters) {
    let index3 = -1;
    while (++index3 < checks.length) {
      if (checks[index3].apply(this, parameters)) return true;
    }
    return false;
  }
}
function propertiesFactory(check) {
  const checkAsRecord = (
    /** @type {Record<string, unknown>} */
    check
  );
  return castFactory(all);
  function all(node) {
    const nodeAsRecord = (
      /** @type {Record<string, unknown>} */
      /** @type {unknown} */
      node
    );
    let key;
    for (key in check) {
      if (nodeAsRecord[key] !== checkAsRecord[key]) return false;
    }
    return true;
  }
}
function typeFactory(check) {
  return castFactory(type);
  function type(node) {
    return node && node.type === check;
  }
}
function castFactory(testFunction) {
  return check;
  function check(value, index2, parent) {
    return Boolean(
      looksLikeANode(value) && testFunction.call(
        this,
        value,
        typeof index2 === "number" ? index2 : void 0,
        parent || void 0
      )
    );
  }
}
function ok() {
  return true;
}
function looksLikeANode(value) {
  return value !== null && typeof value === "object" && "type" in value;
}

// node_modules/unist-util-visit-parents/lib/color.node.js
function color(d) {
  return "\x1B[33m" + d + "\x1B[39m";
}

// node_modules/unist-util-visit-parents/lib/index.js
var empty = [];
var CONTINUE = true;
var EXIT = false;
var SKIP = "skip";
function visitParents(tree, test, visitor, reverse) {
  let check;
  if (typeof test === "function" && typeof visitor !== "function") {
    reverse = visitor;
    visitor = test;
  } else {
    check = test;
  }
  const is2 = convert(check);
  const step = reverse ? -1 : 1;
  factory(tree, void 0, [])();
  function factory(node, index2, parents) {
    const value = (
      /** @type {Record<string, unknown>} */
      node && typeof node === "object" ? node : {}
    );
    if (typeof value.type === "string") {
      const name = (
        // `hast`
        typeof value.tagName === "string" ? value.tagName : (
          // `xast`
          typeof value.name === "string" ? value.name : void 0
        )
      );
      Object.defineProperty(visit2, "name", {
        value: "node (" + color(node.type + (name ? "<" + name + ">" : "")) + ")"
      });
    }
    return visit2;
    function visit2() {
      let result = empty;
      let subresult;
      let offset;
      let grandparents;
      if (!test || is2(node, index2, parents[parents.length - 1] || void 0)) {
        result = toResult(visitor(node, parents));
        if (result[0] === EXIT) {
          return result;
        }
      }
      if ("children" in node && node.children) {
        const nodeAsParent = (
          /** @type {UnistParent} */
          node
        );
        if (nodeAsParent.children && result[0] !== SKIP) {
          offset = (reverse ? nodeAsParent.children.length : -1) + step;
          grandparents = parents.concat(nodeAsParent);
          while (offset > -1 && offset < nodeAsParent.children.length) {
            const child = nodeAsParent.children[offset];
            subresult = factory(child, offset, grandparents)();
            if (subresult[0] === EXIT) {
              return subresult;
            }
            offset = typeof subresult[1] === "number" ? subresult[1] : offset + step;
          }
        }
      }
      return result;
    }
  }
}
function toResult(value) {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === "number") {
    return [CONTINUE, value];
  }
  return value === null || value === void 0 ? empty : [value];
}

// node_modules/unist-util-visit/lib/index.js
function visit(tree, testOrVisitor, visitorOrReverse, maybeReverse) {
  let reverse;
  let test;
  let visitor;
  if (typeof testOrVisitor === "function" && typeof visitorOrReverse !== "function") {
    test = void 0;
    visitor = testOrVisitor;
    reverse = visitorOrReverse;
  } else {
    test = testOrVisitor;
    visitor = visitorOrReverse;
    reverse = maybeReverse;
  }
  visitParents(tree, test, overload, reverse);
  function overload(node, parents) {
    const parent = parents[parents.length - 1];
    const index2 = parent ? parent.children.indexOf(node) : void 0;
    return visitor(node, index2, parent);
  }
}

// src/processors.ts
import { reporter } from "vfile-reporter";

// node_modules/unist-util-stringify-position/lib/index.js
function stringifyPosition(value) {
  if (!value || typeof value !== "object") {
    return "";
  }
  if ("position" in value || "type" in value) {
    return position(value.position);
  }
  if ("start" in value || "end" in value) {
    return position(value);
  }
  if ("line" in value || "column" in value) {
    return point(value);
  }
  return "";
}
function point(point2) {
  return index(point2 && point2.line) + ":" + index(point2 && point2.column);
}
function position(pos) {
  return point(pos && pos.start) + "-" + point(pos && pos.end);
}
function index(value) {
  return value && typeof value === "number" ? value : 1;
}

// node_modules/vfile-message/lib/index.js
var VFileMessage = class extends Error {
  /**
   * Create a message for `reason`.
   *
   * > 🪦 **Note**: also has obsolete signatures.
   *
   * @overload
   * @param {string} reason
   * @param {Options | null | undefined} [options]
   * @returns
   *
   * @overload
   * @param {string} reason
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @overload
   * @param {string} reason
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @overload
   * @param {string} reason
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @param {Error | VFileMessage | string} causeOrReason
   *   Reason for message, should use markdown.
   * @param {Node | NodeLike | Options | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
   *   Configuration (optional).
   * @param {string | null | undefined} [origin]
   *   Place in code where the message originates (example:
   *   `'my-package:my-rule'` or `'my-rule'`).
   * @returns
   *   Instance of `VFileMessage`.
   */
  // eslint-disable-next-line complexity
  constructor(causeOrReason, optionsOrParentOrPlace, origin) {
    super();
    if (typeof optionsOrParentOrPlace === "string") {
      origin = optionsOrParentOrPlace;
      optionsOrParentOrPlace = void 0;
    }
    let reason = "";
    let options = {};
    let legacyCause = false;
    if (optionsOrParentOrPlace) {
      if ("line" in optionsOrParentOrPlace && "column" in optionsOrParentOrPlace) {
        options = { place: optionsOrParentOrPlace };
      } else if ("start" in optionsOrParentOrPlace && "end" in optionsOrParentOrPlace) {
        options = { place: optionsOrParentOrPlace };
      } else if ("type" in optionsOrParentOrPlace) {
        options = {
          ancestors: [optionsOrParentOrPlace],
          place: optionsOrParentOrPlace.position
        };
      } else {
        options = { ...optionsOrParentOrPlace };
      }
    }
    if (typeof causeOrReason === "string") {
      reason = causeOrReason;
    } else if (!options.cause && causeOrReason) {
      legacyCause = true;
      reason = causeOrReason.message;
      options.cause = causeOrReason;
    }
    if (!options.ruleId && !options.source && typeof origin === "string") {
      const index2 = origin.indexOf(":");
      if (index2 === -1) {
        options.ruleId = origin;
      } else {
        options.source = origin.slice(0, index2);
        options.ruleId = origin.slice(index2 + 1);
      }
    }
    if (!options.place && options.ancestors && options.ancestors) {
      const parent = options.ancestors[options.ancestors.length - 1];
      if (parent) {
        options.place = parent.position;
      }
    }
    const start = options.place && "start" in options.place ? options.place.start : options.place;
    this.ancestors = options.ancestors || void 0;
    this.cause = options.cause || void 0;
    this.column = start ? start.column : void 0;
    this.fatal = void 0;
    this.file = "";
    this.message = reason;
    this.line = start ? start.line : void 0;
    this.name = stringifyPosition(options.place) || "1:1";
    this.place = options.place || void 0;
    this.reason = this.message;
    this.ruleId = options.ruleId || void 0;
    this.source = options.source || void 0;
    this.stack = legacyCause && options.cause && typeof options.cause.stack === "string" ? options.cause.stack : "";
    this.actual = void 0;
    this.expected = void 0;
    this.note = void 0;
    this.url = void 0;
  }
};
VFileMessage.prototype.file = "";
VFileMessage.prototype.name = "";
VFileMessage.prototype.reason = "";
VFileMessage.prototype.message = "";
VFileMessage.prototype.stack = "";
VFileMessage.prototype.column = void 0;
VFileMessage.prototype.line = void 0;
VFileMessage.prototype.ancestors = void 0;
VFileMessage.prototype.cause = void 0;
VFileMessage.prototype.fatal = void 0;
VFileMessage.prototype.place = void 0;
VFileMessage.prototype.ruleId = void 0;
VFileMessage.prototype.source = void 0;

// node_modules/vfile/lib/minpath.js
import { default as default2 } from "path";

// node_modules/vfile/lib/minproc.js
import { default as default3 } from "process";

// node_modules/vfile/lib/minurl.js
import { fileURLToPath } from "url";

// node_modules/vfile/lib/minurl.shared.js
function isUrl(fileUrlOrPath) {
  return Boolean(
    fileUrlOrPath !== null && typeof fileUrlOrPath === "object" && "href" in fileUrlOrPath && fileUrlOrPath.href && "protocol" in fileUrlOrPath && fileUrlOrPath.protocol && // @ts-expect-error: indexing is fine.
    fileUrlOrPath.auth === void 0
  );
}

// node_modules/vfile/lib/index.js
var order = (
  /** @type {const} */
  [
    "history",
    "path",
    "basename",
    "stem",
    "extname",
    "dirname"
  ]
);
var VFile = class {
  /**
   * Create a new virtual file.
   *
   * `options` is treated as:
   *
   * *   `string` or `Uint8Array` — `{value: options}`
   * *   `URL` — `{path: options}`
   * *   `VFile` — shallow copies its data over to the new file
   * *   `object` — all fields are shallow copied over to the new file
   *
   * Path related fields are set in the following order (least specific to
   * most specific): `history`, `path`, `basename`, `stem`, `extname`,
   * `dirname`.
   *
   * You cannot set `dirname` or `extname` without setting either `history`,
   * `path`, `basename`, or `stem` too.
   *
   * @param {Compatible | null | undefined} [value]
   *   File value.
   * @returns
   *   New instance.
   */
  constructor(value) {
    let options;
    if (!value) {
      options = {};
    } else if (isUrl(value)) {
      options = { path: value };
    } else if (typeof value === "string" || isUint8Array(value)) {
      options = { value };
    } else {
      options = value;
    }
    this.cwd = "cwd" in options ? "" : default3.cwd();
    this.data = {};
    this.history = [];
    this.messages = [];
    this.value;
    this.map;
    this.result;
    this.stored;
    let index2 = -1;
    while (++index2 < order.length) {
      const field2 = order[index2];
      if (field2 in options && options[field2] !== void 0 && options[field2] !== null) {
        this[field2] = field2 === "history" ? [...options[field2]] : options[field2];
      }
    }
    let field;
    for (field in options) {
      if (!order.includes(field)) {
        this[field] = options[field];
      }
    }
  }
  /**
   * Get the basename (including extname) (example: `'index.min.js'`).
   *
   * @returns {string | undefined}
   *   Basename.
   */
  get basename() {
    return typeof this.path === "string" ? default2.basename(this.path) : void 0;
  }
  /**
   * Set basename (including extname) (`'index.min.js'`).
   *
   * Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
   * on windows).
   * Cannot be nullified (use `file.path = file.dirname` instead).
   *
   * @param {string} basename
   *   Basename.
   * @returns {undefined}
   *   Nothing.
   */
  set basename(basename3) {
    assertNonEmpty(basename3, "basename");
    assertPart(basename3, "basename");
    this.path = default2.join(this.dirname || "", basename3);
  }
  /**
   * Get the parent path (example: `'~'`).
   *
   * @returns {string | undefined}
   *   Dirname.
   */
  get dirname() {
    return typeof this.path === "string" ? default2.dirname(this.path) : void 0;
  }
  /**
   * Set the parent path (example: `'~'`).
   *
   * Cannot be set if there’s no `path` yet.
   *
   * @param {string | undefined} dirname
   *   Dirname.
   * @returns {undefined}
   *   Nothing.
   */
  set dirname(dirname3) {
    assertPath(this.basename, "dirname");
    this.path = default2.join(dirname3 || "", this.basename);
  }
  /**
   * Get the extname (including dot) (example: `'.js'`).
   *
   * @returns {string | undefined}
   *   Extname.
   */
  get extname() {
    return typeof this.path === "string" ? default2.extname(this.path) : void 0;
  }
  /**
   * Set the extname (including dot) (example: `'.js'`).
   *
   * Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
   * on windows).
   * Cannot be set if there’s no `path` yet.
   *
   * @param {string | undefined} extname
   *   Extname.
   * @returns {undefined}
   *   Nothing.
   */
  set extname(extname4) {
    assertPart(extname4, "extname");
    assertPath(this.dirname, "extname");
    if (extname4) {
      if (extname4.codePointAt(0) !== 46) {
        throw new Error("`extname` must start with `.`");
      }
      if (extname4.includes(".", 1)) {
        throw new Error("`extname` cannot contain multiple dots");
      }
    }
    this.path = default2.join(this.dirname, this.stem + (extname4 || ""));
  }
  /**
   * Get the full path (example: `'~/index.min.js'`).
   *
   * @returns {string}
   *   Path.
   */
  get path() {
    return this.history[this.history.length - 1];
  }
  /**
   * Set the full path (example: `'~/index.min.js'`).
   *
   * Cannot be nullified.
   * You can set a file URL (a `URL` object with a `file:` protocol) which will
   * be turned into a path with `url.fileURLToPath`.
   *
   * @param {URL | string} path
   *   Path.
   * @returns {undefined}
   *   Nothing.
   */
  set path(path) {
    if (isUrl(path)) {
      path = fileURLToPath(path);
    }
    assertNonEmpty(path, "path");
    if (this.path !== path) {
      this.history.push(path);
    }
  }
  /**
   * Get the stem (basename w/o extname) (example: `'index.min'`).
   *
   * @returns {string | undefined}
   *   Stem.
   */
  get stem() {
    return typeof this.path === "string" ? default2.basename(this.path, this.extname) : void 0;
  }
  /**
   * Set the stem (basename w/o extname) (example: `'index.min'`).
   *
   * Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
   * on windows).
   * Cannot be nullified (use `file.path = file.dirname` instead).
   *
   * @param {string} stem
   *   Stem.
   * @returns {undefined}
   *   Nothing.
   */
  set stem(stem) {
    assertNonEmpty(stem, "stem");
    assertPart(stem, "stem");
    this.path = default2.join(this.dirname || "", stem + (this.extname || ""));
  }
  // Normal prototypal methods.
  /**
   * Create a fatal message for `reason` associated with the file.
   *
   * The `fatal` field of the message is set to `true` (error; file not usable)
   * and the `file` field is set to the current file path.
   * The message is added to the `messages` field on `file`.
   *
   * > 🪦 **Note**: also has obsolete signatures.
   *
   * @overload
   * @param {string} reason
   * @param {MessageOptions | null | undefined} [options]
   * @returns {never}
   *
   * @overload
   * @param {string} reason
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns {never}
   *
   * @overload
   * @param {string} reason
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns {never}
   *
   * @overload
   * @param {string} reason
   * @param {string | null | undefined} [origin]
   * @returns {never}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns {never}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns {never}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {string | null | undefined} [origin]
   * @returns {never}
   *
   * @param {Error | VFileMessage | string} causeOrReason
   *   Reason for message, should use markdown.
   * @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
   *   Configuration (optional).
   * @param {string | null | undefined} [origin]
   *   Place in code where the message originates (example:
   *   `'my-package:my-rule'` or `'my-rule'`).
   * @returns {never}
   *   Never.
   * @throws {VFileMessage}
   *   Message.
   */
  fail(causeOrReason, optionsOrParentOrPlace, origin) {
    const message = this.message(causeOrReason, optionsOrParentOrPlace, origin);
    message.fatal = true;
    throw message;
  }
  /**
   * Create an info message for `reason` associated with the file.
   *
   * The `fatal` field of the message is set to `undefined` (info; change
   * likely not needed) and the `file` field is set to the current file path.
   * The message is added to the `messages` field on `file`.
   *
   * > 🪦 **Note**: also has obsolete signatures.
   *
   * @overload
   * @param {string} reason
   * @param {MessageOptions | null | undefined} [options]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {string} reason
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {string} reason
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {string} reason
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @param {Error | VFileMessage | string} causeOrReason
   *   Reason for message, should use markdown.
   * @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
   *   Configuration (optional).
   * @param {string | null | undefined} [origin]
   *   Place in code where the message originates (example:
   *   `'my-package:my-rule'` or `'my-rule'`).
   * @returns {VFileMessage}
   *   Message.
   */
  info(causeOrReason, optionsOrParentOrPlace, origin) {
    const message = this.message(causeOrReason, optionsOrParentOrPlace, origin);
    message.fatal = void 0;
    return message;
  }
  /**
   * Create a message for `reason` associated with the file.
   *
   * The `fatal` field of the message is set to `false` (warning; change may be
   * needed) and the `file` field is set to the current file path.
   * The message is added to the `messages` field on `file`.
   *
   * > 🪦 **Note**: also has obsolete signatures.
   *
   * @overload
   * @param {string} reason
   * @param {MessageOptions | null | undefined} [options]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {string} reason
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {string} reason
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {string} reason
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @param {Error | VFileMessage | string} causeOrReason
   *   Reason for message, should use markdown.
   * @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
   *   Configuration (optional).
   * @param {string | null | undefined} [origin]
   *   Place in code where the message originates (example:
   *   `'my-package:my-rule'` or `'my-rule'`).
   * @returns {VFileMessage}
   *   Message.
   */
  message(causeOrReason, optionsOrParentOrPlace, origin) {
    const message = new VFileMessage(
      // @ts-expect-error: the overloads are fine.
      causeOrReason,
      optionsOrParentOrPlace,
      origin
    );
    if (this.path) {
      message.name = this.path + ":" + message.name;
      message.file = this.path;
    }
    message.fatal = false;
    this.messages.push(message);
    return message;
  }
  /**
   * Serialize the file.
   *
   * > **Note**: which encodings are supported depends on the engine.
   * > For info on Node.js, see:
   * > <https://nodejs.org/api/util.html#whatwg-supported-encodings>.
   *
   * @param {string | null | undefined} [encoding='utf8']
   *   Character encoding to understand `value` as when it’s a `Uint8Array`
   *   (default: `'utf-8'`).
   * @returns {string}
   *   Serialized file.
   */
  toString(encoding) {
    if (this.value === void 0) {
      return "";
    }
    if (typeof this.value === "string") {
      return this.value;
    }
    const decoder = new TextDecoder(encoding || void 0);
    return decoder.decode(this.value);
  }
};
function assertPart(part, name) {
  if (part && part.includes(default2.sep)) {
    throw new Error(
      "`" + name + "` cannot be a path: did not expect `" + default2.sep + "`"
    );
  }
}
function assertNonEmpty(part, name) {
  if (!part) {
    throw new Error("`" + name + "` cannot be empty");
  }
}
function assertPath(path, name) {
  if (!path) {
    throw new Error("Setting `" + name + "` requires `path` to be set too");
  }
}
function isUint8Array(value) {
  return Boolean(
    value && typeof value === "object" && "byteLength" in value && "byteOffset" in value
  );
}

// src/processors.ts
import yaml from "yaml";
import { refractor } from "refractor/all";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import remarkFrontmatter from "remark-frontmatter";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkSmartypants from "remark-smartypants";
import rehypeParse from "rehype-parse";
var MarkdownProcessor = class {
  constructor(opts) {
    __publicField(this, "processor");
    const remarkParseFrontmatterYAML = () => {
      return function(tree, file) {
        visit(tree, "yaml", (node) => {
          file.data.matter = yaml.parse(node.value);
          return EXIT;
        });
      };
    };
    const rehypeRefractor = () => {
      return function(tree) {
        visit(tree, { tagName: "code" }, (node, _, parent) => {
          if (!parent || parent.type == "root" || parent.tagName != "pre" || node.children.length != 1 || node.children[0].type != "text") {
            return CONTINUE;
          }
          const className = node.properties.className;
          if (!(className && typeof className == "object" && typeof className[0] == "string")) {
            node.properties.className = ["language-text"];
            parent.properties.className = ["language-text"];
            return CONTINUE;
          }
          const lang = className[0].replace("language-", "");
          node.properties.className = [`language-${lang}`];
          parent.properties.className = [`language-${lang}`];
          const code = refractor.highlight(
            node.children[0].value,
            lang
          );
          node.children = code.children;
          return CONTINUE;
        });
      };
    };
    this.processor = unified().use(remarkParse).use(remarkFrontmatter).use(remarkParseFrontmatterYAML);
    if (opts.enableSmartypants) {
      this.processor.use(remarkSmartypants);
    }
    if (opts.enableGfm) {
      this.processor.use(remarkGfm);
    }
    for (const plugin of opts.remarkPlugins) {
      if (plugin[0] && plugin[1]) {
        this.processor.use(plugin[0], plugin[1]);
      } else {
        this.processor.use(plugin);
      }
    }
    this.processor.use(remarkRehype, { allowDangerousHtml: true });
    for (const plugin of opts.rehypePlugins) {
      if (plugin[0] && plugin[1]) {
        this.processor.use(plugin[0], plugin[1]);
      } else {
        this.processor.use(plugin);
      }
    }
    if (opts.enableSyntaxHighlighting) {
      this.processor.use(rehypeRefractor);
    }
    this.processor.use(rehypeRaw).use(rehypeStringify, { allowDangerousHtml: true });
  }
  async parse(text) {
    const file = new VFile({ value: text });
    const result = await this.processor.process(file);
    const report = reporter(file, { quiet: true });
    if (report) {
      console.error(report);
    }
    return { content: String(result), frontmatter: result.data.matter };
  }
};
var HtmlProcessor = class {
  constructor(opts) {
    __publicField(this, "processor");
    this.processor = unified().use(rehypeParse);
    for (const plugin of opts.rehypePlugins) {
      if (plugin[0] && plugin[1]) {
        this.processor.use(plugin[0], plugin[1]);
      } else {
        this.processor.use(plugin);
      }
    }
    this.processor.use(rehypeStringify);
  }
  async parse(text) {
    const file = new VFile({ value: text });
    const result = await this.processor.process(file);
    const report = reporter(file, { quiet: true });
    if (report) {
      console.error(report);
    }
    return String(result);
  }
};
__publicField(HtmlProcessor, "scriptName", "norite-reload.js");

// src/content.ts
var ContentNode = class {
  constructor(type, path, sourceDir) {
    __publicField(this, "type");
    __publicField(this, "slug");
    __publicField(this, "_path");
    __publicField(this, "_sourcePath");
    __publicField(this, "_outputPath");
    __publicField(this, "_stage");
    __publicField(this, "frontmatter", { template: "" });
    __publicField(this, "content", "");
    __publicField(this, "html", "");
    this.type = type;
    this._path = path;
    this._sourcePath = np.join(sourceDir, path);
    this._outputPath = path;
    this.slug = np.join("/", path);
    if (type == "page") {
      let filename = `${np.basename(path, np.extname(path))}.html`;
      if (path.startsWith("[") && path.endsWith("].json")) {
        filename = np.basename(path, np.extname(path)).replace("[", "").replace("]", "");
      }
      this._outputPath = np.join(np.dirname(path), filename);
      if (filename == "index.html") {
        this.slug = np.join("/", np.dirname(path));
      } else {
        this.slug = np.join("/", np.dirname(path), filename);
      }
    }
    this._stage = "loaded";
  }
  async transform(engine) {
    this.frontmatter = { template: "" };
    this.content = "";
    this.html = "";
    if (this.type != "page") {
      this._stage = "transformed";
      return;
    }
    const text = await fs.readFile(this._sourcePath, { encoding: "utf8" });
    const ext = np.extname(this._sourcePath);
    if (ext == ".json") {
      Object.assign(this.frontmatter, JSON.parse(text));
    }
    if (ext == ".md") {
      const result = await engine.markdownProcessor.parse(text);
      this.content = result.content;
      Object.assign(this.frontmatter, result.frontmatter);
    }
    this._stage = "transformed";
  }
  async render(engine) {
    if (this.type != "page") {
      this._stage = "rendered";
      return;
    }
    const context3 = {
      content: this.content,
      frontmatter: this.frontmatter,
      slug: this.slug,
      globals: engine.config.globals,
      nodes: engine.nodes
    };
    let renderedText = await engine.templateEngine.render(
      this.frontmatter.template,
      context3
    );
    if (np.extname(this._outputPath) != ".html") {
      this.html = renderedText;
      this._stage = "rendered";
      return;
    }
    if (!renderedText.startsWith("<!DOCTYPE html>")) {
      renderedText = `<!DOCTYPE html>
${renderedText}`;
    }
    this.html = await engine.htmlProcessor.parse(renderedText);
    if (engine.mode == "dev") {
      this.html = this.html.replace(
        "</body>",
        `<script src='/${HtmlProcessor.scriptName}'></script>
</body>`
      );
    }
    this._stage = "rendered";
  }
  async build(opts) {
    const outPath = np.join(opts.outputDir, this._outputPath);
    const parent = np.dirname(outPath);
    await fs.access(parent).catch(async () => {
      await fs.mkdir(parent, { recursive: true });
    });
    if (this.type == "asset") {
      if (opts.link) {
        await fs.symlink(np.resolve(this._sourcePath), outPath);
      } else {
        await fs.cp(this._sourcePath, outPath);
      }
    }
    if (this.type == "page") {
      await fs.writeFile(outPath, this.html);
    }
    this._stage = "built";
  }
};
function detectNodeType(path) {
  const name = np.basename(path);
  if (name == "index.json" || np.extname(name) == ".md" || name.startsWith("[") && name.endsWith("].json")) {
    return "page";
  }
  return "asset";
}
async function loadDirTree(opts) {
  const paths = [opts.initialPath];
  const nodes = [];
  const testPath = np.join(opts.sourceDir, opts.initialPath);
  await fs.access(testPath).catch(() => {
    throw new Error(`'${testPath}' not found`);
  });
  while (paths.length > 0) {
    const route = paths.pop();
    const path = np.join(opts.sourceDir, route);
    const lstat2 = await fs.lstat(path);
    if (lstat2.isDirectory()) {
      const dir = await fs.opendir(path);
      for await (const file of dir) {
        paths.push(np.join(route, file.name));
      }
      continue;
    }
    if (lstat2.isFile() && detectNodeType(path) == "page") {
      nodes.push(new ContentNode("page", route, opts.sourceDir));
      continue;
    }
    nodes.push(new ContentNode("asset", route, opts.sourceDir));
  }
  for (let i = 0; i <= nodes.length - 2; i++) {
    for (let j = i + 1; j <= nodes.length - 1; j++) {
      if (nodes[i].slug == nodes[j].slug) {
        throw new Error(
          `both '${np.join(opts.sourceDir, nodes[i]._path)}' and '${np.join(opts.sourceDir, nodes[j]._path)}' map to same output file`
        );
      }
    }
  }
  return nodes;
}

// src/template.ts
import * as fs4 from "fs/promises";
import * as np3 from "path";

// src/plugins/norite-bundler.ts
import * as fs3 from "fs/promises";
import * as np2 from "path";
import * as esbuild from "esbuild";

// src/plugins/norite-postcss.ts
import * as fs2 from "fs/promises";
import postcss from "postcss";
import postcssrc from "postcss-load-config";
function noritePostcss() {
  return {
    name: "norite-postcss",
    async setup(build) {
      let postcssConfig;
      await postcssrc().then((config) => postcssConfig = config).catch((err) => {
        if (err instanceof Error && /No PostCSS Config found/i.test(err.message)) {
          postcssConfig = false;
        } else {
          throw err;
        }
      });
      build.onLoad({ filter: /.*\.css$/ }, async (args) => {
        if (!postcssConfig) {
          return { loader: "css" };
        }
        const css = await fs2.readFile(args.path, "utf8");
        const result = await postcss(postcssConfig.plugins).process(css, {
          ...postcssConfig.options,
          from: args.path,
          to: args.path
        });
        const warnings = result.warnings().map((warn) => {
          return {
            text: warn.text,
            location: warn.node?.source?.start ? {
              file: args.path,
              line: warn.node.source.start.line,
              column: warn.node.source.start.column
            } : void 0
          };
        });
        return {
          contents: result.css,
          loader: "css",
          warnings
          // watchFiles,
          // watchDirs,
        };
      });
    }
  };
}

// src/plugins/norite-bundler.ts
function noriteBundler(outBase, outDir, bundleDir, enablePostCSS, contextCache) {
  const noritePostcssPlugin = noritePostcss();
  async function onResolve(prefix, args, build) {
    let path = args.path.replace(`${prefix}:`, "");
    const ext = np2.extname(path);
    if (prefix == "bundle" && ext != ".js" && ext != ".ts" && ext != ".css") {
      return { errors: [{
        text: `filetype '${ext}' not supported in 'bundle:' paths`
      }] };
    }
    const result = await build.resolve(path, {
      kind: args.kind,
      resolveDir: args.resolveDir,
      importer: args.importer
    });
    if (result.errors.length > 0) {
      return { errors: result.errors };
    }
    path = result.path;
    if (prefix == "bundle" && ext == ".ts") {
      path = np2.join(
        np2.dirname(result.path),
        `${np2.basename(result.path, ext)}.js`
      );
    }
    return {
      warnings: result.warnings,
      path,
      namespace: `norite-${prefix}`,
      pluginData: { norite: { originalPath: result.path } }
    };
  }
  async function getBundledPath(esbuildOpts, args) {
    if (!contextCache[args.path]) {
      contextCache[args.path] = await esbuild.context(esbuildOpts);
    }
    const result = await contextCache[args.path].rebuild();
    let bundlePath;
    const originalPath = args.pluginData.norite.originalPath ?? "";
    for (const [path, obj] of Object.entries(result.metafile.outputs)) {
      if (obj.entryPoint && np2.resolve(obj.entryPoint) == originalPath) {
        bundlePath = path.replace(outDir, "");
        break;
      }
    }
    return {
      contents: `export default '${bundlePath}'`,
      loader: "js"
    };
  }
  async function onLoadBundle(args) {
    const filetypes = [
      // images
      "apng",
      "bmp",
      "png",
      "jpg",
      "jpeg",
      "jfif",
      "pjpeg",
      "pjp",
      "gif",
      "svg",
      "ico",
      "webp",
      "avif",
      "cur",
      "jxl",
      // media
      "mp4",
      "webm",
      "ogg",
      "mp3",
      "wav",
      "flac",
      "aac",
      "opus",
      "mov",
      "m4a",
      "vtt",
      // fonts
      "woff",
      "woff2",
      "eot",
      "ttf",
      "otf",
      // other
      "webmanifest",
      "pdf",
      "txt",
      "vert",
      "frag",
      "glsl",
      "comp"
    ];
    return getBundledPath({
      entryPoints: [args.path],
      outbase: outBase,
      outdir: outDir,
      assetNames: `${bundleDir}/[ext]/[name]-[hash]`,
      entryNames: `${bundleDir}/[ext]/[name]-[hash]`,
      format: "esm",
      bundle: true,
      metafile: true,
      loader: Object.fromEntries(
        filetypes.map((x) => [`.${x}`, "file"])
      ),
      plugins: enablePostCSS ? [noritePostcssPlugin] : []
    }, args);
  }
  async function onLoadUrl(args) {
    const ext = np2.extname(args.path);
    return getBundledPath({
      entryPoints: [args.path],
      outbase: outBase,
      outdir: outDir,
      entryNames: `${bundleDir}/[ext]/[name]-[hash]`,
      metafile: true,
      loader: { [ext]: "copy" }
    }, args);
  }
  return {
    name: "norite-bundler",
    setup(build) {
      build.onResolve(
        { filter: /^bundle:.*$/ },
        (args) => onResolve("bundle", args, build)
      );
      build.onLoad(
        { filter: /^.*$/, namespace: "norite-bundle" },
        (args) => onLoadBundle(args)
      );
      build.onResolve(
        { filter: /^url:.*$/ },
        (args) => onResolve("url", args, build)
      );
      build.onLoad(
        { filter: /^.*$/, namespace: "norite-url" },
        (args) => onLoadUrl(args)
      );
      build.onResolve(
        { filter: /^raw:.*$/ },
        (args) => onResolve("raw", args, build)
      );
      build.onLoad(
        { filter: /^.*$/, namespace: "norite-raw" },
        async (args) => {
          const text = await fs3.readFile(args.path, "utf8");
          return {
            contents: `export default ${JSON.stringify(text)}`,
            loader: "js",
            watchFiles: [args.path]
          };
        }
      );
    }
  };
}

// src/template.ts
import * as esbuild2 from "esbuild";
import { render } from "preact-render-to-string";
var _TemplateEngine = class _TemplateEngine {
  constructor(ctx, opts, bundlerContextCache) {
    __publicField(this, "templates", {});
    __publicField(this, "noDefaultImportFiles", []);
    __publicField(this, "_sourceDir");
    __publicField(this, "_cacheDir");
    __publicField(this, "_esbuildContext");
    __publicField(this, "_bundlerContextCache");
    this._esbuildContext = ctx;
    this._bundlerContextCache = bundlerContextCache;
    this._sourceDir = opts.sourceDir;
    this._cacheDir = opts.cacheDir;
  }
  static async new(opts) {
    const bundlerContextCache = {};
    const ctx = await esbuild2.context({
      entryPoints: [
        // np.join(opts.sourceDir, '/**/*.js'),
        // np.join(opts.sourceDir, '/**/*.ts'),
        np3.join(opts.sourceDir, "/**/*.jsx"),
        np3.join(opts.sourceDir, "/**/*.tsx")
      ],
      outbase: opts.sourceDir,
      outdir: opts.cacheDir,
      assetNames: `${_TemplateEngine.bundleDir}/[ext]/[name]-[hash]`,
      // chunkNames: 'chunks/[name]-[hash]',
      format: "esm",
      platform: "node",
      bundle: true,
      metafile: true,
      logOverride: {
        "empty-glob": "info"
      },
      // write: false,
      jsx: "automatic",
      jsxFactory: "h",
      jsxFragment: "Fragment",
      jsxImportSource: "norite",
      external: ["norite/jsx-runtime"],
      plugins: [
        noriteBundler(
          opts.sourceDir,
          opts.cacheDir,
          _TemplateEngine.bundleDir,
          opts.enablePostCSS,
          bundlerContextCache
        )
      ]
    });
    return new _TemplateEngine(ctx, opts, bundlerContextCache);
  }
  dispose() {
    this._esbuildContext.dispose();
    for (const ctx of Object.values(this._bundlerContextCache)) {
      ctx.dispose();
    }
  }
  async parse() {
    await fs4.access(this._sourceDir);
    try {
      await fs4.access(this._cacheDir);
      await fs4.rm(this._cacheDir, { recursive: true });
    } catch {
    }
    await fs4.mkdir(this._cacheDir, { recursive: true });
    this.templates = {};
    this.noDefaultImportFiles = [];
    const result = await this._esbuildContext.rebuild();
    for (const [path, obj] of Object.entries(result.metafile.outputs)) {
      const name = path.replace(`${this._cacheDir}/`, "").replace(np3.extname(path), "");
      const ext = np3.extname(obj.entryPoint ?? "");
      if (ext != ".tsx" && ext != ".jsx") {
        continue;
      }
      if (!obj.exports || !obj.exports.includes("default")) {
        this.noDefaultImportFiles.push(name);
        continue;
      }
      const fullpath = `${np3.resolve(path)}?d=${Date.now()}`;
      this.templates[name] = { path: fullpath };
    }
  }
  async render(templateName, context3) {
    if (this.noDefaultImportFiles.includes(templateName)) {
      throw new Error(
        `'${templateName}' does not have a default export, export a function that returns JSX or a string`
      );
    }
    if (!(templateName in this.templates)) {
      throw new Error(`template '${templateName}' not found`);
    }
    if (!this.templates[templateName].render) {
      const module = await import(this.templates[templateName].path);
      this.templates[templateName].render = module.default;
    }
    if (typeof this.templates[templateName].render != "function") {
      throw new Error(
        `default export of '${templateName}' is not a function, export a function that returns JSX or a string`
      );
    }
    const output = this.templates[templateName].render(context3);
    if (typeof output == "string") {
      return output;
    }
    return render(output);
  }
};
// _require = Module.createRequire(import.meta.url)
__publicField(_TemplateEngine, "templateDir", "templates");
__publicField(_TemplateEngine, "bundleDir", "bundle");
var TemplateEngine = _TemplateEngine;

// src/server.ts
import connect from "connect";
import serveStatic from "serve-static";
import colors from "yoctocolors";
import http from "http";
import { WebSocketServer } from "ws";
function createDevServer(dir, config) {
  const connectServer = connect();
  connectServer.use((req, res, next) => {
    if (req.url === `/${HtmlProcessor.scriptName}`) {
      res.setHeader("Content-Type", "application/javascript");
      res.end(reloadScript);
      return;
    }
    next();
  });
  connectServer.use(serveStatic(dir, { cacheControl: false }));
  const server = http.createServer(connectServer);
  server.listen(
    config.server.port,
    config.server.host,
    () => {
      console.log(
        `Listening on ${colors.green(config.server.host)}:${colors.cyan(config.server.port.toString())}!`
      );
    }
  );
  const wss = new WebSocketServer({ server });
  function broadcastReload() {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send("reload");
      }
    });
  }
  return broadcastReload;
}
var reloadScript = `
var protocol = window.location.protocol === 'http:' ? 'ws://' : 'wss://';
var address = protocol + window.location.host + window.location.pathname + '/ws';
var socket = new WebSocket(address);
socket.onmessage = function(msg) {
    if (msg.data == 'reload') window.location.reload();
    // else if (msg.data == 'refreshcss') refreshCSS();
};
console.log('Norite: Live reload enabled.');
`;

// src/engine.ts
import colors2 from "yoctocolors";
import chokidar from "chokidar";
var Engine = class _Engine {
  constructor(config, mode, markdownProcessor, HtmlProcessor2, templateEngine) {
    __publicField(this, "config");
    __publicField(this, "nodes");
    __publicField(this, "markdownProcessor");
    __publicField(this, "htmlProcessor");
    __publicField(this, "templateEngine");
    __publicField(this, "mode");
    __publicField(this, "_devOutputDir");
    this.nodes = [];
    this.config = config;
    this.markdownProcessor = markdownProcessor;
    this.htmlProcessor = HtmlProcessor2;
    this.templateEngine = templateEngine;
    this.mode = mode;
    this._devOutputDir = np4.join(config.internal.cacheDir, "output");
  }
  static async new(config, mode) {
    return new _Engine(
      config,
      mode,
      new MarkdownProcessor(config.markdown),
      new HtmlProcessor(config.html),
      await TemplateEngine.new({
        sourceDir: config.templatesDir,
        cacheDir: np4.join(config.internal.cacheDir, "templates"),
        enablePostCSS: config.enablePostCSS
      })
    );
  }
  async _loadNodes() {
    const contentNodes = await loadDirTree({
      sourceDir: this.config.contentDir,
      initialPath: ""
    });
    if (contentNodes.length == 0) {
      console.warn(colors2.yellow(
        `warning: content directory '${this.config.contentDir}' has no files`
      ));
    }
    const bundleNodes = await loadDirTree({
      sourceDir: np4.join(
        this.config.internal.cacheDir,
        TemplateEngine.templateDir
      ),
      initialPath: TemplateEngine.bundleDir
    });
    this.nodes = contentNodes.concat(bundleNodes);
  }
  async _transformAndRenderNodes() {
    const tasks = [];
    for (const node of this.nodes) {
      tasks.push(node.transform(this));
    }
    await Promise.all(tasks);
    for (const node of this.nodes) {
      assert(
        node._stage != "loaded",
        "attempt to render nodes before all nodes transformed"
      );
    }
    tasks.splice(0, tasks.length);
    for (const node of this.nodes) {
      tasks.push(node.render(this));
    }
    await Promise.all(tasks);
  }
  async _buildNodes() {
    const opts = this.mode == "dev" ? {
      outputDir: this._devOutputDir,
      link: true
    } : {
      outputDir: this.config.outputDir,
      link: false
    };
    try {
      await fs5.access(opts.outputDir);
      await fs5.rm(opts.outputDir, { recursive: true });
    } catch {
    }
    await fs5.mkdir(opts.outputDir, { recursive: true });
    for (const node of this.nodes) {
      assert(
        node._stage != "loaded" && node._stage != "transformed",
        "attempt to build nodes before all nodes rendered"
      );
    }
    const tasks = [];
    for (const node of this.nodes) {
      tasks.push(node.build(opts));
    }
    await Promise.all(tasks);
  }
  _dispose() {
    this.templateEngine.dispose();
  }
  async _run(level) {
    console.time("build");
    try {
      if (level == "full") {
        await this.templateEngine.parse();
      }
      if (level == "full" || level == "content") {
        await this._loadNodes();
      }
      await this._transformAndRenderNodes();
      await this._buildNodes();
    } catch (err) {
      console.error(colors2.red(err));
    }
    console.timeEnd("build");
    console.log();
  }
  async build() {
    await this._run("full");
    this._dispose();
  }
  async dev() {
    await this._run("full");
    const broadcastReload = createDevServer(this._devOutputDir, this.config);
    const queue = [];
    let isProcessing = false;
    const processQueue = async (type, event, path) => {
      console.log(`${colors2.cyan(event)}: ${path}`);
      queue.push(type);
      if (isProcessing) {
        return;
      }
      isProcessing = true;
      while (queue.length > 0) {
        if (queue.length > 4) {
          queue.splice(0, queue.length);
          await this._run("full");
        } else {
          await this._run(queue.shift());
        }
        broadcastReload();
      }
      isProcessing = false;
    };
    const contentWatcher = chokidar.watch(this.config.contentDir, {
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: { stabilityThreshold: 200 }
    });
    contentWatcher.on("add", (path) => {
      processQueue("content", "add", path);
    });
    contentWatcher.on("change", (path) => {
      processQueue("transform", "change", path);
    });
    contentWatcher.on("unlink", (path) => {
      processQueue("content", "remove", path);
    });
    const templatesWatcher = chokidar.watch(this.config.templatesDir, {
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: { stabilityThreshold: 200 }
    });
    templatesWatcher.on("add", (path) => {
      processQueue("full", "add", path);
    });
    templatesWatcher.on("change", (path) => {
      processQueue("full", "change", path);
    });
    templatesWatcher.on("unlink", (path) => {
      processQueue("full", "remove", path);
    });
    process.on("SIGINT", () => {
      console.log("\nExiting...");
      this._dispose();
      process.exit(0);
    });
  }
};

// src/config.ts
import * as fs6 from "fs/promises";
import * as np5 from "path";
import Module from "module";
import colors3 from "yoctocolors";
var defaultConfig = {
  globals: {},
  contentDir: "src/content",
  templatesDir: "src/templates",
  outputDir: "dist",
  markdown: {
    enableSmartypants: true,
    enableGfm: true,
    enableSyntaxHighlighting: true,
    remarkPlugins: [],
    rehypePlugins: []
  },
  html: {
    rehypePlugins: []
  },
  enablePostCSS: true,
  server: {
    host: "localhost",
    port: 2323
  },
  internal: {
    cacheDir: ".norite"
  }
};
async function loadConfig() {
  await fs6.access(np5.resolve("./norite.config.js")).catch(() => {
    throw new Error(
      colors3.red("norite.config.js not found.\n") + colors3.yellow(`create a blank norite.config.js `) + colors3.yellow(`in project root to use defaults
`)
    );
  });
  const require2 = Module.createRequire(np5.resolve("."));
  const configModule = require2(np5.resolve("./norite.config.js")).default ?? {};
  const config = Object.assign({}, defaultConfig, configModule);
  for (const key of ["server", "markdown", "html", "globals", "internal"]) {
    config[key] = Object.assign(
      {},
      defaultConfig[key],
      configModule[key]
    );
  }
  const args = process.argv.slice(3);
  const flags = Object.fromEntries(
    args.map((arg, i) => {
      if (args[i + 1] && !args[i + 1].startsWith("--")) {
        return `${arg}=${args[i + 1]}`;
      }
      return arg;
    }).filter((arg) => arg.startsWith("--")).map((arg) => arg.slice(2).split("="))
  );
  function test(key) {
    return flags[key] ? { [key]: flags[key] } : {};
  }
  Object.assign(
    config,
    test("contentDir"),
    test("templateDir"),
    test("outputDir")
  );
  Object.assign(
    config.server,
    test("host"),
    test("port")
  );
  return config;
}

// src/cli.ts
import colors4 from "yoctocolors";
var helpText = `
Usage: norite [command] [options]

Commands:
    dev           - Start dev server
    build         - Build the website

Options:
    --help        - Show this help
    --host        - Set host (default: localhost)
    --port        - Set port (default: 2323)
    --contentDir  - Set content directory (default: src/content)
    --templateDir - Set template directory (default: src/templates)
    --outputDir   - Set output directory (default: dist)
`;
async function main() {
  const command = process.argv[2];
  if (command != "dev" && command != "build") {
    console.log(helpText);
    return;
  }
  try {
    const mode = command == "build" ? "build" : "dev";
    const config = await loadConfig();
    const engine = await Engine.new(config, mode);
    if (command == "dev") {
      await engine.dev();
    }
    if (command == "build") {
      await engine.build();
    }
  } catch (err) {
    console.error(colors4.red(err));
  }
}
main();
