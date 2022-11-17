<h1>开发环境安装</h1> 

<h1>目录</h1>

- [使用说明](#使用说明)
- [Linux安装开发环境](#linux安装开发环境)
    - [Linux安装开发环境依赖](#linux安装开发环境依赖)
    - [Linux测试开发环境](#linux测试开发环境)
    - [Linux安装开发环境过程可能存在的报错信息](#linux安装开发环境过程可能存在的报错信息)
- [Windows安装开发环境](#windows安装开发环境)
- [Mac OS安装开发环境](#mac-os安装开发环境)



# 使用说明

   &emsp;&emsp;我们目前的运行环境只支持Linux环境及其衍生版，不假定您使用的是Windows服务器，如果您使用了Windows服务器，pipeline的功能不支持，你只能手动安装修改，而本地开发环境支持主流操作系统，开发环境为了简化环境依赖，用docker给你安装依赖环境，用pipeline工具查看的时候，以`$`美元符号为开头的，是你这个项目本身生成的服务，例如`$webapi`, 开发完成之后最后是一个进程，和别的服务并无区别，就等于开发了一个别的服务，只不过你依赖了别的服务，比如你依赖了redis数据库，但是你本身也是个服务，由于在开发环境下， 你的要求是你马上一个改动，马上就能看到结果。

   &emsp;&emsp;所以在开发环境下，只给你部署了依赖环境，然后有一个模拟环境，确保让你一改动马上实时更新，所以在开发环境下，`gulp`执行完之后，你要启动你自身开发的服务，比如你要启动你的客户端页面，就要在客户端页面的项目下执行 `npm run dev`
   
   &emsp;&emsp;如果你要测试你的API，也是执行 `npm run dev`，命令都是一样的，执行的目录不一样，而你测试出来的结果，最后开发部署。

# Linux安装开发环境 

（***说明：ubuntu最低版本要求20.4***）

### Linux安装开发环境依赖

1. 安装 `node`
 
    使用命令行安装依次执行 

    安装依赖软件 `sudo apt install curl git vim make g++ -y`
    
    安装nvm `curl -o- https://ghproxy.com/https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash`

    安装node最新版本 `nvm install --lts`

    切换npm源为国内源 `npm config set registry https://registry.npmmirror.com`
 
    测试node是否安装

    打开终端(快捷键ctrl+alt+T)，分别输入下面两个命令：

    > node -v 

    > npm -v

    如果均正确输出版本号，则证明node已安装；


2. 安装 `gulp`

   使用命令安装gulp `sudo npm install -g gulp-cli` 
   
   测试gulp是否安装

    打开终端(快捷键ctrl+alt+T)，分别输入下面的命令：
    
   > gulp -v

   如果均正确输出版本号，则证明gulp已安装；


3. 安装 `Yarn`

    导入软件源的 GPG key 并且添加 Yarn APT 软件源到你的系统，运行下面的命令：

    `curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -`

    `echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list`

    一旦软件源被启用，升级软件包列表，并且安装 Yarn

    `sudo apt update`

    `sudo apt install yarn`

    上面的命令同时会安装 Node.js。如果你已经通过 nvm 安装了 Node，跳过 Node.js 安装过程：

    `sudo apt install --no-install-recommends yarn`

    测试Yarn是否安装

     > yarn -v

     如果均正确输出版本号，则证明yarn已安装；

4. 安装 `docker`

   使用命令安装依次docker 
   安装依赖软件 `sudo apt install apt-transport-https ca-certificates curl gnupg-agent software-properties-common`

   添加软件源的GPG秘钥 `curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -`

   添加docker软件源 `sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"`

   更新apt软件包缓存 `sudo apt update`

   安装docker `sudo apt install docker-ce docker-ce-cli containerd.io`

   安装 `docker-compose`

   下载安装包 `sudo curl -L "https://ghproxy.com/https://github.com/docker/compose/releases/download/2.12.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose`

   添加执行权限 `sudo chmod +x /usr/local/bin/docker-compose`

   添加docker组 `sudo groupadd docker`

   将当前用户加入docker组 `sudo usermod -aG docker $USER`

   激活对docker组的更改 `sudo newgrp docker`

   测试docker是否安装
   
   打开终端(快捷键ctrl+alt+T)，分别输入下面的命令：

   > docker -v

   > docker-compose -v

   如果均正确输出版本号，则证明docker已安装；


5. 安装vagrant (根据需求如果想测试集群，并且没有多台服务器，需要安装vagrant，创建多个虚拟机来模拟集群环境)
   
   使用命令依次安装 

   安装 `virtualbox`依赖

   安装虚拟机 执行命令 `sudo apt install virtualbox -y`

   添加GPG秘钥 `wget -O- https://apt.releases.hashicorp.com/gpg | gpg --dearmor | sudo tee /usr/share/keyrings/hashicorp-archive-keyring.gpg`

   添加vagrant软件源 `echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list`

   更新缓存并安装vagrant `sudo apt update && sudo apt install vagrant`


### Linux测试开发环境

1. 克隆 `pvsite`文件
   
   执行 `git clone https://gitlab.wware.org/pub/pvsite.git`

   安装pvsite的依赖模块 `cd ~/pvsite/ && yarn install`

   安装node-pty的依赖模块 `cd node_modules/node-pty && npm install`

   克隆 `pipeline`文件

   `git clone https://gitlab.wware.org/pub/pipeline.git`

   安装pipeline的依赖模块并映射模块 `cd ~/pipeline/ && yarn install && yarn link pipeline`

   **注意：** yarn link 作用是在开发过程中，pipeline包和项目pvsite相互依赖，可以将pipeline链接到pvsite项目中。

   例如：我们在开发项目 `pvsite` 时需要使用本地开发的另外一个包 `pipeline`时，首先进入pipeline目录下，执行 `yarn link`,意思是在公共包管理路径`/usr/local/lib/node_modules/`连接了本地的 `pipeline`包。

   然后在进入到 pvsite目录下，执行 `yarn link pipeline`，它就会去`/usr/local/lib/node_modules/`这个路径下寻找是否有这个包，如果有就建立软链接，直接在 pvsite项目中使用 pipeline包。

   此时，我们在`pipeline`包做任何修改，都可以及时的更新到`pvsite`项目中。不需要在一遍一遍的发布pipeline包了，通常我们会在开发阶段会用到，在正式项目中只需要发布最后一个pipeline版本即可。

2. 在pvdev下的cluster目录里新建test3目录下启用集群所使用的服务器，test3文件下执行， `vagrant up`

3. 在pvsite文件下运行 `gulp status -t test3` 查看集群状态报告
   
   ![集群状态报告](../image/test3.png)

4. 在pvsite文件下运行 `gulp deploy -t test3` 部署集群节点

   ![部署集群节点](../image/gulpdeploy1.png)


### Linux安装开发环境过程可能存在的报错信息


1. 报错 Version in "/home/wware/pvsite/config/dev/docker-compose.yml" is unsupported. You might be seeing this error because you're using the wrong Compose file version. Either specify a supported version (e.g "2.2" or "3.3") and place your service definitions under the `services` key, or omit the `version` key and place your service definitions at the root of the file to use version 1.
For more on the Compose file format versions, see https://docs.docker.com/compose/compose-file/
    
   解决：升级 `docker-compose`

2. 报错 Couldn't connect to Docker daemon at http+docker://localhost - is it running?
If it's at a non-standard location, specify the URL with the DOCKER_HOST environment variable.

   解决：`docker-compose`
   
   执行命令 `sudo curl -L "https://ghproxy.com/https://github.com/docker/compose/releases/download/2.12.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose`

   `sudo chmod +x /usr/local/bin/docker-compose`

3. 报错 permission denied while trying to connect to the Docker daemon socket at unix:///var/run/docker.sock: Get "http://%2Fvar%2Frun%2Fdocker.sock/v1.24/containers/json?all=1&filters=%7B%22label%22%3A%7B%22com.docker.compose.project%3Dlocalterra%22%3Atrue%7D%7D&limit=0": dial unix /var/run/docker.sock: connect: permission denied

   解决： `sudo groupadd docker`

    `sudo usermod -aG docker $USER`

    `sudo newgrp docker`

# Windows安装开发环境

文档正在完善

# Mac OS安装开发环境

文档正在完善