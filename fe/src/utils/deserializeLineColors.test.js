import { describe, expect, test } from 'vitest'
import {deserializeLineColors} from "./deserializeLineColors.js";

describe('deserializeLineColors', () => {
    test('parses valid input correctly', () => {
        const input = ['1-3,red', '4,green', '5-7,blue'];
        const expectedOutput = [
            { start: 1, end: 3, color: 'red' },
            { start: 4, end: 4, color: 'green' },
            { start: 5, end: 7, color: 'blue' },
        ];

        expect(deserializeLineColors(input)).toEqual(expectedOutput);
    });

    test('handles single-line input correctly', () => {
        const input = ['10,orange'];
        const expectedOutput = [{ start: 10, end: 10, color: 'orange' }];

        expect(deserializeLineColors(input)).toEqual(expectedOutput);
    });

    test('handles invalid input gracefully', () => {
        const input = ['invalid-data'];
        expect(() => deserializeLineColors(input)).toThrow();
    });

    test('handles empty input', () => {
        expect(deserializeLineColors([])).toEqual([]);
    });

    test('handles missing color values', () => {
        const input = ['1-2,'];
        const expectedOutput = [{ start: 1, end: 2, color: '' }];

        expect(deserializeLineColors(input)).toEqual(expectedOutput);
    });

    test('handles missing line range', () => {
        const input = [',red'];
        expect(() => deserializeLineColors(input)).toThrow();
    });

    test('reject too much data', () => {
        const input = ['1-3,red1-3,red1-3,red'];
        expect(() => deserializeLineColors(input)).toThrow();
    });
});