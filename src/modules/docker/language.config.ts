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
    const escapedCode = this.code.replace(/"/g, '\\"');
    return {
      ...this.baseConfig,
      image: 'python:latest',
      cmd: ['python', '-c', escapedCode],
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
      cmd: ['node', '-e', escapedCode],
    };
  }
}

// clang
class CConfig extends BaseLanguageConfig {
  getConfig(): LanguageConfig {
    // 转义代码字符串中的双引号
    const escapedCode = this.code.replace(/"/g, '\\"');
    return {
      ...this.baseConfig,
      image: 'gcc:latest',
      cmd: [
        'sh',
        '-c',
        `echo "${escapedCode}" > main.c && gcc main.c -o main && ./main`,
      ],
    };
  }
}

// c++
class CppConfig extends BaseLanguageConfig {
  getConfig(): LanguageConfig {
    // 转义代码字符串中的双引号
    const escapedCode = this.code.replace(/"/g, '\\"');
    return {
      ...this.baseConfig,
      image: 'gcc:latest',
      cmd: [
        'sh',
        '-c',
        `echo "${escapedCode}" > main.cpp && g++ main.cpp -o main && ./main`,
      ],
    };
  }
}

// java
class JavaConfig extends BaseLanguageConfig {
  getConfig(): LanguageConfig {
    const escapedCode = this.code.replace(/"/g, '\\"');
    return {
      ...this.baseConfig,
      image: 'openjdk:25-jdk',
      cmd: [
        'sh',
        '-c',
        `echo "${escapedCode}" > Main.java && javac Main.java && java Main`,
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
        `echo '${this.code}' > main.rs && rustc main.rs && ./main `,
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
