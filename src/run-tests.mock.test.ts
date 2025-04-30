import {assert} from '@augment-vir/assert';
import {describe, it} from '@augment-vir/test';
import {runTests} from './run-tests.mock.js';

describe(runTests.name, () => {
    it('succeeds', async () => {
        assert.isTrue(
            await runTests([
                'success.test.ts',
            ]),
        );
    });
    it('fails', async () => {
        assert.isFalse(
            await runTests([
                'failure.test.ts',
            ]),
        );
    });
});
