[![forthebadge](https://www.prodvest.com/img/logodd.png)](http://www.prodvest.com)

*品研网官方网站，也作为其它组件的测试站点，以自举项目*

<h1>目录</h1>

- [使用说明](#使用说明)
- [命令体系](#命令体系)
  - [web环境命令](#web环境命令)
    - [web命令说明](#web命令说明)
  - [pipeline工具](#pipeline工具)
    - [概念说明](#概念说明)
    - [与传统工具衔接](#与传统工具衔接)
    - [执行方式](#执行方式)
- [主要概念](#主要概念)
  - [相关性](#相关性)
  - [面向服务(SOA)](#面向服务soa)
    - [简介](#简介)
    - [Why SOA?](#why-soa)
    - [服务定义(SDL)](#服务定义sdl)
  - [cors \&\& stateless](#cors--stateless)
    - [cors session(corsession)](#cors-sessioncorsession)
    - [stateless ws(corsws)](#stateless-wscorsws)
    - [cors file server](#cors-file-server)
    - [cors media server](#cors-media-server)
  - [运行环境](#运行环境)
    - [部署服务](#部署服务)
  - [缓冲说明](#缓冲说明)
- [目录结构](#目录结构)
  - [根目录](#根目录)
- [fastify扩展说明(decorate)](#fastify扩展说明decorate)
- [服务与配置](#服务与配置)
  - [配置说明](#配置说明)
  - [服务列表](#服务列表)
    - [伪服务](#伪服务)
    - [默认启用](#默认启用)
    - [开发环境下默认启用(其它环境需配置后启用)](#开发环境下默认启用其它环境需配置后启用)
    - [默认关闭](#默认关闭)

# 使用说明
&emsp;&emsp;如果不修改AI创建的代码，不需要开发知识。但是不修改是不可能的。因此，品研从V2开始，假定使用者为程序员。抛弃了V1为领域专家准备的修改UI——如果想支持全部修改，工作量过于浩大了。
&emsp;&emsp;使用方式:
1. 需要团队级的版本控制，推荐[gitlab](https://docs.gitlab.com/ee/install/docker.html)。一个版本控制可以支持多个项目。不推荐使用[jenkins git](https://plugins.jenkins.io/git-server/)。因为全局工程师需要自行控制jenkins，但可以不自行控制git。也不推荐使用gitlab自带的CI，社区版功能有限。
2. **可选**: 只有多人协同才需要的[pipeline工具](#pipeline工具)，用于自动触发而不是手动触发的场合。安装[jenkins](https://www.jenkins.io/doc/book/installing/linux/)，将某个具体config中的[Jenkinsfile](https://www.jenkins.io/doc/book/pipeline/)拷贝到根目录下。也可以为每个目标集群构建一个git branch。将对应Jenkinsfile拷贝到根目录下。ubuntu下，按照指引安装jenkins前，需要执行`sudo apt install default-jre`以确保java就绪。使用`systemctl status jenkins.service`来检查jenkins是否就绪。
   1. 如果需要自定义pipeline,推荐安装[blue ocean插件](https://www.jenkins.io/doc/book/blueocean/getting-started/)。
3. 安装npm，gulp,docker环境。

&emsp;&emsp;使用命令`npm create prodvest`来创建自己项目的框架代码。或从品研官网(www.munao.cc)中下载框架代码包。

&emsp;&emsp;使用命令`sudo npm install -g gulp-cli`来安装gulp命令行支持。以支持pipeline。

&emsp;&emsp;在代码根目录下执行:
- `npm run start`: 本地产品模式。
- `npm run dev`: 本地开发模式。

&emsp;&emsp;在浏览器中访问[http://127.0.0.1:3000/admin](http://127.0.0.1:3000/admin)。如果首次运行，按照提示创建管理用户，之后如何使用，参考官方手册。
&emsp;&emsp;使用过程中，AI辅助创建和维护代码，对于尚未覆盖或对结构不满意的地方，需要手动修改。因此需要了解创建代码的结构。

# 命令体系

## web环境命令
&emsp;&emsp;借鉴[drush](https://www.drush.org/latest/)的概念，提供了命令行`npm run cmd XXX -- --param=value`。命令行模式启用了[external imports](https://nodejs.org/api/esm.html#https-and-http-imports)。允许从网络加载代码。目前提供的命令如下:
- user: 自动调用migrate之后，维护用户，创建admin用户，如果没有的话。这是默认选项。额外支持如下参数:
  - reset 将admin的密码重置为admin.passwd中的值，如果没有，创建默认密码，并保存到admin.passwd中．
- migrate: 维护数据库，默认全部。额外参数:-- --down --force --all 参考auth模块的文档。
- pkg: 使用[pkg](https://github.com/vercel/pkg)生成编译发行版。(暂未支持，可能在pipeline中支持)

### web命令说明
&emsp;&emsp;通过检查`fastify.runcmd`是否为真来判定是否处于命令模式下。命令模式有如下几个特点:
- 加载配置与服务的过程与web模式相同。
- 启用本地sock监听而不是网络监听，这是因为[fastify-cli](https://github.com/fastify/fastify-cli/blob/master/start.js#L156)目前无法设置`additionalOptions`。这导致命令无法并行。

## pipeline工具

### 概念说明
&emsp;&emsp;您的目标集群，拥有状态。例如未初始化，软件安装完毕但数据库未初始化...这些状态由各自对应的task来更改。这些task按照状态变迁的顺序执行，就称为pipeline。
&emsp;&emsp;之所以需要Pipeline|Infrastruction As Code。是因为实践中，pipeline实际是平面的，有两个维度。X轴是目标集群当前的状态，Y轴是您做的修改，例如部分代码修正，某台机器加入/撤离集群。pipeline就是负责将您的修改同步到现实。

### 与传统工具衔接
&emsp;&emsp;由于全局工程师的概念范围广，需要多个传统工具，为简化初学者的工具操作数量，提供了pipeline工具。在项目小规模时期，取代传统三个devOps工具:
- Pipeline中支持[Infrastructure automation](https://www.redhat.com/en/topics/automation/what-is-infrastructure-automation#:~:text=Infrastructure%20automation%20is%20the%20use,information%20technology%20services%20and%20solutions.)，可以使用诸如[pulumi](https://www.pulumi.com/)等工具来替换。
- CI/CD可以方便的集成进入诸如[jenkis](https://www.jenkins.io/)的pipeline。
- [infrastructure monitoring](https://sematext.com/blog/infrastructure-monitoring-tools/)工具只提供了部分测试脚本。可以通过自行安装[Graphite](https://graphite.readthedocs.io/en/stable/)或购买国内的监视服务来支持。

### 执行方式
&emsp;&emsp;这些命令位于pipeline目录下，由`npm run pipeline XXXX`或者`gulp XXX`来启动。内部脚本使用gulp任务管理器来实现。为跨平台工具，采用shelljs来书写(但是前期只在linux下测试通过)。支持如下stage:
- chkInfra 检查Infra环境是否就绪。
- deployInfra 配置Infrastructure。


# 主要概念

## 相关性

&emsp;&emsp;使用品研，建议一切使用正常的中文，并尽可能靠近您的业务需求。系统利用相关性给出生成器的素材集合。一个相关性技术的例子，是搜索引擎中的提示，例如百度、谷歌中，你输入一部分，系统给你的提示。这类提示一般基于[N-Gram](https://en.wikipedia.org/wiki/N-gram)，这里有[一个入门例子](https://towardsdatascience.com/implementing-auto-complete-with-postgres-and-python-e03d34824079)

&emsp;&emsp;品研的实现，基于[spacy](https://spacy.io/)，获取词、词性及依赖。并以相似的原理，组合出依赖、主谓、谓宾。加入全文索引中。作为生成器供应素材。然后由模拟函数得到结果，代入目标函数获取最佳结果。

&emsp;&emsp;一个例子，在设计信息表格时，添加方法时，AI会给出若干建议(或直接默认选择)，选择即可。例如在商品表上，会得到添加购买、评论的建议。添加后，自动处理并生成后续代码。AI的缺点依然存在，如对结果不满意，只能手动修改。

## 面向服务(SOA)

### 简介
&emsp;&emsp;为简化AI工作，品研的自身的代码结构，以及创建的代码，都是基于SOA的。并且整合了部署与维护。为fastify扩展了soa对象。未来会支持跨语言，因此服务的接口定义采用了[google protobuf](https://developers.google.com/protocol-buffers)。而不是typescript中的interface。

&emsp;&emsp;一个服务，对调用者而言，就是一个实例，以实现某些接口。但是其隐含了如下需求:
- loader: 为了创建类实例，需要加载类代码，这是由服务的装载器(loader)完成。为了复用装载器，装载器会被设计为可配置，其配置信息被保存在服务定义的`conf`项下。装载器自身也是一个服务。
- deploy: 某些实例运行依赖外部服务(例如数据库服务器)，这些服务需要被部署并正常执行。部署器的职责就是检查依赖服务是否被部署完毕。可以设置`deploy:false`(默认)来跳过部署环节。部署器自身也是一个服务，参考[运行环境](#运行环境)。常见的部署器：
  - docker: 基于本地docker环境的部署，主要用于轻量级环境，例如单机环境。本地环境就是一个轻量级环境。
  - kubernetes: 基于kubernetes的部署。
  - nomad: 基于nomad的部署器。
- preload: 预加载服务。某些服务启动时，需要依赖其它服务。由于服务默认是LOD(Load on Demand)，如果涉及部署，可能会需要很长时间，从而导致timeout异常。列在这里的服务，会在服务被加载时开始预加载。

### Why SOA?
&emsp;&emsp;采用SOA,是为了简化后续AI对体系结构性的设计。注意SOA风格下，体系结构的设计，不体现在代码上，而是体现在服务定义文件的不同上。对于AI而言，工作职责就是从自然语言等输入，构建服务定义的相关性，得到生成器集合，然后通过模拟函数模拟并计算目标，以完成体系结构设计。很明显，相对于分析AST中的关系，SOA带来的这种映射简化了AI的实现。对人而言，SOA做为实现风格之一，也被很多人所熟悉，算是人与机器之间，关于工作量的一个妥协。
&emsp;&emsp;定义体系结构，就是定义服务组合。设计一个应用，首先定义其服务组合。可以将config目录下的服务定义看作体系结构定义。注意这里的服务与[micro-service](https://en.wikipedia.org/wiki/Microservices)有区别。自行查阅代码了解。

### 服务定义(SDL)
&emsp;&emsp;一个服务定义文件，可以定义多个服务。key为服务名称，值定义如下(这通常是由一个子AI设计并配置的，只有在不满意结果时，才需要人工修改)。通过`soa.get('SRV')`获取到的服务，可以检查其`issue`来确定其实现方式。
- name:string&emsp;服务名称,可选。
- disable: boolean&emsp; 是否此服务被禁用，默认false.
- conf:object&emsp; 实例时的配置.
- loader:object|string&emsp; 装载器配置。类似url,protocal部分为type,例如:`yarn://packagename#local-parameters`。默认的http/https假定装载的是一个es6 module.
  - type: 装载器类型:es6|npm|yarn

## cors && stateless
&emsp;&emsp;服务器默认为CORS环境，并且为stateless.包括服务器推(push),session,resource uploader,media server....

### cors session(corsession)
&emsp;&emsp;session支持了corsession服务．通过`authorization`(格式为`token`或者`Bearer token`)头来传递token信息．服务器会返回`set-token`来更新token．token中只包含了sessionId．

&emsp;&emsp;除了cors配置．客户端可以提交vid(Visitor ID)．如果不提供，则验证IP．要求每个token配对的vid或ip必须一致．(默认未开启strict)

### stateless ws(corsws)
&emsp;&emsp;思路是服务器定义自己的资源ID，并在资源更新时，调用`corsws.emit()`来广播更新内容(diff),建立了通路的客户端会收到消息，并更新Vars中的tgtpath．

&emsp;&emsp;为了建立通路，服务器可以通过`set-live`头(自动)或其它方式来返回(需手动建立通路)，在回应一个资源时，指明本资源是live更新的．live头的内容通过`corsws.liveId(topic,last)`来获取，格式为`last Token`．

&emsp;&emsp;为了在断线时不丢失live信息，live分为抛弃版(`volatile`设为true)及普通版(默认).普通版会将每次的emit存入数据库，并获取到当前版本id(自增长).这一id作为last返回客户端．客户端每次得到通知，都会更新自己的last,在断线重链之，会得到断线期丢失的更新信息．last设置为-2表示`volatile`,意味着不获取任意缺失的更新．

### cors file server
&emsp;&emsp;用户上传数据的资源服务器，是独立的．将身份验证信息编码进入URL,客户端得到URL即可上传/下载私有文件．推荐使用aws兼容的oss服务．也支持一个简单的内建资源服务器．

### cors media server
&emsp;&emsp;直播，视频与资源数据的区别在于上传后的资源需要做处理．可以通过oss提供的处理服务，或者独立的media server来支持．apiserver也是通过对URL签名的方式鉴权．


## 运行环境

&emsp;&emsp;通过pipeline，在本地环境时，提供了维护运行环境的能力。运行环境通过在`pvdev/cluster`目录中定义，并编译到config目录下，特定环境通过建立符号链接active来支持。在`pvdev/cluster/default.json`及`pvdev/cluster/{cluster name}/config/default.json`中添加[服务与配置](#服务与配置)。pipeline会将集群配置合并全局配置，然后将其更新至`config/{cluster name}/default.json`

**😄 注意，默认配置，config目录不应该保存到git中,这个目录自动维护，并有可能保存了key,cert等敏感文件。**

### 部署服务

&emsp;&emsp;每个运行环境为一个集群，即使本地环境也是一个集群，可以弹性扩充。提供了基于[gulp](https://gulpjs.com/)的pipeline子项目来支持devops(全局工程师为同一人)。提供如下支持:
- 对于微型集群(服务器数量小于等于5)，无需任何定义，由pipeline自动处理。
- 对于小型集群(服务器数量小于等于200),需自行为节点分配服务，其余交由pipeline自动处理。
- 超出200台服务器的集群，请采用其它ItOps工具链。例如[jenkis](https://www.jenkins.io/)+[salt](https://saltproject.io/)
&emsp;&emsp;默认的Web服务，采用前后端分离策略。静态资源可以部署在oss中，并采用cdn加速。非入口(用户在浏览器直接输入)URL，为immutable assets。可以安全的设置为用不变化。api资源需部署于可计算环境下。
&emsp;&emsp;pipeline支持的部署，本地环境采用docker部署依赖服务，$webXXX服务被忽略。其它节点采用[masterless salt](https://docs.saltproject.io/en/latest/topics/tutorials/quickstart.html)。pipeline的使用细节，参考pipeline项目。

## 缓冲说明

&emsp;&emsp;服务器端的状态持久化，主要涉及缓冲机制。目前数据分为三层(前两层为缓冲)，内存层，网络内存层(redis)，数据库。内存层节约内存的选择是集群友好的[memory map](https://www.npmjs.com/package/mmap-object)，默认使用了面向进程的[lru-cache](https://www.npmjs.com/package/lru-cache)。网络内存层选择redis，最后是数据库层。

&emsp;&emsp;缓冲服务不采用TTL机制，而是采用主动作废，通过redis的pub/sub机制来支持。当状态数据被更新时，发出缓冲作废的事件。注意：缓冲是一个依赖链，每次获取到缓冲对象，需要检查所有依赖状态时间戳，不满足时作废自身。(尚未实现)

# 目录结构

[(返回目录)](#table-of-contents)

## 根目录

- config 由pv-fastify定义的目录，***不应***加入到git中，存放**针对集群环境编译后的**服务定义，对应人工维护的原文件位于pvdev/nodes目录中。每个子目录为一个运行环境。应用配置由[node-config](https://github.com/node-config/node-config)来处理，请参考其文档了解支持的格式及使用方式。
  - :sweat_drops: envs.json 一个数组，定义了全部运行环境，方便admin快速处理，无需从目录中重构。local为本地。
  - active 符号链接，链接到当前有效的运行环境。
  - dev 开发运行环境：应用，数据库等配置信息。(下方目录都是默认值，如果更改配置文件，下方内容可能失效)
    - default.json 默认项目服务定义文件。通常此文件是由系统自动生成的.
    - :sweat_drops: *local.json* 可选: 人工配置的定义文件,其项会覆盖default.json中的内容.
    - :sweat_drops: *production.json* 可选: 产品环境下的覆盖项。
    - :sweat_drops: *development* 可选: 开发环境下的覆盖项。
    - postgres: postgres的本地目录。数据映射到docker的`local_pv_postgresql_data`中。
      - kc.passwd: 内容保存了keycloak用(postgres)的密码，默认数据库为keycloak。
      - app.passwd: 内容保存了app用的密码，其默认数据库为app。
    - keycloak: keycloak的本地目录。使用postgres数据库。
      - admin.passwd: 内容保存了admin用户的密码，超级用户。
      - manage.passwd: 内容保存了manage用的密码，管理员用户。
    - redis: redis的本地目录。
      - password: 如果redis需要密码,这里保存了密码.
    - elastic: elastic的本地目录
      - http_ca.crt: tls所需的证书。本地启动时自动从docer中获取。
      - passwd: elastic用户的密码，本地启动自动调用reset来获取最新。
    - vault vault的本地目录.
      - root.key 如果自动初始化,则这里保存了root key.用于vault解封.
      - root.token 如果自动初始化,保存了root token.用于后续免登录访问vault.
- src: 使用[npm init fastify](https://www.npmjs.com/package/create-fastify)创建的资源，被挪到此目录。
  - helper: 将辅助说明类代码放入这里。
    - models objection.js所维护的模型。
    - schemas 保存了接口及数据库的schema.
      - rest: 用于fastify验证的schema保存在这里。(for rest api)
      - db: 用于数据库migrate的schema保存在这里,其内目录为版本号，版本号中的所有js文件，如果包含了up/down，被视作verop.会将版本号中的数字部分抽取，并排序．
      - gql: gql的schema定义，虽然这里依然有效，但是一般会放在gql/schemas目录中．
    - gql: graphql的代码目录:
      - schemas: 其中的文件,保存了graphql的类型定义.
      - resolvers: 其中的文件,保存了resolver的定义.
      - loaders: 其中的文件,保存了loader的定义.
    - libs: 由使用者自行维护的，不能归类到其它类别，但是需要复用的＂库代码＂，通常在plugins目录下引入的插件初始化代码中调用．
    - fsms: 定义了系统内"复杂"状态的FSM，在提交数据时，通过FSM来辅助状态变迁并更新数据．通常只有状态数大于7才有可能使用．
  - plugins 由fastify定义的目录，启动时会自动加载其中全部插件。(只在主项目中自动遍历，模块中需要手动遍历)
    - prodvest.js 引入pv-fastify。其它内置工作在pv-fastify中完成。
  - routes 由fastify定义的目录，根据文件创建路由。(只在主项目中自动遍历，模块中需要手动遍历——可调用soa.util.route自动加入路由)
  - cmds: 命令实现。其内每个模块视作一个同名的命令．执行时会被调用．在自定义的插件中无需考虑命令模式－－命令模式下不会加载本地插件．
- test 测试文件存放目录。
- pvdev 由编辑器维护的数据目录
  - project.json 定义了项目的基础信息。其中$webapi的目录是当前项目目录，$webass指定了静态资源目录(如未指定，则为当前目录加ui构成目录,和当前目录同级)。
  - schemas: 保存系统定义的业务级变量schma.schema的定义采用[objectmodel](https://objectmodel.js.org/)。
  - nodes: 定义了运行节点。子目录与config中的子目录相同。定义了目标集群的环境。其中dev为本地环境。详细信息参阅@masol/pipeline项目中的说明。
    - dev: 这是本地环境，如果未给出，采用默认定义。
      - node.json 定义了全部节点，并给出了登录方式。可索引secret中的文件。
      - secret 存放node.json中索引的证书等文件。
      - service.json 定义了全部服务，其中会索引node.json中定义的节点。
  - fsms: 引用业务级变量的有限状态机，事件(transition)通常为人类动作。采用[xstate](https://xstate.js.org/)。
  - dps: [数据流处理](https://en.wikipedia.org/wiki/Data_processing)定义,定义数据依赖及处理流。采用[litegraph.js](https://github.com/jagenjo/litegraph.js)——类似[nodered编辑器](https://nodered.org/)
  - acl: 访问控制。采用[casl](https://casl.js.org/v6/en)。
  - openapi: 使用openapi规范定义接口。
  - pages: 存放pages代码。其中的内容为页面源码(拟定采用[grapesjs编辑器](https://github.com/artf/grapesjs))，采用[post-html](https://github.com/posthtml/posthtml)来做页面迁移。首个迁移目标为svelte，采用[tailwind](https://tailwindcss.com/)。一个站点推荐采用一个项目，而不是设置svelte的config.kit.paths.base配置。默认的编辑器采用此结构。手动处理无限制。

# fastify扩展说明(decorate)

- reqbase: require相对于主项目根目录下开始的包.例如`fastify.reqbase('src/libs/auth/local',__dirname)`
- _ : [lodash对象](https://lodash.com/) : 被内建添加，不能移除。内部代码依赖lodash.
  - cryptoRandom: 扩展增加了[cryptoRandomString函数](https://github.com/sindresorhus/crypto-random-string)。
  - glob: 扩展增加了[glob](https://www.npmjs.com/package/glob)。
- $ : [promise-utils对象](https://github.com/blend/promise-utils)及[@supercharge/goodies](https://superchargejs.com/docs/3.x/goodies#using-goodie-methods) : 被内建支持，不能移除。内部代码依赖此库。一些优秀的promise工具库，例如[pify系列](https://github.com/sindresorhus/pify)未加入，如果需要，以普通库方式自行加载。
  - glob: [glob](https://www.npmjs.com/package/glob)的Promise版本。
- s : [underscore.string](https://github.com/esamattis/underscore.string)。并在其下以名称空间的方式扩展了:
  - clusterName: 当前服务所使用的clusterName,从active符号链接resolve得到.
  - v : [validator.js](https://github.com/validatorjs/validator.js)。这些validator同时以format方式加入了[fastify内建ajv instance](https://ajv.js.org/)。
- error: [http oritend error](https://github.com/ShogunPanda/http-errors-enhanced)提供的异常函数，有按照[http status code](https://github.com/ShogunPanda/http-errors-enhanced/blob/main/src/errors.ts)的对应快捷异常类。
- om: [https://objectmodel.js.org/]: 动态类型检查(ObjectModel)更契合面向行为的思路，因此不推荐typescript,flow等编译期类型检查编译器，推荐采用soa.om来执行运行期类型检查。
- shell: [以js虚拟shell实现](https://github.com/shelljs/shelljs)提供程序接口的shell界面，以使用当前用户维护系统。例如增加本地包的自维护性，因此额外扩展了两个函数(采用的包管理器通过env服务配置):
  - require(pkgName,opt?) async require pkg,如果失败，则install后重试。
  - import(pkgName,opt?) async import es6 pkg，如果失败，则install后重试。
  - install(pkgName) async 在主项目目录下，安装指定包。
  - pexec(cmdline,opt?) async 异步模式的exec。在执行外部命令时，不卡住主线程。
- config: node-config加载的对象，除了加载的配置,额外扩展了如下函数([cofing的内建函数](https://github.com/node-config/node-config/wiki/Using-Config-Utilities))。所有插件/对象在加载时，需要把默认值写入config(如果config未指定)，后续请求服务时，可以通过config直接获取配置。(或者通过获取服务对象，来获取配置？)
  - util.path(string...): [string]返回参数构建的基于运行目录的目录。传入空，返回运行目录。
  - util.dget(path,def={}): 获取指定路径的配置，如果不存在，则返回def.
  - util.contain(string,string) : 给定属性路径下，如果是一个数组，是否包含指定的值。
  - util.isDisabled(string) : [boolean]指定的插件或特性是否被配置禁用了，不配置默认是启用的。
  - util.isEnabled(string) : [boolean]指定的插件或特性是否被配置允许了，不配置默认是禁用的。
- soa : [Service-oriented architecture](https://en.wikipedia.org/wiki/Service-oriented_architecture)的前端对象。通过接口获取服务对象。
  - async get(serviceName) 获取服务对象(DNS liked name)。可能会涉及服务装载等动作。服务装载，根据配置，委托给kubernetes或nomad或自行实现的一个简化版(基于dockerode)。
  - has(serviceName) 指定服务是否已被注册。
  - async load(serviceName,SDL) 解析SDL定义，创建及注册serviceName。多次调用只有首次会执行真正的加载任务。
  - async defSrv(serviceName,SDL) 获取内建支持的服务，为方便当前放在pv-fastify包中，未来本接口移除，放入pv-soa包中。
  - async reg(serviceName,{inst,loader}) 内部函数，为soa注册可用服务。
- util: 工具类名称空间。目前支持如下几个函数。
  - model(base) async 扫描base下的全部js文件，将其当作objection的模型定义加载。
  - schema(base) async 扫描base下的全部json文件，将其当作schema注册进入fastify。
  - route(base) async 扫描base下的全部js文件，将其当作route注册进入fastify。
  - forwarded [fastify-forwarded](https://github.com/fastify/forwarded)，用于获取request对象中的forward ip队列。


# 服务与配置

## 配置说明
&emsp;&emsp;当前激活的配置文件存放在目录config/active/local.XXX中。运行期代码并未维护配置之间的相关性，如果某个依赖服务未配置，直接报错。在admin的UI代码中维护配置的相关性。

&emsp;&emsp;如果想禁用一个内部预置开启的服务(含fastify plugins)。按照SDL,在配置中添加服务名，并设置disable:true。按照默认开启一个服务，只需在配置文件中添加服务入口即可，例如:`cors:{}`

## 服务列表

### 伪服务
  伪服务并不提供实现.只是简单过滤.目前用于为应用提供自定义的配置.
- util: 预约名称.
- $app: 目前已经使用的内部配置名称:
  - audit 审计支持，会记录用户每次登录，修改密码的信息。
    - disabled 禁用审计。默认是false
    - max 保存的审计记录。默认是0,不限制。(TODO: 放在每日任务中执行)
    - maxTime 最长的审计记录。默认是0，不限制。值为天数。(TODO: 放在每日任务中执行)


### 默认启用

- fastify: 返回fastify对象。
  - domain: 保存了允许的domain名称，多个以空格分割。只有请求指定的domain,才会得到响应。否则会抛出bad request异常。
  - conf: 保存[fastify启动配置](https://www.fastify.io/docs/latest/Reference/Server/#factory)。如果配置了http2(注意:当前websocket实现不支持http2,因此默认未开启http2)或者空的https。则在config/active/fastify下加载https.crt或https.key。tools中提供了openssl的自签名命令行。http跳转一是借助DNS，二是借助[fastify-https-redirect](https://github.com/tomsvogel/fastify-https-redirect)。推荐使用DNS。
    - logger: logger的可配置项，参考[pino配置对象](https://github.com/pinojs/pino/blob/master/docs/api.md#options-object)。pv-fastify允许logger值为字符串，此时其指向了logger对象定义模块,空为'./logger.js',pino的log系列方法的message格式，采用%s,%d,%o占位方式，[参考其文档](https://github.com/pinojs/pino/blob/master/docs/api.md#message)。
- gql: 定义了由[mercurius](https://mercurius.dev/#/)支持的graphql服务.
  - conf: 参考[mercurius plugin-options](https://mercurius.dev/#/docs/api/options?id=plugin-options).
  - logger: 参考[mercurius-logging配置项](https://github.com/Eomm/mercurius-logging#options)了解日志记录.设置为`{disabled: true}`以禁用日志.
  - inst接口说明:
    - scanTypes: 扫描目录.加载scema
    - scanResolvers
    - scanLoaders
    - extendSchema: 接口同app.graphql.extendSchema
    - defineResolvers(resolvers)
    - defineLoaders
    - 下面是内部数据,不要直接维护,随时可能关闭:
    - schemas: Array<string>.
    - resolvers: Object.
    - loaders: Object.
- env: 定义了运行环境的框架信息。返回env对象。
  - conf
    - name: [string] 运行环境人读名称。
    - mname: [string] 运行环境机读名称——此名称也是保存配置的目录名称。
    - dev: [boolean] 是否是开发环境，以决定是否加载开发模块，有安全隐患，请不要在正式环境下设置此值。
    - locale: [string] 默认locale(`zh-CN`).在validator时用到。

    下面设置的服务，会在启动时加载。可以取代disable/enable配置方式，更集中。注意:enable/disable优先级高于这里的配置。
    - index: [string] 采用的全文索引库，设置为false以禁用全文检索。默认为elastic
    - db: [string] 采用的database,设置为false以禁用database support。默认为knex(默认postgresql,远程需要外部配置)
    - kv: [string] 采用的key-value数据库(通常也被用做缓冲或共享),设置为false以禁用。默认为redis。
    - res: [string] 存储资源的对象存储(要求支持signed url)，默认为'webapi'。设置为false禁用之。这不是webass存储服务,而是资源存储,只不过与webass一样,可以是oss(webass本地可以是nginx等任意静态web server)。本地部署的s3兼容服务器采用[zenko](https://www.zenko.io/)。如果使用[localstack](https://github.com/localstack/localstack)，需自行配置pipeline。webapi的实现基于[express-fileupload](https://github.com/richardgirges/express-fileupload)实现的signed url uploader.
    - vault: [string] 采用的敏感信息存储服务，默认为false(密码信息保存在config目录下的文件系统中)，设置为false以禁用vault服务.默认值"vault"。
    - sso: [string] 单点登录服务(Single-Sign-On)框架。目前支持passport及corsess(默认)。corsess不依赖cookie及session,依赖fastify/jwt,提供了session,但是需要访问者提供header:VID(visitId)及AUTHORIZATION(bearer XXX).
    - push: [string] 采用的双向通信(bidirectional communication)。默认为false。可以设置为[socketio](https://socket.io/)。默认使用redis adapter。
- helmet: 定义了[fastify-helmet](https://github.com/fastify/fastify-helmet)的配置。
  - conf: 定义了helment的配置项。默认内容参考[helmetjs](https://helmetjs.github.io/)
- cors: 定义了cors设置。返回插件对象。
  - conf: 参考[cors-options](https://github.com/fastify/fastify-cors#options)
- compress:
  - conf: 参考[压缩配置](https://github.com/fastify/fastify-compress#compress-options)。
- accepts: [accepts](https://github.com/fastify/fastify-accepts) : 支持与客户端的格式协商。
- knex-utils: 增加包[knext-utils](https://github.com/knex/knex-utils)用于检查连接(heartbeat)等动作。
- elastic:
  - conf: [elastic配置](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/client-configuration.html)。如果使用docker,通常桌面版的max_map_count不足，临时修改的指令:`sudo sysctl -w vm.max_map_count=262144`。长期生效，修改文件`/etc/sysctl.conf`，在其中添加`vm.max_map_count=262144`。本地环境下默认开启。
- [redis](https://redis.io/): redis兼容的内存数据库，本地环境下强制开启。
  - package: 采用的库，默认是[`ioredis`](https://github.com/luin/ioredis),设置为`redis`，则加载[node-redis](https://github.com/redis/node-redis)，两者配置略有不同。
  - conf: (https://github.com/luin/ioredis#connect-to-redis)。[node-redis配置](https://github.com/redis/node-redis/blob/master/docs/client-configuration.md)。
- [knex](https://knexjs.org/): 默认采用knex访问数据库。如果未部署数据库，默认采用[bitnami/postgresql](https://hub.docker.com/r/bitnami/postgresql)，数据存放在docker volumes:pv_postgresql_data。
  - conf: 参考[knex configuration](https://knexjs.org/guide/#configuration-options)。只有在未定义client的时候，才会触发自动部署，自动部署会忽略keycloak的配置，按照默认部署，默认部署的信息如下:
    - host: 127.0.0.1
    - port: 5432
    - user: postgres
    - database: app
    - password: 随机创建16位密码， 保存在config/active/postgres/app.passwd中。其中还保存kc.passwd是为keycloak提供的数据库及用户。由于AI不能调整基础环境(基础环境以adapter的方式提供多个)，为灵活起见，不再深度绑定keycloak，而是采用passport。如果需要集成keycloak这样的sso,暴露LDAP接口做为kc的provider来集成。
- [objection](https://vincit.github.io/objection.js/)。基于knex的ORM。需要自行录入和维护Model.扩展增加了`store`成员以保存系统有效的Model类。
- corsws: 自行实现的stateless websocket pusher.只负责建立通道．客户端通过jwt签名的topic来关注．因此，断线重连不会丢失消息,并且无需sticky.可以通过pipeline单独部署($websock)．此时需要确定两端通信握手的密钥/密码/可信IP．
  - conf: [fastify/websocket](https://github.com/websockets/ws/blob/master/doc/ws.md#new-websocketserveroptions-callback)的配置参考其依赖的ws.常用如下：
    - maxPayload 默认100MB.
    - path 默认/corsws, 修改此配置会修改默认的监听路径．
    - maxIdle 如果没有成功监听任意有效资源，最大允许的idle时间，超时会被强制关闭．默认0ms,意味着必须带有有效的authorization header(Live Token),否则会被关闭链接．
- corsess: 自行实现的不依赖cookie,采用jwt的session.参考了[@fastify/session](https://github.com/fastify/session)的代码.为了保持兼容，采用相似接口，并在onRquest时构建session,在onSend时检查更新(并设置set-token header):
  - API(内部使用，请直接使用request.session) :
    - verify(request):void 检查request的jwt token．并加载对应的session.如果jwt任意异常，则抛出异常．
    - ensure(request):void  如果无法加载sess,则创建一个新的sess,如果检查到token,但是token不合法，会新建token.
    - token(request,replay,ttl=1day): string|null 刷新当前session的token(主要是刷新ttl).返回结果需要调用者传递给客户端.如未初始化,会自动调用ensure(false).如果reply不为空，会设置set-token header.
    预订在preHandle中调用:
    - async chkAuth(req,res): 确保用户已登录,否则抛出异常
    - getAclChker(roleName,op,resourceName):(req,res)=>Promise  基于[accesscontrol](https://github.com/onury/accesscontrol)实现)(尚未实现,貌似也不需要,有roleAcl就应该足够)
    - getRoleChker(string|array<string>,opOR = true)(req,res)=>Promise  确保用户已登录,并且拥有指定角色集
  - conf: 配置项,其配置内容参考[@fastify/jwt](https://github.com/fastify/fastify-jwt#usage),默认不响应cookie,可以在配置添加cookie以响应和处理cookie．
    下方几个配置项被内部重置，因此无效：
    - decoratorName： 被强制设置为'session'
    - formatUser: 内部用来管理session.
    - trusted: 内部用来从store中获取session数据．
  - session: 为session增加的配置项:
    - ttl: session的持续时间.其格式为JSON Object,参考[moment add](https://momentjs.com/docs/#/manipulating/add/)．默认为{days: 1}，如果是数字，则为秒数．
    - strict: 严格模式(默认关:false)．当处于严格模式下，如果调用者未提供vid header.则自动限制此token下次必须从相同ip访问,否则不提供vid时，创建的token无任何限制．

### 开发环境下默认启用(其它环境需配置后启用)
- swagger: 监测系统注册全部route,并产生swagger api文档.
  - conf: 参考[fastify-swagger的配置项](https://github.com/fastify/fastify-swagger#register-options)
- swaggerui: 根据swagger的结果创建ui界面,如果swagger被禁用,此模块无法启用.
  - conf: 参考[swagger-ui的配置项](https://github.com/fastify/fastify-swagger-ui#options)

### 默认关闭
- [passport](https://www.passportjs.org/): passport登录支持。采用[fastify-passport](https://github.com/fastify/fastify-passport),并内建支持了一些Strategy，可以直接配置使用。
  - strategies passport的策略配置。
    - local prodvest实现的local配置。
      - keep 指定保持登录状态的时长，默认一年。
      - defaultName 无法获取显示名称时，给出默认的显示名称。
      - pwdRE 允许用户名密码登录的用户名正则。默认为'.*',全部允许。设置为''禁止用户名密码登录。
      - loginDev 允许同时登入的设备数。默认是0,不限制。数字表示允许的数量,超出数量按照MLR(暂未支持)
- oss: 对象存储服务。
  - package: 默认为`aws-sdk`,表示采用s3兼容的oss。
  - conf 保存了aws-s3的`AWS.config.update`参数.
    - accessKeyId: 默认为cloudserver在`/usr/src/app/conf/authdata.json`配置的`lifecycleKey1`
    - secretAccessKey: 其对应的`lifecycleSecretKey1`。
    - endpoint: 默认为`localhost:8000`
    - region: 默认为cloudserver在`/usr/src/app/locationConfig.json`配置的`us-east-1`
    - sslEnabled: 默认为false，如果需要启用ssl,需要在nodes/services.json中设置启用后，这里才可以修改为true。
    - s3ForcePathStyle: 默认为true，可以通过访问时添加host来将某个bucket设置为webroot。
  - bucket: 初始的bucket信息。其值为[createBucket](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#createBucket-property)的参数。
    - Bucket: 默认default。
    - ACL: 默认为'public-read'。
- [formbody](https://github.com/fastify/fastify-formbody)，增加对`application/x-www-form-urlencoded`上传格式的支持。
  - conf: [formbody options](https://github.com/fastify/fastify-formbody#options)。如果不配置parser,默认引入qs来支持嵌套parser。
- [multipart](https://github.com/fastify/fastify-multipart),增加对`formdata/multipart`支持，以支持文件上传。
  - conf: 支持的有效配置参考[源码](https://github.com/fastify/fastify-multipart/blob/master/index.js),摘录如下:
    - addToBody boolean 默认为false。是否将上传的值，添加到req.body上。这可以方便使用[fastify的schema验证](https://www.fastify.io/docs/latest/Reference/Validation-and-Serialization/)
    - attachFieldsToBody boolean|string 默认false，将指定名称的field添加到body上。
    - sharedSchemaId 只有addToBody或attachFieldsToBody有非空值才有效。会定义一个此名称的schema,在后续自身的验证schema中可以引用。
    - limits: // 设置上传限制。查看[busboy配置](https://github.com/fastify/busboy#busboy-methods)
      - fieldNameSize: default 100, // Max field name size in bytes
      - fieldSize: 1M(1024 x 1024),     // Max field value size in bytes
      - fields: Infinity,    // Max number of non-file fields
      - fileSize: Infinity,  // For multipart forms, the max file size in bytes
      - files: Infinity,           // Max number of file fields
      - parts: Infinity,  // For multipart forms, the max number of parts (fields + files).
      - headerPairs: 2000   // Max number of header key=>value pairs
      - headerSize: 81920   // For multipart forms, the max size of a multipart header
- cookie: [fastify-cookie](https://github.com/fastify/fastify-cookie),提供了cookie支持。启用是因为被session依赖。
  - conf: [有效的配置](https://github.com/fastify/fastify-cookie#options)
- session: [fastify-session](https://github.com/fastify/session)，如果未配置store，根据env中的share来决定。
  - conf: [有效配置](https://github.com/fastify/session#options)。
    - store: 默认store采用了[connect-redis](https://github.com/tj/connect-redis)。因此store中的配置项依赖connect-redis。
- rate-limit:
  - conf: 参考[限速配置](https://github.com/fastify/fastify-rate-limit#options)了解这里允许的内容。对全局或指定请求限速。
- static:
  - conf: 参考[静态资源](https://github.com/fastify/fastify-static#options)配置项。在本地环境下默认开启。
- docker:
  - conf: 参考[使用dockerode](https://github.com/apocas/dockerode#usage)了解允许的配置项。
- docker-modem:
  - conf: 参考[使用docker-modem](https://github.com/apocas/docker-modem#getting-started)
- vault :
  - issue: HashiCorp || 'local' : 默认为local,local当前只支持read方法，根据名称，从对应文件系统中获取。
  - conf: [node-vault配置项](https://github.com/nodevault/node-vault#init-and-unseal)。
- [zinc](https://zincsearch.com/): 使用zinsearch执行全文检索。
- keycloak： [keycloak-adapter](https://github.com/yubinTW/fastify-keycloak-adapter)提供了keycloak,我们将keycloak-adapter实现为服务，默认热部署[bitnami/keycloak](https://hub.docker.com/r/bitnami/keycloak)。部署时采用pg中的keycloak数据库，数据库密码保存在postgres/kc.passwd。kc的超级用户(admin)密码保存在keycloak/admin.passwd;管理员(manage)密码保存在keycloak/manage.passwd中。默认创建app realm。keycloak返回的是[KcAdminClient](https://github.com/keycloak/keycloak-nodejs-admin-client)实例对象，已通过验证。并且[fastify-keycloak-adapter](https://github.com/yubinTW/fastify-keycloak-adapter)已设置好。palidation已监听。
  - proxy: [string] 将keycloak映射到主站点的目录下,默认kc子目录。给出false禁用这一特性。如果是对象，则为[fastify-http-proxy配置](https://github.com/fastify/fastify-http-proxy#options)
  - conf: [服务器信息](https://github.com/keycloak/keycloak-nodejs-admin-client#usage)。
  - adapter: [fastify-keycloak-adapter](https://github.com/yubinTW/fastify-keycloak-adapter)的配置信息。如果未提供，所需realm为app,clientid为`fastify-server`(内部id保存在keycloak/server.id)。所需clientSecret保存在keycloak/server.cert。
- [socketio](https://socket.io/)。
  - conf: [socket.io server options](https://socket.io/docs/v4/server-options/)。
  - adapter: 采用socket.io在服务器初始化之后，通过`io.adapter`来设置adapter。
- [libp2p](https://libp2p.io/)支持。在服务器端使用[js-libp2p](https://github.com/libp2p/js-libp2p)启动一个固定node,方便客户端bootstrap，通常用于支持视频p2p通话。这是从[js-libp2p-webrtc-star](https://github.com/libp2p/js-libp2p-webrtc-star)改写的，原生利用hapi及socketio。
- [mindsdb](https://github.com/mindsdb/mindsdb_js_sdk)。通过[mindsdb](https://github.com/mindsdb/mindsdb)来支持基于数据库数据集的训练与预测。需启动mindsdb服务器(cpu/gpu计算密集型)。
- [bree](https://github.com/breejs/bree)。本地任务子系统支持。
  - conf: [fastify-bree配置](https://github.com/climba03003/fastify-bree#optionscustomoptions)。
    - customOptions: [bree配置](https://github.com/breejs/bree#instance-options)。
- [any-schema](https://github.com/fastify/any-schema-you-like)
  - path: 指定需要require的文件，暴露一个函数，调用之得到schemas数组。参考[any-schema使用](https://github.com/fastify/any-schema-you-like#usage)
  - conf: 预定义的schema，会与path中的schema合并。
- circuit-breaker: 返回插件对象。(尚未修正:断路器与swagger插件冲突,启用swagger后.运行报错.)
  - conf: 定义了断路器，通常由AI维护。参考[circuit-breaker options](https://github.com/fastify/fastify-circuit-breaker#options)
