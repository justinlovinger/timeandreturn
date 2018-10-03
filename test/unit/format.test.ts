import 'mocha';
import * as fc from 'fast-check';
import { expect } from 'chai';

import * as format from '../../src/format';

import { arbitraryBlock } from '../arbitraries';


function foo() {
    return 'foo';
}

function bar() {
    return 'bar';
}

function longfunc() {
    let firststatement = 42;
    let secondstatment = 'second statement';
    let thirdstatement = false;
    return 'longfunc';
}

describe('formatFunctionDefinition', function () {
    it('should include elapsed time in formatted string', function () {
        return fc.assert(fc.property(fc.nat(), arbitraryBlock, function (elapsedTime, block) {
            expect(format.formatBlockTime(block, elapsedTime))
                .to.contain(elapsedTime / 1000); // Divide by 1000 for seconds
        }));
    });

    it('should log the function definition of block, without excessive whitespace', function () {
        expect(format.formatBlockTime(foo, 0))
            .to.contain(`function foo() { return 'foo'; }`);
        
        expect(format.formatBlockTime(bar, 0))
            .to.contain(`function bar() { return 'bar'; }`);

        expect(format.formatBlockTime(() => 'anon', 0))
            .to.contain(`() => 'anon'`);
    });

    it('should trim long function definitions to the first several characters, followed by ...', function () {
        expect(format.formatBlockTime(longfunc, 0))
            .to.contain(`function longfunc() { let firststatement = 42; ...`);
    });
});
