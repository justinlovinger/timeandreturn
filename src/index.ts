import now from 'performance-now';


export function timeAndReturn<T>(callback: (elapsedTime: number) => void, block: () => T): T {
    const startTime = now();
    const returnValue = block();
    callback(now() - startTime);

    return returnValue;
}
