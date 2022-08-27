[![forthebadge](https://www.prodvest.com/img/xlogoddbb.png,q_ffd.pagespeed.ic.7RIwZnrgA8.webp)](http://forthebadge.com)

*品研网官方网站，也作为其它组件的测试站点，以自举项目*

# 目录

- [目录](#目录)
- [目录结构](#目录结构)
  - [根目录](#根目录)
- [主要概念](#主要概念)
  - [运行环境](#运行环境)
- [在pv-fasitfy引入的插件](#在pv-fasitfy引入的插件)

# 目录结构

[(返回目录)](#table-of-contents)

## 根目录

- config 由pv-fastify定义的目录，不会加入到git中，存放运行环境定义。每个目录为一个运行环境。
  - runtime.json 一个数组，定义了全部运行环境。local为本地。
  - local 本地运行环境：数据库、集群配置等信息。
    - opts.json fastify启动定义。
    - db.sqlite sqlite数据库,默认的开发环境数据库。
    - data 本地[zinsearch](https://zincsearch.com/)的数据目录，默认的开发环境索引器。
- plugins 由fastify定义的目录，启动时会自动加载其中全部插件。
  - prodvest.js 引入pv-fastify。其它内置工作在pv-fastify中完成。
- routes 由fastify定义的目录，根据文件创建路由。
- public pv-fastify会以这里为根目录启动fastify-static插件。
- client 由pv-fastify定义，结构与sveltekit相同，创建的客户端代码放入此目录下。

# 主要概念

## 运行环境

通过web界面，在本地环境时，提供了维护运行环境的能力。运行环境通过启动命令时的自定义参数来支持。如下示例:

```console
NODE_ENV=development fastify start app.js -- --mode=local
```

其中local为默认的本地环境，可以不传。其它有效的运行环境在config/runtime.json中定义。并且启动命令自动维护，无需手动处理。在config/{mode}/opts.json中添加对应的[fastify启动配置]([https://www.fastify.io/docs/latest/Reference/Server/)

# 在pv-fasitfy引入的插件

- [fastify-static](https://github.com/fastify/fastify-static) : 静态资源在开发环境下存放在public目录下。其它环境由环境自行定义。注意引入的插件也会暴露静态资源。列表如下：

```

```
