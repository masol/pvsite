[![forthebadge](https://www.prodvest.com/img/logodd.png)](http://www.prodvest.com)

*品研网官方网站，也作为其它组件的测试站点，以自举项目*

<h1>目录</h1>

- [使用说明](#使用说明)
- [主要概念](#主要概念)
  - [相关性](#相关性)
  - [面向服务(SOA)](#面向服务soa)
  - [运行环境](#运行环境)
    - [环境管理](#环境管理)
- [目录结构](#目录结构)
  - [根目录](#根目录)
- [在pv-fasitfy引入的插件及特性](#在pv-fasitfy引入的插件及特性)
  - [默认关闭](#默认关闭)
    - [插件](#插件)
    - [特性](#特性)
  - [默认启用](#默认启用)
    - [插件](#插件-1)
    - [特性](#特性-1)
- [配置说明](#配置说明)
- [decorate说明](#decorate说明)
- [服务列表](#服务列表)

# 使用说明
&emsp;&emsp;如果不修改AI创建的代码，不需要开发知识。但是不修改是不可能的。因此，品研从V2开始，假定使用者为程序员。抛弃了V1为领域专家准备的修改UI——如果想支持全部修改，工作量过于浩大了。
&emsp;&emsp;使用方式，安装npm，docker环境。并提前docker pull下列image:
- elasticsearch:8.4.1
- vault:latest

&emsp;&emsp;使用命令`npm create prodvest`来创建自己项目的框架代码。或从品研官网(www.munao.cc)中下载框架代码包。
&emsp;&emsp;在代码根目录下执行:
- `npm run start`: 本地产品模式。
- `npm run dev`: 本地开发模式。

&emsp;&emsp;在浏览器中访问[http://127.0.0.1:3000/admin](http://127.0.0.1:3000/admin)。如果首次运行，按照提示创建管理用户，之后如何使用，参考官方手册。
&emsp;&emsp;使用过程中，AI辅助创建和维护代码，对于尚未覆盖或对结构不满意的地方，需要手动修改。因此需要了解创建代码的结构。

# 主要概念

## 相关性

&emsp;&emsp;使用品研，建议一切使用正常的中文，并尽可能靠近您的业务需求。系统利用相关性给出生成器的素材集合。一个相关性技术的例子，是搜索引擎中的提示，例如百度、谷歌中，你输入一部分，系统给你的提示。这类提示一般基于[N-Gram](https://en.wikipedia.org/wiki/N-gram)，这里有[一个入门例子](https://towardsdatascience.com/implementing-auto-complete-with-postgres-and-python-e03d34824079)

&emsp;&emsp;品研的实现，基于[spacy](https://spacy.io/)，获取词、词性及依赖。并以相似的原理，组合出依赖、主谓、谓宾。加入全文索引中。作为生成器供应素材。然后由模拟函数得到结果，代入目标函数获取最佳结果。

&emsp;&emsp;一个例子，在设计信息表格时，添加方法时，AI会给出若干建议(或直接默认选择)，选择即可。例如在商品表上，会得到添加购买、评论的建议。添加后，自动处理并生成后续代码。AI的缺点依然存在，如对结果不满意，只能手动修改。

## 面向服务(SOA)

&emsp;&emsp;为简化AI工作，品研的自身的代码结构，以及创建的代码，都是基于SOA的。并且整合了部署与维护。为fastify扩展了soa对象。未来会支持跨语言，因此服务的接口定义采用了[google protobuf](https://developers.google.com/protocol-buffers)。而不是typescript中的interface。

&emsp;&emsp;一个服务，对调用者而言，就是一个实例，以实现某些接口。但是其隐含了如下需求:
- loader: 为了创建类实例，需要加载类代码，这是由服务的装载器(loader)完成。为了复用装载器，装载器会被设计为可配置，其配置信息被保存在服务定义的`conf`项下。装载器自身也是一个服务。
- deploy: 某些实例运行依赖外部服务(例如数据库服务器)，这些服务需要被部署并正常执行。部署器的职责就是检查依赖服务是否被部署完毕。可以设置`deploy:false`(默认)来跳过部署环节。部署器自身也是一个服务，参考[运行环境](#运行环境)。常见的部署器：
  - docker: 基于本地docker环境的部署，主要用于轻量级环境，例如单机环境。本地环境就是一个轻量级环境。
  - kubernetes: 基于kubernetes的部署。
  - nomad: 基于nomad的部署器。
- preload: 预加载服务。某些服务启动时，需要依赖其它服务。由于服务默认是LOD(Load on Demand)，如果涉及部署，可能会需要很长时间，从而导致timeout异常。列在这里的服务，会在服务被加载时开始预加载。

&emsp;&emsp;服务定义文件，可以定义多个服务。key为服务名称，值定义如下:
- name:string&emsp;服务名称,可选。
- conf:object&emsp; 实例时的配置.
- loader:object&emsp; 装载器配置。
- deploy?:&emsp; 部署器配置。
- preload?:string[]&emsp;预加载列表。是一个数组，值为srv-name。

## 运行环境

&emsp;&emsp;通过web界面，在本地环境时，提供了维护运行环境的能力。运行环境通过在config目录下建立符号链接active来支持。有效的运行环境在config/runtime.json中定义。这一设定是考虑由web ui来维护运行环境。在config/{mode}/opts.json中添加对应的[fastify启动配置]([https://www.fastify.io/docs/latest/Reference/Server/)

**😄 注意，默认配置，config目录不会保存到git中。这里有可能保存了key,cert等敏感文件。**

### 环境管理

&emsp;&emsp;每个运行环境为一个集群，即使本地环境也是一个集群，可以弹性扩充。本地的集群管理使用[consul](https://github.com/hashicorp/consul)。web端使用使用[node-consul](https://github.com/silas/node-consul)来通信。为方便部署，服务部署采用节点的管理与维护采用同一公司的[nomad](https://www.nomadproject.io/)。在服务未启动，但是定义的节点有效时，自动启动。其它集群的管理系统可选采用[Kubernetes系列](https://kubernetes.io/)。这里有如下一个些概念需要区分:
- 节点: 可以是物理机、容器...
- 服务(组): 不仅仅包括可部署服务，也包括外部服务。服务在客户端是一个包。
  - 接口： 使用者可以恒定调用接口。接口采用[gRpc](https://grpc.io/)格式。
  - 实现： 如果服务提供与接口不同，会提供实现包将其转化为接口。
- 任务： 这里特指nomad的维护任务。
- 配置: 配置信息被保存在consul中。
- secret: secret信息被保存在vault服务中。

**😄 注意，为了在windows下开发，本地环境未采用容器调度与管理服务。**


# 目录结构

[(返回目录)](#table-of-contents)

## 根目录

- config 由pv-fastify定义的目录，不会加入到git中，存放运行环境定义。每个目录为一个运行环境。应用配置由[node-config](https://github.com/node-config/node-config)来处理，请参考其文档了解支持的格式及使用方式。
  - :sweat_drops: nodes.json 一个数组，定义了全部运行环境，方便admin快速处理，无需从目录中重构。local为本地。
  - active 符号链接，链接到当前有效的运行环境。
  - local 本地运行环境：应用，数据库等配置信息。
    - default.json 默认项目配置。
    - :sweat_drops: *production.json* 可选: 产品环境下的覆盖项。
    - :sweat_drops: *development* 可选: 开发环境下的覆盖项。
    - redis: redis的本地目录。
      - volumes: 存放redis stack server的数据。
        - data: 映射到redis的/data，以存放数据。
    - elastic: elastic的本地目录
      - http_ca.crt: tls所需的证书。本地启动时自动从docer中获取。
      - passwd: elastic用户的密码，本地启动自动调用reset来获取最新。
      - volumes: 存放elastic的数据.
        - data: elastic的数据。
        - logs: elastic的日志。
    - vault vault的本地目录.
      - ~~docker-compose.yml 启动vault service的docker compose配置,已废弃.~~
      - root.key 如果自动初始化,则这里保存了root key.用于vault解封.
      - root.token 如果自动初始化,保存了root token.用于后续免登录访问vault.
      - volumes: 映射到docker容器的host目录.
        - config 配置目录
          - vault.json vault启动配置.
        - file 本地存储.由vault维护.
        - logs 日志目录,由vault维护.
    - data 本地环境的数据存放。
      - db.sqlite sqlite数据库,默认的开发环境数据库。
      - ftindex 本地[zinsearch](https://zincsearch.com/)的数据目录，默认的开发环境索引器。
      - redis
- plugins 由fastify定义的目录，启动时会自动加载其中全部插件。
  - prodvest.js 引入pv-fastify。其它内置工作在pv-fastify中完成。
- routes 由fastify定义的目录，根据文件创建路由。
- dev 由编辑器维护的数据目录。
  - assets: 静态资源源代码，会整个的拷贝到root目录下。根据后缀选择资源处理方式。
  - docs: 文档入口
- root 静态资源web入口。不要直接向这里写入内容，这是编译之后存放客户端静态资源的地方。不保存在git中。
- frontend 由pv-fastify定义，结构与sveltekit相同，创建的客户端代码放入此目录下。
  - build pv-fastify会以这里为根目录启动fastify-static插件。这里也是sveltekit build的结果存放地。

# 在pv-fasitfy引入的插件及特性

&emsp;&emsp;引入的插件及特性共用一个enabled/disabled配置。

## 默认关闭

### 插件
- [static](https://github.com/fastify/fastify-static) : 静态资源在开发环境下存放在pubroot目录下。其它环境由环境自行定义。代码中引入必须在compress插件之前。注意引入的插件也会暴露静态资源。列表如下：
- [rate-limit](https://github.com/fastify/fastify-rate-limit): 对全局或指定请求限速。

### 特性
- [docker](https://github.com/apocas/dockerode): 为isLocal引入Dockerode类及docker对象,本地环境下强制开启。
- [docker-compose](https://github.com/apocas/dockerode-compose): 为isLocal引入DockerodeCompose类及compose对象。
- [docker-modem](https://github.com/apocas/docker-modem): 为isLocal引入DockerodeModem类及modem对象。
- [vault](https://github.com/nodevault/node-vault): 在nodejs环境中与[hashi vault](https://www.hashicorp.com/)交互的库。使用UI配置时，非本地环境默认开启。
- [elastic](https://www.elastic.co/): 在nodejs环境中与elasticsearch通信的支持，本地环境下强制开启。
- [zinc](https://zincsearch.com/): 使用zinsearch执行全文检索。
- [redis](https://redis.io/): redis兼容的内存数据库，本地环境下强制开启。

## 默认启用

### 插件
- [cors](https://github.com/fastify/fastify-cors) : 引入cors支持。默认origin为false.
- [circuit-breaker](https://github.com/fastify/fastify-circuit-breaker) : 引入断路器支持。如果需要，请在route级设置onCircuitOpen，onTimeout。
- [accepts](https://github.com/fastify/fastify-accepts) : 支持与客户端的格式协商。
- [compress](https://github.com/fastify/fastify-compress) : 支持回应压缩格式。

### 特性
- [crypto-random](https://github.com/sindresorhus/crypto-random-string) : 支持sco.cryptoRandom

# 配置说明

&emsp;&emsp;当前激活的配置文件存放在目录config/active/default.XXX中。在运行期代码并未维护配置之间的相关性，如果某个依赖服务未就绪，直接报错。在admin的UI代码中维护配置的相关性。可配置内容如下:

- fastify: 保存[fastify启动配置](https://www.fastify.io/docs/latest/Reference/Server/#factory)。
  
  - logger: logger的可配置项，参考[pino配置对象](https://github.com/pinojs/pino/blob/master/docs/api.md#options-object)。pv-fastify允许logger值为字符串，此时其指向了logger对象定义模块,空为'./logger.js',pino的log系列方法的message格式，采用%s,%d,%o占位方式，[参考其文档](https://github.com/pinojs/pino/blob/master/docs/api.md#message)。

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
- cors: 定义了cors设置。参考[cors-options](https://github.com/fastify/fastify-cors#options)
- circuit-breaker: 定义了断路器，通常由AI维护。参考[circuit-breaker options](https://github.com/fastify/fastify-circuit-breaker#options)
- rate-limit: 参考[限速配置](https://github.com/fastify/fastify-rate-limit#options)了解这里允许的内容。
- compress: 参考[压缩配置](https://github.com/fastify/fastify-compress#compress-options)。
- static: 参考[静态资源](https://github.com/fastify/fastify-static#options)配置项。
- docker: 参考[使用dockerode](https://github.com/apocas/dockerode#usage)了解允许的配置项。
- docker-modem: 参考[使用docker-modem](https://github.com/apocas/docker-modem#getting-started)
- vault : [node-vault配置项](https://github.com/nodevault/node-vault#init-and-unseal)。
- elastic: [elastic配置](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/client-configuration.html)。如果使用docker,通常桌面版的max_map_count不足，临时修改的指令:`sudo sysctl -w vm.max_map_count=262144`。长期生效，修改文件`/etc/sysctl.conf`，在其中添加`vm.max_map_count=262144`
- db: 保存了database配置.

# decorate说明

- _ : [lodash对象](https://lodash.com/) : 被内建添加，不能移除。内部代码依赖lodash.
- $ : [promise-utils对象](https://github.com/blend/promise-utils) : 被内建支持，不能移除。内部代码依赖此库。
- config: node-config加载的对象，除了加载的配置,额外扩展了如下函数([cofing的内建函数](https://github.com/node-config/node-config/wiki/Using-Config-Utilities)):
  - util.isLocal() : [boolean]是否处于本地模式,以允许编辑模式。
  - util.path(string...): [string]返回参数构建的基于运行目录的目录。传入空，返回运行目录。
  - util.dget(path,def={}): 获取指定路径的配置，如果不存在，则返回def.
  - util.contain(string,string) : 给定属性路径下，如果是一个数组，是否包含指定的值。
  - util.isDisabled(string) : [boolean]指定的插件或特性是否被配置禁用了，不配置默认是启用的。
  - util.isEnabled(string) : [boolean]指定的插件或特性是否被配置允许了，不配置默认是禁用的。
- soa : [Service-oriented architecture](https://en.wikipedia.org/wiki/Service-oriented_architecture)的前端对象。通过接口获取服务对象。
  - async get(serviceName,opt) 获取服务对象(DNS liked name)。可能会涉及服务装载等动作。服务装载，根据配置，委托给kubernetes或nomad或自行实现的一个简化版(基于dockerode).
  - async reg(serviceName,any) 类似decorate，为soa注册可用服务。
- sco : (service configuration objects)根据配置引入的对象，通常使用前需要检查是否有效。
  - Dockerode : docerode引入的类，如果docker被允许(本地环境或启用了Docker插件)
  - docker : 按照默认配置加载的docker实例。
  - DockerodeCompose: dockerode-compose引入的类。[后续用法](https://github.com/apocas/dockerode-compose#getting-started)
  - DockerodeModem: dockerode-modem[引入的类](https://github.com/apocas/docker-modem#getting-started)。
  - modem: 按照配置创建的modem实例。
  - static : fastify-static插件对象，用于后续的静态路径配置。如果本地或static被启用。
  - vault : [node-vault对象](https://github.com/nodevault/node-vault#usage)。如果vault被启用。
  - cryptoRandom: 扩展增加了[cryptoRandomString函数](https://github.com/sindresorhus/crypto-random-string)
  - elastic: 如果elastic被支持，则指向了[nodejs sdk intance](https://github.com/elastic/elasticsearch-js)
  - Elastic: 如果elastic被支持，则指向了Elastic Client类。

# 服务列表
- docker
- Dockerode
- DockerodeCompose
- DockerodeModem
- modem
- vault
- static
- elastic
- Elastic
