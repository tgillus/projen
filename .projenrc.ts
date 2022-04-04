import { Component, JsonFile, Project, TextFile, typescript } from 'projen';
import {
  ArrowParens,
  EndOfLine,
  NodePackageManager,
  QuoteProps,
  TrailingComma,
} from 'projen/lib/javascript';

interface LambdaStarterProjectProps {
  description: string;
  packageName: string;
}

class LambdaStarterProject extends typescript.TypeScriptAppProject {
  constructor(props: LambdaStarterProjectProps) {
    super({
      description: props.description,
      defaultReleaseBranch: 'main',
      deps: ['lambda-log@3.1.0'],
      devDeps: [
        '@commitlint/cli@16.2.3',
        '@commitlint/config-conventional@16.2.1',
        '@types/aws-lambda@8.10.93',
        '@types/jake@0.0.33',
        '@types/lambda-log@2.2.1',
        'husky@7.0.4',
        'jake@10.8.4',
        'lint-staged@11.2.6',
      ],
      github: false,
      jestOptions: {
        configFilePath: 'jest.config.json',
      },
      licensed: false,
      name: props.packageName,
      packageManager: NodePackageManager.NPM,
      packageName: props.packageName,
      scripts: {
        prepare: 'husky install',
      },
      prettier: true,
      prettierOptions: {
        ignoreFile: false,
        settings: {
          arrowParens: ArrowParens.ALWAYS,
          bracketSameLine: false,
          endOfLine: EndOfLine.LF,
          printWidth: 80,
          quoteProps: QuoteProps.ASNEEDED,
          semi: true,
          singleQuote: true,
          tabWidth: 2,
          trailingComma: TrailingComma.ES5,
          useTabs: false,
        },
      },
      projenrcTs: true,
    });

    new CommitLintSettings(this);
    new EslintIgnoreSettings(this);
    new HuskySettings(this);
    new LintStagedSettings(this);
    new PrettierIgnoreSettings(this);
    new VsCodeSettings(this);
  }
}

class CommitLintSettings extends TextFile {
  constructor(project: Project) {
    super(project, 'commitlint.config.js', {
      lines: [
        'module.exports = {',
        `  extends: ['@commitlint/config-conventional'],`,
        '};\n',
      ],
    });
  }
}

class EslintIgnoreSettings extends TextFile {
  constructor(project: Project) {
    super(project, '.eslintignore', {
      lines: ['lib', 'node_modules'],
    });
  }
}

class HuskySettings extends Component {
  constructor(project: Project) {
    super(project);

    new TextFile(project, '.husky/.gitignore', {
      lines: ['_\n'],
    });

    new TextFile(project, '.husky/commit-msg', {
      executable: true,
      lines: [
        '#!/bin/sh',
        '. "$(dirname "$0")/_/husky.sh"',
        'npx --no -- commitlint --edit ""\n',
      ],
    });

    new TextFile(project, '.husky/pre-commit', {
      executable: true,
      lines: [
        '#!/bin/sh',
        '. "$(dirname "$0")/_/husky.sh"',
        'npm run test && npx lint-staged\n',
      ],
    });
  }
}

class LintStagedSettings extends TextFile {
  constructor(project: Project) {
    super(project, 'lint-staged.config.js', {
      lines: [
        'module.exports = {',
        `  '*.{js,json,ts,md}': 'prettier --write',`,
        `  '*.{js,ts}': 'eslint --fix',`,
        '};\n',
      ],
    });
  }
}

class PrettierIgnoreSettings extends TextFile {
  constructor(project: Project) {
    super(project, '.prettierignore', {
      lines: [
        '.eslintrc.json',
        '.husky',
        'jest.config.json',
        'lib',
        'node_modules',
        'package-lock.json',
        'package.json',
        'projen',
        'tsconfig.dev.json',
        'tsconfig.json\n',
      ],
    });
  }
}

class VsCodeSettings extends JsonFile {
  constructor(project: Project) {
    super(project, '.vscode/settings.json', {
      obj: {
        'editor.defaultFormatter': 'esbenp.prettier-vscode',
        'editor.formatOnPaste': true,
        'editor.formatOnSave': true,
        'javascript.validate.enable': false,
        'typescript.tsdk': 'node_modules/typescript/lib',
      },
    });
  }
}

new LambdaStarterProject({
  description: 'Projen generator for Lamba projects',
  packageName: 'lambda-starter',
}).synth();
