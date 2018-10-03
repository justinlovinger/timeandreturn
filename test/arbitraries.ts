import * as fc from 'fast-check';

export const anythingExceptNaN = fc.anything()
    .filter(x => !Number.isNaN(x)) // NaN has issues with equality

export const arbitraryStartEndTime = fc.tuple(fc.nat(), fc.nat())
    .filter(times => times[0] < times[1]); // Should always end after starting
export const arbitraryCallback = fc.constant((elapsedTime: number) => { });
export const arbitraryBlockAndReturnValue = anythingExceptNaN
    .map(returnValue => [() => returnValue, returnValue]);
export const arbitraryBlock = arbitraryBlockAndReturnValue
    .map(tup => tup[0]);

export const arbitraryAsyncBlockAndReturnValue = anythingExceptNaN
    .map(returnValue => [
        () => new Promise((resolve => setTimeout(() => resolve(returnValue), 1))),
        returnValue]);
export const arbitraryAsyncBlock = arbitraryAsyncBlockAndReturnValue
    .map(tup => tup[0]);
