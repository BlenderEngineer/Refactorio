import { describe, expect, test } from 'vitest'
import {deserializeLineColors} from "./deserializeLineColors.js";
import axios from "axios";

describe('deserializeLineColors unit test', () => {
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

    test('Validate that the array of row colors is not empty', () => {
        expect(() => deserializeLineColors([])).toThrow();
    });

    test('handles missing color values', () => {
        const input = ['1-2,'];
        const expectedOutput = [{ start: 1, end: 2, color: '' }];

        expect(deserializeLineColors(input)).toEqual(expectedOutput);
    });

    test('Ensure that row numbers exist in the code', () => {
        const input = [',red'];
        expect(() => deserializeLineColors(input)).toThrow();
    });

    test('reject too much data', () => {
        const input = ['1-3,red1-3,red1-3,red'];
        expect(() => deserializeLineColors(input)).toThrow();
    });
});
describe('deserializeLineColors integration test', () => {
    test('single line', async () => {
        const response = await axios.post('http://127.0.0.1:8080/api/codeLinesQuality', { code: "int main{work();}" });
        expect(response.status).toBe(200);
        const ranges = deserializeLineColors(response.data.result);
        expect(ranges.length).toEqual(1);
        expect(ranges[0].start).toEqual(1);
        expect(ranges[0].end).toEqual(1);
    },60000);
    test('multi line', async () => {
        const response = await axios.post('http://127.0.0.1:8080/api/codeLinesQuality', { code: "int main{\nwork();\n}" });
        expect(response.status).toBe(200);
        const ranges = deserializeLineColors(response.data.result);
        if(ranges.length===1)expect(ranges[0].end).toEqual(3);
        else if(ranges.length===2)expect(ranges[1].end).toEqual(3);
        else if(ranges.length===3)expect(ranges[2].end).toEqual(3);
        else throw new Error('Unexpected number of ranges: ' + ranges.length);
    },60000);
});