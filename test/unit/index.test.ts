import 'mocha';
import proxyquire from 'proxyquire';
import * as fc from 'fast-check';
import * as sinon from 'sinon';
import { expect } from 'chai';

import * as timeandreturn from '../../src/index';
import * as format from '../../src/format';

import {
    arbitraryStartEndTime,
    arbitraryCallback,
    arbitraryBlock,
    arbitraryBlockAndReturnValue,
    arbitraryAsyncBlock,
    arbitraryAsyncBlockAndReturnValue
} from '../arbitraries';


describe('timeAndReturn', function () {
    it('should return the result of block()', function () {
        return fc.assert(fc.property(arbitraryCallback, arbitraryBlockAndReturnValue, function (callback, [block, returnValue]) {
            expect(timeandreturn.timeAndReturn(callback, block))
                .to.equal(returnValue);
        }));
    });

    it('should call callback with elapsed time of block()', function () {
        // proxyquire once now, and set fakeTimes to change times,
        // because importing a module with proxyquire is expensive
        let fakeTimes: Array<number> = [];
        const timeandreturnstubbed = proxyquire('../../src/index', {
            'performance-now': () => fakeTimes.shift(),
            '@noCallThru': true // Single function module means no need to import actual module
        });
        return fc.assert(fc.property(arbitraryStartEndTime, arbitraryCallback, arbitraryBlock, function ([startTime, endTime], callback, block) {
            fakeTimes[0] = startTime;
            fakeTimes[1] = endTime;
            const callbackFake = sinon.fake(callback);
            timeandreturnstubbed.timeAndReturn(callbackFake, block);
            expect(callbackFake.getCall(0).args)
                .to.deep.equal([endTime - startTime]);
        }));
    });

    describe('when block returns a Promise', function () {
        it('should return the result of block()', async function () {
            return fc.assert(fc.asyncProperty(arbitraryCallback, arbitraryAsyncBlockAndReturnValue, async function (callback, [block, returnValue]) {
                const blockResult = timeandreturn.timeAndReturn(callback, block);
                expect(blockResult).to.not.equal(returnValue);
                expect(await blockResult).to.equal(returnValue);
            }));
        });

        it('should call callback after the promise resolves', async function () {
            // proxyquire once now, and set fakeTimes to change times,
            // because importing a module with proxyquire is expensive
            let fakeTimes: Array<number> = [];
            const timeandreturnstubbed = proxyquire('../../src/index', {
                'performance-now': () => fakeTimes.shift(),
                '@noCallThru': true // Single function module means no need to import actual module
            });
            return fc.assert(fc.asyncProperty(arbitraryStartEndTime, arbitraryCallback, arbitraryAsyncBlock, async function ([startTime, endTime], callback, block) {
                const callbackFake = sinon.fake(callback);

                fakeTimes[0] = startTime;
                const result = timeandreturnstubbed.timeAndReturn(callbackFake, block);
                expect(callbackFake.callCount).to.equal(0);
                
                fakeTimes[0] = endTime;
                await result;
                expect(callbackFake.callCount).to.equal(1);
                expect(callbackFake.getCall(0).args)
                    .to.deep.equal([endTime - startTime]);
            }));
        });
    });
});

describe('logTimeAndReturn', function () {
    it('should return the result of block()', function () {
        return fc.assert(fc.property(arbitraryBlockAndReturnValue, function ([block, returnValue]) {
            expect(timeandreturn.logTimeAndReturn(block))
                .to.equal(returnValue);
        }));
    });

    describe('when block returns a Promise', function () {
        it('should return the result of block()', async function () {
            return fc.assert(fc.asyncProperty(arbitraryAsyncBlockAndReturnValue, async function ([block, returnValue]) {
                const blockResult = timeandreturn.logTimeAndReturn(block);
                expect(blockResult).to.not.equal(returnValue);
                expect(await blockResult).to.equal(returnValue);
            }));
        });
    });

    describe('', function () {
        beforeEach(function () {
            sinon.replace(console, 'log', sinon.spy(console.log));
            sinon.replace(format, 'formatBlockTime', sinon.spy(format.formatBlockTime));
        });
    
        afterEach(function () {
            sinon.restore();
        });
    
        it('should log formatted block time to console', function () {
            timeandreturn.logTimeAndReturn(() => { return 1 + 1; });
            expect((console.log as sinon.SinonSpy).lastCall.args)
                .to.deep.equal([(format.formatBlockTime as sinon.SinonSpy).lastCall.returnValue]);
        });
    
        describe('when block returns a Promise', function () {
            it('should log formatted block time to console', async function () {
                await timeandreturn.logTimeAndReturn(async () => { return 1 + 1; });
                expect((console.log as sinon.SinonSpy).lastCall.args)
                    .to.deep.equal([(format.formatBlockTime as sinon.SinonSpy).lastCall.returnValue]);
            });
        });
    });
});
