
import { defineConfig } from 'tsup'


export default defineConfig({

    entry: {
        norite: 'src/cli.ts',
    },

    format: ['esm', 'cjs'],
    clean: true,

    watch: 'src/',

})

