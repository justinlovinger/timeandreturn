import proxyquire from 'proxyquire';
import * as fc from 'fast-check';
import * as sinon from 'sinon';
import { expect } from 'chai';

import * as timeandreturn from '../src/index';

import * as blocks from './blocks';


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
            fakeTimes[0] = startTime;
            fakeTimes[1] = endTime;
            const callbackFake = sinon.fake(callback);
            timeandreturnstubbed.timeAndReturn(callbackFake, block);
            expect(callbackFake.getCall(0).args)
                .to.deep.equal([endTime - startTime]);
        }));
    });
});

describe('logTimeAndReturn', function () {
    it('should return the result of block()', function () {
        doWithStubbedConsoleLog(() => {
            fc.assert(fc.property(arbitraryBlock, function (block) {
                const blockFake = sinon.fake(block);
                expect(timeandreturn.logTimeAndReturn(blockFake))
                    .to.equal(blockFake.getCall(0).returnValue);
            }));
        });
    });

    it('should log the elapsed time of block()', function () {
        // proxyquire once now, and set fakeTimes to change times,
        // because importing a module with proxyquire is expensive
        let fakeTimes: Array<number> = [];
        const timeandreturnstubbed = proxyquire('../src/index', {
            'performance-now': () => fakeTimes.shift(),
            '@noCallThru': true // Single function module means no need to import actual module
        });
        fc.assert(fc.property(arbitraryStartEndTime, arbitraryBlock, function ([startTime, endTime], block) {
            doWithStubbedConsoleLog(() => {
                fakeTimes[0] = startTime;
                fakeTimes[1] = endTime;
                timeandreturnstubbed.logTimeAndReturn(block);
                expect((console.log as sinon.SinonSpy).lastCall.args[0])
                    .to.contain((endTime - startTime) / 1000); // Divide by 1000 for seconds
            });
        }));
    });

    it('should log the function definition of block, without excessive whitespace', function () {
        doWithStubbedConsoleLog(() => {
            timeandreturn.logTimeAndReturn(blocks.foo);
            expect((console.log as sinon.SinonSpy).lastCall.args[0])
                .to.contain(`function foo() { return 'foo'; }`);
        });
        
        doWithStubbedConsoleLog(() => {
            timeandreturn.logTimeAndReturn(blocks.bar);
            expect((console.log as sinon.SinonSpy).lastCall.args[0])
                .to.contain(`function bar() { return 'bar'; }`);
        });

        doWithStubbedConsoleLog(() => {
            timeandreturn.logTimeAndReturn(() => 'anon');
            expect((console.log as sinon.SinonSpy).lastCall.args[0])
                .to.contain(`() => 'anon'`);
        });
    });

    it('should trim long function definitions to the first several characters, followed by ...', function () {
        doWithStubbedConsoleLog(() => {
            timeandreturn.logTimeAndReturn(blocks.longfunc);
            expect((console.log as sinon.SinonSpy).lastCall.args[0])
                .to.contain(`function longfunc() { let firststatement = 42; ...`); 
        });
    });
});


function doWith<T>(before: () => void, after: () => void, block: () => T): T {
    before()
    try {
        return block()
    } finally {
        after()
    }
}
// Note: use below instead of beforeEach and afterEach,
// to avoid stubbed console.log gobbling test runner output
function doWithStubbedConsoleLog<T>(block: () => T): T {
    let sandbox = sinon.createSandbox();
    return doWith(() => {
        sandbox.replace(console, 'log', sinon.fake());
    }, () => {
        sandbox.restore();
    }, block);
}
