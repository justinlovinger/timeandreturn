export function formatBlockTime(block: () => any, elapsedTime: number): string {
    return `"${formatFunctionDefinition(50, block.toString())}" ran for ${elapsedTime / 1000} seconds`;
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
