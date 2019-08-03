# vhost-ts

# Same usage as [vhost](https://github.com/expressjs/vhost) but having in mind [TypeScript](https://www.typescriptlang.org/) and [express](https://github.com/expressjs/express) for type handling

## _Open for PRs to handle **[connect](https://github.com/senchalabs/connect)** types_

## Install

```sh
yarn add vhost-ts
```

_or_

```sh
npm install vhost-ts
```

## API

```typescript
import vhost from "vhost-ts";
```

### vhost(hostname, handle)

Create a new middleware function to hand off request to `handle` when the incoming
host for the request matches `hostname`. The function is called as
`handle(req, res, next)`, like a standard middleware.

`hostname` can be a string or a RegExp object. When `hostname` is a string it can
contain `*` to match 1 or more characters in that section of the hostname. When
`hostname` is a RegExp, it will be forced to case-insensitive (since hostnames are)
and will be forced to match based on the start and end of the hostname.

When host is matched and the request is sent down to a vhost handler, the `req.vhost`
property will be populated with an object. This object will have numeric properties
corresponding to each wildcard (or capture group if RegExp object provided) and the
`hostname` that was matched.

```typescript
import vhost from "vhost-ts";
import express from "express";

const app = express();

app.use(
  vhost("*.*.example.com", function handle(req, res, next) {
    // for match of "foo.bar.example.com:8080" against "*.*.example.com":
    console.dir(req.vhost.host); // => 'foo.bar.example.com:8080'
    console.dir(req.vhost.hostname); // => 'foo.bar.example.com'
    console.dir(req.vhost.length); // => 2
    console.dir(req.vhost[0]); // => 'foo'
    console.dir(req.vhost[1]); // => 'bar'
  })
);

...
```
