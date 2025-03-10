# 代码执行器

一个远程代码执行器，发送 `code_string`, `language`, `timeout` (秒)。如果成功运行则返回结果或错误信息；否则返回失败的消息。

# 运行项目

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
pnpm add . && pnpm start:dev
```

即可启动
