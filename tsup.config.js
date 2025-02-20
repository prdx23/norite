
import { defineConfig } from 'tsup'


export default defineConfig({

    entry: {
        main: 'src/main.ts',
        norite: 'src/cli.ts',
        'jsx-runtime': 'src/jsx-runtime.ts',
    },

    format: ['esm'],
    clean: true,
    dts: true,

    watch: 'src/',

})

