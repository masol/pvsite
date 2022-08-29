[![forthebadge](https://www.prodvest.com/img/logoddbb.png)](http://www.prodvest.com)

*品研网官方网站，也作为其它组件的测试站点，以自举项目*

# 目录

- [目录](#目录)
- [目录结构](#目录结构)
  - [根目录](#根目录)
- [主要概念](#主要概念)
  - [运行环境](#运行环境)
    - [集群管理](#集群管理)
  - [相关性](#相关性)
- [在pv-fasitfy引入的插件](#在pv-fasitfy引入的插件)
- [配置说明](#配置说明)
- [decorate说明](#decorate说明)

# 目录结构

[(返回目录)](#table-of-contents)

## 根目录

- config 由pv-fastify定义的目录，不会加入到git中，存放运行环境定义。每个目录为一个运行环境。应用配置由[node-config](https://github.com/node-config/node-config)来处理，请参考其文档了解支持的格式及使用方式。
  - :sweat_drops: nodes.json 一个数组，定义了全部运行环境。local为本地。
  - active 符号链接，链接到当前有效的运行环境。
  - local 本地运行环境：数据库等配置信息。
    - default.json 默认项目配置。
    - :sweat_drops: *production.json* 可选: 产品环境下的覆盖项。
    - :sweat_drops: *development* 可选: 开发环境下的覆盖项。
    - db.sqlite sqlite数据库,默认的开发环境数据库。
    - data 本地[zinsearch](https://zincsearch.com/)的数据目录，默认的开发环境索引器。
- plugins 由fastify定义的目录，启动时会自动加载其中全部插件。
  - prodvest.js 引入pv-fastify。其它内置工作在pv-fastify中完成。
- routes 由fastify定义的目录，根据文件创建路由。
- frontend 由pv-fastify定义，结构与sveltekit相同，创建的客户端代码放入此目录下。
  - build pv-fastify会以这里为根目录启动fastify-static插件。这里也是sveltekit build的结果存放地。

# 主要概念

## 运行环境

&emsp;&emsp;通过web界面，在本地环境时，提供了维护运行环境的能力。运行环境通过在config目录下建立符号链接active来支持。有效的运行环境在config/runtime.json中定义。这一设定是考虑由web ui来维护运行环境。在config/{mode}/opts.json中添加对应的[fastify启动配置]([https://www.fastify.io/docs/latest/Reference/Server/)

**😄 注意，默认配置，config目录不会保存到git中。这里有可能保存了key,cert等敏感文件。**

### 集群管理

&emsp;&emsp;集群管理使用[consul](https://github.com/hashicorp/consul),并在node环境下使用[node-consul](https://github.com/silas/node-consul)。集群管理只在集群环境下创建，运行环境切换到多机/多中心时，自动引入。

## 相关性

&emsp;&emsp;使用品研，建议一切使用正常的中文，并尽可能靠近您的业务需求。所有文本输入的环节，都会有上下文提示。一个类似技术的例子，是搜索引擎中的提示，例如百度、谷歌中，你输入一部分，系统给你的提示。这类提示一般基于[N-Gram](https://en.wikipedia.org/wiki/N-gram)，这里有[一个入门例子](https://towardsdatascience.com/implementing-auto-complete-with-postgres-and-python-e03d34824079)

&emsp;&emsp;品研的实现，基于[spacy](https://spacy.io/)，获取词、词性及依赖。并以相似的原理，组合出依赖、主谓、谓宾。加入全文索引中。作为生成器供应素材。然后由模拟函数得到结果，代入目标函数获取最佳结果。

&emsp;&emsp;一个例子，在设计信息表格时，添加方法时，AI会给出若干建议，选择即可。例如在商品表上，会得到添加购买、评论的建议。添加后，自动处理并生成后续代码。AI的缺点依然存在，如对结果不满意，只能手动修改。

# 在pv-fasitfy引入的插件

- [fastify-static](https://github.com/fastify/fastify-static) : 静态资源在开发环境下存放在public目录下。其它环境由环境自行定义。注意引入的插件也会暴露静态资源。列表如下：

# 配置说明

当前激活的配置文件存放在目录config/active/default.XXX中。其定义如下:
- fastify: 保存[fastify启动配置](https://www.fastify.io/docs/latest/Reference/Server/#factory)。
  - logger: logger的可配置项，参考[pino配置对象](https://github.com/pinojs/pino/blob/master/docs/api.md#options-object)。pv-fastify允许logger值为字符串，此时其指向了logger对象定义模块,空为'./logger.js'，

    ```json
    "fastify" : {
    }
    ```

- env: 定义了运行环境。
  - name: [string] 运行环境人读名称。
  - mname: [string] 运行环境机读名称——此名称也是保存配置的目录名称。
  - local: [boolean] 是否是本地环境，以决定是否加载本地开发模块，请不要在正式环境下设置此值。
  - disabled-plugins: [Array<String>] 禁用的内建插件。
  - enabled-plugins: [Array<String>] 启用的内建插件。
- db: 保存了database配置.

  
# decorate说明

- _ : lodash对象
- config: node-config加载的对象，除了加载的配置,额外扩展了如下函数([cofing的内建函数](https://github.com/node-config/node-config/wiki/Using-Config-Utilities)):
  - util.isLocal() : [boolean]是否处于本地模式,以允许编辑模式。
  - util.contain(string,string) : 给定属性路径下，如果是一个数组，是否包含指定的值。
  - util.isPluginDisable(string) : [boolean]指定的内建插件是否被配置禁用了，不配置默认是启用的。
