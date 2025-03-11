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
      cmd: [
        'sh',
        '-c',
        'start_time=$(date +%s%N); ' +
          `python -c "${this.code}"; ` +
          'end_time=$(date +%s%N); ' +
          'echo {--$((end_time - start_time))--}',
      ],
    };
  }
}

// javascript
class JavascriptConfig extends BaseLanguageConfig {
  getConfig(): LanguageConfig {
    const escapedCode = this.code.replace(/"/g, '\\"');
    return {
      ...this.baseConfig,
      image: 'node:slim',
      cmd: [
        'sh',
        '-c',
        `echo "${escapedCode}" > main.js && ` +
          'start_time=$(date +%s%N); ' +
          'node main.js; ' +
          'end_time=$(date +%s%N); ' +
          'echo {--$((end_time - start_time))--}',
      ],
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
        `echo "${this.code}" > main.c &&` +
          'g++ main.c -o main &&' +
          'start_time=$(date +%s%N); ' +
          './main;' +
          'end_time=$(date +%s%N); ' +
          'echo {--$((end_time - start_time))--}',
      ],
    };
  }
}

// c++
class CppConfig extends BaseLanguageConfig {
  getConfig(): LanguageConfig {
    // 转义代码字符串中的双引号
    return {
      ...this.baseConfig,
      image: 'gcc:latest',
      cmd: [
        'sh',
        '-c',
        `echo "${this.code}" > main.cpp &&` +
          'g++ main.cpp -o main &&' +
          'start_time=$(date +%s%N); ' +
          './main;' +
          'end_time=$(date +%s%N); ' +
          'echo {--$((end_time - start_time))--}',
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
        `echo "${this.code}" > Main.java && ` +
          'javac Main.java && ' +
          'start_time=$(date +%s%N); ' +
          'java Main; ' +
          'end_time=$(date +%s%N); ' +
          'echo {--$((end_time - start_time))--}',
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
      cmd: [
        'sh',
        '-c',
        `echo '${this.code}' > main.rs &&` +
          'rustc main.rs &&' +
          'start_time=$(date +%s%N); ' +
          './main; ' +
          'end_time=$(date +%s%N); ' +
          'echo {--$((end_time - start_time))--}',
      ],
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
