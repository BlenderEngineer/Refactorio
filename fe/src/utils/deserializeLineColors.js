export const deserializeLineColors = (rawData) => {
    if (!Array.isArray(rawData))throw new Error('Invalid input');
    return rawData.map(range => {
        if (typeof range !== 'string')throw new Error(`string expected`);
        if(range.split(',').length !== 2)throw new Error(`Invalid format`);
        const [lineRange, color] = range.split(',');
        if(lineRange.split('-').length > 2)throw new Error(`Invalid format`);
        const [start, end] = lineRange.split('-').map(Number);
        if (start<=0)throw new Error(`Invalid line number`);
        return { start, end: end || start, color };
    });
}