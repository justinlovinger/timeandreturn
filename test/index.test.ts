import proxyquire from 'proxyquire';
import * as fc from 'fast-check';
import * as sinon from 'sinon';
import { expect } from 'chai';

import * as timeandreturn from '../src/index';


const arbitraryStartEndTime = fc.tuple(fc.nat(), fc.nat())
    .filter(times => times[0] < times[1]); // Should always end after starting
const arbitraryCallback = fc.constant((elapsedTime: number) => { });
const arbitraryBlock = fc.anything()
    .filter(x => !Number.isNaN(x)) // NaN has issues with equality
    .map(returnValue => () => returnValue);


describe('timeAndReturn', function () {
    it('should return the result of block()', function () {
        fc.assert(fc.property(arbitraryCallback, arbitraryBlock, function (callback, block) {
            const blockFake = sinon.fake(block);
            expect(timeandreturn.timeAndReturn(callback, blockFake))
                .to.equal(blockFake.getCall(0).returnValue);
        }));
    });

    it('should call callback with elapsed time of block()', function () {
        // proxyquire once now, and set fakeTimes to change times,
        // because importing a module with proxyquire is expensive
        let fakeTimes: Array<number> = [];
        const timeandreturnstubbed = proxyquire('../src/index', {
            'performance-now': () => fakeTimes.shift(),
            '@noCallThru': true // Single function module means no need to import actual module
        });
        fc.assert(fc.property(arbitraryStartEndTime, arbitraryCallback, arbitraryBlock, function ([startTime, endTime], callback, block) {
            fakeTimes.push(startTime);
            fakeTimes.push(endTime);
            const callbackFake = sinon.fake(callback);
            timeandreturnstubbed.timeAndReturn(callbackFake, block);
            expect(callbackFake.getCall(0).args)
                .to.deep.equal([endTime - startTime]);
        }));
    });
});
