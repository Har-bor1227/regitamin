import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'http://localhost:8080/graphql',
  documents: './graphql/**/*.graphql',
  generates: {
    './graphql/generated/': {
      plugins: [
        'typescript',
        'typescript-operations',
      ],
    },
  },
};

export default config;