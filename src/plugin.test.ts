import {assert} from '@augment-vir/assert';
import {describe, it} from '@augment-vir/test';
import {pixiPlugin, PixiPlugin} from './plugin.js';
import {runTests} from './run-tests.mock.js';

describe(PixiPlugin.name, () => {
    it('is required to fix pixi.js imports', async () => {
        assert.isFalse(
            await runTests([
                'static-pixi.test.ts',
            ]),
        );
    });
    it('handles pixi.js imports', async () => {
        assert.isTrue(
            await runTests(
                [
                    'dynamic-pixi.test.ts',
                    'static-pixi.test.ts',
                ],
                [
                    pixiPlugin(),
                ],
            ),
        );
    });
    it('fails if the rootDir has not been set', () => {
        const plugin = new PixiPlugin();

        assert.throws(() => plugin.resolveImport({context: {path: ''}, source: 'pixi.js'}), {
            matchMessage: 'rootDir not set',
        });
        plugin.resolveImport({context: {path: ''}, source: 'something-else'});
    });
});
