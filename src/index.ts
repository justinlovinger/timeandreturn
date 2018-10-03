import now from 'performance-now';

import { formatBlockTime } from './format';


/**
 * Call callback with the time taken to run block, and return the result of block
 * 
 * If block returns a Promise, call callback after promise resolves.
 * 
 * Elapsed time is given in milliseconds.
 */
export function timeAndReturn<T>(callback: (elapsedTime: number) => void, block: () => T): T {
    const startTime = now();
    const returnValue = block();
    if (returnValue instanceof Promise) {
        returnValue.then(() => {
            callback(now() - startTime);
        });
    } else {
        callback(now() - startTime);
    }

    return returnValue;
}

/**
 * Log the time taken to run block, and return the result of block
 */
export function logTimeAndReturn<T>(block: () => T): T {
    return timeAndReturn((elapsedTime) => console.log(formatBlockTime(block, elapsedTime)), block);
}
