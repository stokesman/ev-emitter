import js from '@eslint/js';
import jsdoc from 'eslint-plugin-jsdoc';

/** @type { import('eslint').Linter.FlatConfig[] } */
export default [
  js.configs.recommended,
  jsdoc.configs['flat/recommended-typescript-flavor'],
  {
    languageOptions: {
      globals: {
        CustomEvent: true,
        EventTarget: true,
      },
    },
    plugins: {
      jsdoc,
    },
    rules: {
      quotes: [ 'error', 'single' ],
      'quote-props': [ 'error', 'as-needed' ],
      'array-bracket-spacing': [ 'error', 'always', { arraysInArrays: false, objectsInArrays: false }],
      'object-curly-spacing': [ 'error', 'always', { objectsInObjects: false, arraysInObjects: false }],
      'max-classes-per-file': [
        'error',
        { ignoreExpressions: true, max: 1 },
      ],
      'new-parens': [ 'error', 'never' ],
      'lines-around-comment': [
        'error',
        {
          beforeLineComment: true,
          allowBlockStart: true,
          ignorePattern: '\\*(\\n|\\s@\\w)', // ignores jsdoc blocks or lines
        },
      ],
      'sort-imports': [ 'error', { allowSeparatedGroups: true }],
      'jsdoc/require-returns-type': [ 'off', { contexts:[ 'any' ]}],
      'jsdoc/require-param-description': [ 'off', { contexts:[ 'any' ]}],
      'jsdoc/require-jsdoc': [ 'warn', {
        require: { ClassDeclaration: true, FunctionDeclaration: true, ClassExpression: false, MethodDefinition: true },
      }],
    },
  },
];
