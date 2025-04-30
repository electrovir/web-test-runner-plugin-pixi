import {type SelectFrom} from '@augment-vir/common';
import {findAncestor, toPosixPath} from '@augment-vir/node';
import {type Plugin} from '@web/dev-server-core';
import {existsSync} from 'node:fs';
import {join as fsJoin} from 'node:path';
import {join, relative} from 'node:path/posix';
import {fileURLToPath} from 'node:url';

export function pixiPlugin() {
    return new PixiPlugin();
}

export class PixiPlugin implements Plugin {
    public readonly name = 'pixi';

    protected rootDir: string | undefined;

    protected fullPixiMinPath: string | undefined;

    protected getFixedPixiPath(): string {
        if (this.fullPixiMinPath) {
            return this.fullPixiMinPath;
        } else {
            const pixiPackageDirPath = findAncestor(
                fileURLToPath(import.meta.resolve('pixi.js')),
                (path) => {
                    return existsSync(fsJoin(path, 'package.json'));
                },
            );

            /* node:coverage ignore next 3: impossible to mock this in the current repo */
            if (!pixiPackageDirPath) {
                throw new Error(`Failed to find pixi.js package path.`);
            }

            const fullPixiMinPath = join(
                toPosixPath(pixiPackageDirPath).replace(/^\/c/, ''),
                'dist',
                'pixi.min.mjs',
            );

            this.fullPixiMinPath = fullPixiMinPath;
            return fullPixiMinPath;
        }
    }

    public serverStart({config}: Parameters<NonNullable<Plugin['serverStart']>>[0]) {
        this.rootDir = config.rootDir;
    }

    public resolveImport({
        source,
        context,
    }: SelectFrom<
        Parameters<NonNullable<Plugin['resolveImport']>>[0],
        {
            source: true;
            context: {
                path: true;
            };
        }
    >) {
        if (source === 'pixi.js') {
            if (!this.rootDir) {
                throw new Error('cannot resolve import: rootDir not set');
            }

            const fullFilePath = join(this.rootDir, context.path);
            const relativePixiPath = relative(fullFilePath, this.getFixedPixiPath());

            return relativePixiPath;
        }
        return undefined;
    }
}
