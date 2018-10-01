import now from 'performance-now';


/**
 * Call callback with the time taken to run block, and return the result of block
 * 
 * Elapsed time is given in milliseconds
 */
export function timeAndReturn<T>(callback: (elapsedTime: number) => void, block: () => T): T {
    const startTime = now();
    const returnValue = block();
    callback(now() - startTime);

    return returnValue;
}

/**
 * Log the time taken to run block, and return the result of block
 */
export function logTimeAndReturn<T>(block: () => T): T {
    return timeAndReturn(consoleLogger(block), block);
}

function consoleLogger(block: () => any): (elapsedTime: number) => void {
    return elapsedTime => console.log(`"${formatFunctionDefinition(50, block.toString())}" ran for ${elapsedTime / 1000} seconds`);
}

function formatFunctionDefinition(maxLength: number, functionDefinition: string): string {
    let oneLineDefinition = functionDefinition.toString()
        // Strip line breaks and tabs
        .replace(/\r?\n|\r|\t/g, ' ')
        // Squash spaces
        .replace(/ +/g, ' ')

    // Slice and append ... if too long
    if (oneLineDefinition.length > maxLength) {
        return oneLineDefinition.slice(0, maxLength - 4) + ' ...'
    } else {
        return oneLineDefinition;
    }
}
