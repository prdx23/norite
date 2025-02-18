
import { defineConfig } from 'tsup'


export default defineConfig({

    entry: {
        norite: 'src/cli.ts',
        'jsx-runtime': 'src/jsx-runtime.ts',
    },

    format: ['esm'],
    clean: true,
    dts: true,

    watch: 'src/',

})

