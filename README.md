# 项目介绍

这是一个 Monorepo 架构的项目，集成了我所做的 nestjs 项目
方便我日后的前端开发

- 正在向「微服务」转变
- 正在努力做更健全的服务提供

# 模块介绍

## 测评机 exec

一个测评机，发送 `code_string`, `language`, `timeout` (秒)。如果成功运行则返回结果或错误信息；否则返回失败的消息。

### 运行项目

在你的本地机器上安装 Node.js 环境，并安装 docker desktop

- 打开 docker desktop 的 TCP 监听
- 如果是 Macos 请 pull `alpine/socat` 镜像，并运行以下命令：

```bash
docker run -d -v /var/run/docker.sock:/var/run/docker.sock -p 127.0.0.1:2375:2375 alpine/socat TCP-LISTEN:2375,fork UNIX-CONNECT:/var/run/docker.sock
```

- 下载如下 docker image
  - `python:latest`
  - `node:slim`
  - `gcc:latest`
  - `openjdk:25-jdk`
  - `rust:latest`
- 运行命令:

```bash
# 由于我这里先创建的 exec 模块，所以他是默认模块， 不用加 exec 来指明路径
pnpm add . && pnpm start:dev
```

## 认证 auth

一个用户登录注册的模块

- auth 做认证
- user 做实际登录注册的实现
- email 做电子邮件的验证和发送

## 运行项目

```bash
# watch 模式启动
pnpm add . && pnpm start:dev auth
```
