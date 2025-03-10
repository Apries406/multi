// 定义语言配置接口
export interface LanguageConfig {
  image: string;
  cmd: string[];
  timeout: number;
}

abstract class BaseLanguageConfig {
  protected baseConfig = {
    timeout: 1000, // 默认 1s 超时
  };

  constructor(protected code: string) {}

  abstract getConfig(): LanguageConfig;
}

// python
class PythonConfig extends BaseLanguageConfig {
  getConfig(): LanguageConfig {
    return {
      ...this.baseConfig,
      image: 'python:latest',
      cmd: ['python', '-c', this.code],
    };
  }
}

// javascript
class JavascriptConfig extends BaseLanguageConfig {
  getConfig(): LanguageConfig {
    return {
      ...this.baseConfig,
      image: 'node:slim',
      cmd: ['node', '-e', this.code],
    };
  }
}

// clang
class CConfig extends BaseLanguageConfig {
  getConfig(): LanguageConfig {
    return {
      ...this.baseConfig,
      image: 'gcc:latest',
      cmd: [
        'sh',
        '-c',
        `echo "${this.code}" > main.c && gcc main.c -o main && ./main`,
      ],
    };
  }
}

// c++
class CppConfig extends BaseLanguageConfig {
  getConfig(): LanguageConfig {
    return {
      ...this.baseConfig,
      image: 'gcc:latest',
      cmd: [
        'sh',
        '-c',
        `echo "${this.code}" > main.cpp && g++ main.c -o main && ./main`,
      ],
    };
  }
}

// java
class JavaConfig extends BaseLanguageConfig {
  getConfig(): LanguageConfig {
    return {
      ...this.baseConfig,
      image: 'openjdk:25-jdk',
      cmd: [
        'sh',
        '-c',
        `echo "${this.code}" > Main.java && javac Main.java && java Main`,
      ],
    };
  }
}

// rust
class RustConfig extends BaseLanguageConfig {
  getConfig(): LanguageConfig {
    return {
      ...this.baseConfig,
      image: 'rust:latest',
      cmd: [`sh -c "echo ${this.code} > main.rs && rustc main.rs" `],
    };
  }
}

export enum SupportedLanguages {
  'python' = 'python',
  'c' = 'c',
  'c++' = 'c++',
  'java' = 'java',
  'rust' = 'rust',
  'javascript' = 'javascript',
}
export type LanguageConfigClass = new (code: string) => BaseLanguageConfig;

type LanguageConfigMap = {
  [key in SupportedLanguages]: LanguageConfigClass;
};

export const languageConfigMap: LanguageConfigMap = {
  c: CConfig,
  'c++': CppConfig,
  java: JavaConfig,
  python: PythonConfig,
  rust: RustConfig,
  javascript: JavascriptConfig,
};
