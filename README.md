A simple utility library to get the elapsed time of a block of code.
Designed to easily drop into existing code with minimal changes, for easy performance profiling.

# Installation

via [npm](https://github.com/npm/npm)

```
npm install timeandreturn
```

# Usage

Say you have a section of code

```js
// ...
let a = foo();
let b = bar();
return foobar(a, b);
```

You want to know how long these three lines of code take to run. You can wrap this block of code with `timeAndReturn`.

```js
const timeAndReturn = require('timeandreturn').timeAndReturn;

// ...
return timeAndReturn((elapsedTime) => {
    // Do something with elapsedTime
}, () => {
    let a = foo();
    let b = bar();
    return foobar(a, b);
});
```

The return value of `foobar` is returned by `timeAndReturn`, so the logic of the program is unchanged, but `elapsedTime` is captured.

If you only want to log `elapsedTime`, a `logTimeAndReturn` variant is provided.

```js
const logTimeAndReturn = require('timeandreturn').logTimeAndReturn;

// ...
// Prints: "() => { let a = foo(); let b = bar(); return f ..." ran for 0.00014059999999881256 seconds
return logTimeAndReturn(() => {
    let a = foo();
    let b = bar();
    return foobar(a, b);
});
```

## Async

If `block` returns a `Promise`, `callback` is called when that `Promise` resolves.

```js
const logTimeAndReturn = require('timeandreturn').logTimeAndReturn;

// ...
// Prints: "async () => { let a = foo(); let b = bar(); aw ..." ran for 1.000469800000079 seconds
return logTimeAndReturn(async () => {
    let a = foo();
    let b = bar();
    await waitFor1Second();
    return foobar(a, b);
});
```

# API

```ts
/**
 * Call callback with the time taken to run block, and return the result of block
 *
 * If block returns a Promise, call callback after promise resolves.
 *
 * Elapsed time is given in milliseconds.
 */
timeAndReturn<T>(callback: (elapsedTime: number) => void, block: () => T): T
```

```ts
/**
 * Log the time taken to run block, and return the result of block
 */
logTimeAndReturn<T>(block: () => T): T
```