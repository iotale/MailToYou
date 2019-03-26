## 整体设计

整体思路和技术栈参考自掘金上的一篇文章[用 Node + EJS 写一个爬虫脚本每天定时女朋友发一封暖心邮件](https://juejin.im/post/5c75fa4af265da2d84109219)，替换了一些资源的使用。

这个实践项目本身没有难度，基本上就是 Nodejs 的几个开源模块的使用。逻辑复杂度很低，代码量较少。突出的是其思路的新颖。

### 每天定时发送一封邮件，邮件内容包括

- 在一起的时长
- 今日天气（可以使用免费的天气 API）
- 一张她的照片，并配上一段照片信息，或者一段深情的话

### 数据的获取

- 天气

  使用[心知天气](https://www.seniverse.com/doc)的免费 API

- 图片

  - 自己上传的她的照片
  - 从 one 爬取的照片
  - 免费的图片 API [随机获取图片](https://source.unsplash.com/), [教程](https://unsplash.com/documentation)

- 文字

  - one 爬取的数据
  - 自己写的情话

### 图片的选择

- 使用免费的随机图片 API
- 在服务中应该添加一个判断，如果指定文件有当天的内容的话，就从这个内容中获取图片和文字

### 模版引擎

选用 [art-template](http://aui.github.io/art-template/zh-cn/docs/) 作为 HTML 模版

### 使用 nodejs 开发服务

- 邮件服务使用开源的 Nodemailer 模块
- 定时任务，也就是每天定会发送邮件的程序。使用 node-schedule 定时模块
- nodejs 爬虫使用有两种较为流行的方案
  - superagent + cheerio：superagent 是服务端异步请求的一种实现，依赖 nodejs 原生的请求 api；cheerio 可以像 jQuery 那样解析 HTML，方便获取和操作 DOM 节点
  - phantomjs：PhantomJS 是一个无界面的,可脚本编程的 WebKit 浏览器引擎，直接提供了操作 dom 的能力。**但是 phantomjs 是独立的，不是 nodejs 的一个模块运行，所以这里不使用它**

## 先写几个 example

### Nodemailer 发邮件模块

[Nodemailer](https://github.com/nodemailer/nodemailer)

代码详见 "/demo/nodeMail.js"，下面列出几个使用的时候需要注意的点【nodemailer@5.1.1】

- `createTransport` 创建邮件对象时

  - `host` 字段是 SMTP 服务器的地址，一般在邮箱设置的 SMTP 设置中可以看见，例如 126 邮箱的 `smtp.126.com`
  - `port` 默认是 587，465 端口是为 SMTPS（SMTP-over-SSL）协议服务开放的，这是 SMTP 协议基于 SSL 安全协议之上的一种变种协议
  - `secure` 如果 `port` 是 465，这个值就得是 `true`，表示连接到服务器时使用 TLS
  - `auth` 是邮箱相关的认证，其中的 `pass` 属性并不是指登录邮箱的密码，而是邮箱的**授权码**

- 在设置邮件数据的时候

  - 收件人的邮箱可以有多个，通过逗号分隔的字符串或者是一个邮箱地址的数组，例如：`"a@a.com,b@b.com"`。只要有一个人成功收到邮件，就认为发送成功
  - 邮件主题 (`subject`) 和邮件的内容 (`text` 或 `html`) 不要相同，不然在网易的邮箱中会被视为**垃圾邮件**而报错
    - [网易邮箱退信代码](http://help.163.com/09/1224/17/5RAJ4LMH00753VB8.html)
    - [554 DT:SPM](https://blog.csdn.net/sinat_21302587/article/details/69388526)

### node-schedule 定时任务模块

[node-schedule](https://github.com/node-schedule/node-schedule)

### superAgent + cheerio 爬虫

- [superAgent 中文文档](https://cnodejs.org/topic/5378720ed6e2d16149fa16bd) nodejs 端的 ajax
- [cheerio](https://cheerio.js.org/) nodejs 端的 jQuery
- [【ONE·一个】的主页](http://www.wufazhuce.com/)

## 实现

将上面的几个 example 合并在一起就行了。就这么简单，但是还是有一些注意的。

- 爬虫请求是异步的，也就是无法确定哪个数据线获取，所以可以使用`Promise.all`将它们包起来，等请求都结束后再发送邮件
- 发送邮件失败的处理，可能是爬虫失败导致的发送失败，也可能是邮件本身发送失败，都要做处理

## 待解决的问题

- [ ] 每次发送都会先报错，报错为授权失败

  ```txt
  code: 'EAUTH',
  response: '535 Error: authentication failed',
  responseCode: 535,
  command: 'AUTH PLAIN'
  ```

- [ ] banner 图片使用了随机 API，请求受限，且每次都是不固定的，打开一次请求一次

- [ ] 在邮箱大师手机版上完全看不到样式
