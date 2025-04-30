import {wrapInTry} from '@augment-vir/common';
import {nodeResolvePlugin} from '@web/dev-server';
import {type Plugin} from '@web/dev-server-core';
import {esbuildPlugin} from '@web/dev-server-esbuild';
import {runTests as runTestRunner} from '@web/test-runner-core/test-helpers';
import {playwrightLauncher} from '@web/test-runner-playwright';
import {join, relative} from 'node:path';
import {repoDirPath, testFilesDirPath} from './repo-paths.mock.js';

/** @returns Whether the tests passed or not */
export async function runTests(
    /** An array of file paths relative to the `test-files` directory. */
    files: ReadonlyArray<string>,
    extraPlugins: ReadonlyArray<Plugin> = [],
): Promise<boolean> {
    const result = await wrapInTry(
        () =>
            runTestRunner({
                rootDir: repoDirPath,
                files: files.map((file) => relative(repoDirPath, join(testFilesDirPath, file))),
                coverage: false,
                browsers: [
                    playwrightLauncher({
                        product: 'webkit',
                    }),
                ],
                plugins: [
                    ...extraPlugins,
                    esbuildPlugin({ts: true}),
                    nodeResolvePlugin(repoDirPath),
                ],
            }),
        {
            fallbackValue: undefined,
        },
    );
    await result?.runner.stop();
    return !!result;
}
