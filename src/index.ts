type vhostPopulation = {
  host: string;
  hostname: string;
  length: number;
  [n: number]: string | undefined;
};

declare global {
  namespace Express {
    interface Request {
      vhost: vhostPopulation;
    }
  }
}

import { Request, RequestHandler } from "express";

const ASTERISK_REGEXP = /\*/g;
const ASTERISK_REPLACE = "([^.]+)";
const END_ANCHORED_REGEXP = /(?:^|[^\\])(?:\\\\)*\$$/;
const ESCAPE_REGEXP = /([.+?^=!:${}()|[\]/\\])/g;
const ESCAPE_REPLACE = "\\$1";

/**
 * Create a vhost middleware.
 *
 * @param {string|RegExp} hostname
 * @param {function} handle
 * @return {Function}
 * @public
 */

export default (
  hostname: string | RegExp,
  handle: RequestHandler
): RequestHandler => {
  if (!hostname) {
    throw new TypeError("argument hostname is required");
  }

  if (!handle) {
    throw new TypeError("argument handle is required");
  }

  if (typeof handle !== "function") {
    throw new TypeError("argument handle must be a function");
  }

  // create regular expression for hostname
  const regexp = hostregexp(hostname);

  const vhost: RequestHandler = (req, res, next) => {
    const vhostdata = vhostof(req, regexp);

    if (!vhostdata) {
      return next();
    }

    // populate
    req.vhost = vhostdata;

    // handle
    handle(req, res, next);
  };

  return vhost;
};

/**
 * Get hostname of request.
 *
 * @param (object} req
 * @return {string}
 * @private
 */

function hostnameof(req: Request): string | undefined {
  const host =
    req.hostname || // express v4
    req.host || // express v3
    req.headers.host; // http;

  if (!host) {
    return;
  }

  const offset = host[0] === "[" ? host.indexOf("]") + 1 : 0;
  const index = host.indexOf(":", offset);

  return index !== -1 ? host.substring(0, index) : host;
}

/**
 * Generate RegExp for given hostname value.
 *
 * @param (string|RegExp} val
 * @private
 */

function hostregexp(val: string | RegExp) {
  let source =
    val instanceof RegExp
      ? val.source
      : String(val)
          .replace(ESCAPE_REGEXP, ESCAPE_REPLACE)
          .replace(ASTERISK_REGEXP, ASTERISK_REPLACE);

  // force leading anchor matching
  if (source[0] !== "^") {
    source = "^" + source;
  }

  // force trailing anchor matching
  if (!END_ANCHORED_REGEXP.test(source)) {
    source += "$";
  }

  return new RegExp(source, "i");
}

/**
 * Get the vhost data of the request for RegExp
 *
 * @param (object} req
 * @param (RegExp} regexp
 * @return {object}
 * @private
 */

function vhostof(req: Request, regexp: RegExp): vhostPopulation | undefined {
  const host = req.headers.host;
  const hostname = hostnameof(req);

  if (!host || !hostname) {
    return;
  }

  const match = regexp.exec(hostname);

  if (!match) {
    return;
  }

  const matches: { [n: number]: string } = {};

  for (let i = 1; i < match.length; i++) {
    matches[i - 1] = match[i];
  }
  return {
    host,
    hostname,
    length: match.length - 1,
    ...matches,
  };
}
