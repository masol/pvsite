#!/usr/bin/env bash
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
clear

red='\033[0;31m'
green='\033[0;32m'
yellow='\033[0;33m'
plain='\033[0m'

# check os
if [[ -f /etc/redhat-release ]]; then
    release="centos"
elif cat /etc/issue | grep -Eqi "debian"; then
    release="debian"
elif cat /etc/issue | grep -Eqi "ubuntu"; then
    release="ubuntu"
elif cat /etc/issue | grep -Eqi "centos|red hat|redhat"; then
    release="centos"
elif cat /proc/version | grep -Eqi "debian"; then
    release="debian"
elif cat /proc/version | grep -Eqi "ubuntu"; then
    release="ubuntu"
elif cat /proc/version | grep -Eqi "centos|red hat|redhat"; then
    release="centos"
else
    echo -e "${red}未检测到系统版本，请联系脚本作者！${plain}\n" && exit 1
fi

os_version=""

# os version
if [[ -f /etc/os-release ]]; then
    os_version=$(awk -F'[= ."]' '/VERSION_ID/{print $3}' /etc/os-release)
fi
if [[ -z "$os_version" && -f /etc/lsb-release ]]; then
    os_version=$(awk -F'[= ."]+' '/DISTRIB_RELEASE/{print $2}' /etc/lsb-release)
fi

#检查系统
if [[ x"${release}" == x"centos" ]]; then
    echo -e "${red}本脚本不支持CentOS操作系统${plain}\n"
    exit 1
elif [[ x"${release}" == x"ubuntu" ]]; then
    if [[ ${os_version} -lt 20 ]]; then
        echo -e "${red}请使用 Ubuntu 20 或更高版本的系统${plain}\n"
        exit 1
    fi
elif [[ x"${release}" == x"debian" ]]; then
    echo -e "${red}本脚本不支持Debian操作系统${plain}\n"
    exit 1
fi

echo -e "${yellow}请输入当前用户的开机密码：${plain}"
read inputpass
printf "\n"  #换行

echo -e "${green}即将开始安装，取消请按Ctrl+C${plain}"
countdown=10
while [ $countdown -gt 0 ]
do
   echo -ne ${yellow}${countdown}${plain}
   (( countdown-- ))
   sleep 1
   echo -ne "\r   \r"
done

#安装依赖
echo -e "${yellow}开始安装依赖软件包${plain}"
echo ${inputpass} | sudo -S apt update
echo ${inputpass} | sudo -S apt install wget curl git vim make g++ libssl-dev apt-transport-https ca-certificates gnupg-agent software-properties-common -y
if [ $? -eq 0 ]; then
    echo -e "${green}依赖软件包安装完成${plain}"
else
    echo -e "${red}依赖软件包安装失败，请检查apt${plain}"
    exit 1
fi

#安装nvm
echo -e "${yellow}开始检查NVM${plain}"
if [ -e "$HOME/.nvm/nvm.sh" ]; then
    NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
    echo -e "${green}NVM已经安装${plain}"
else
    echo -e "${yellow}开始安装NVM${plain}"
    NVM_DIR="$HOME/.nvm"
    git clone https://ghproxy.com/https://github.com/nvm-sh/nvm.git "$NVM_DIR"
    cd "$NVM_DIR"
    git checkout `git describe --abbrev=0 --tags --match "v[0-9]*" $(git rev-list --tags --max-count=1)`
    command printf '\nexport NVM_DIR="$HOME/.nvm"\n' >> $HOME/.bashrc
    command printf '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"\n' >> $HOME/.bashrc
    command printf '[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"\n' >> $HOME/.bashrc
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
    nvm -v >/dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo -e "${green}NVM安装完成${plain}"
    else
        echo -e "${red}安装NVM失败，请检查${plain}"
        exit 1
    fi
fi

#安装node
echo -e "${yellow}开始检查Node${plain}"
if [ -e "$NVM_DIR/versions/node/" ]; then
    echo -e "${green}Node已经安装${plain}"
else
    echo -e "${yellow}开始安装Node${plain}"
    NVM_NODEJS_ORG_MIRROR=https://npmmirror.com/mirrors/node
    nvm install --lts
    $NVM_DIR/versions/node/$(nvm version)/bin/node -v >/dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo ${inputpass} | sudo -S ln -s "$NVM_DIR/versions/node/$(nvm version)/bin/node" "/usr/local/bin/node"
        echo ${inputpass} | sudo -S ln -s "$NVM_DIR/versions/node/$(nvm version)/bin/npm" "/usr/local/bin/npm"
        npm config set registry https://registry.npmmirror.com
        echo -e "${green}Node安装完成${plain}"
    else
        echo -e "${red}安装Node失败，请检查${plain}"
        exit 1
    fi
fi

#安装gulp
echo -e "${yellow}开始检查Gulp${plain}"
if [ -e "$NVM_DIR/versions/node/$(nvm version)/bin/gulp" ]; then
    echo -e "${green}Gulp已经安装${plain}"
else
    echo -e "${yellow}开始安装Gulp${plain}"
    echo ${inputpass} | sudo -S npm install -g gulp-cli
    gulp -v >/dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo -e "${green}Gulp安装完成${plain}"
    else
        echo -e "${red}安装Gulp失败，请检查${plain}"
        exit 1
    fi
fi

#安装yarn
echo -e "${yellow}开始检查Yarn${plain}"
if [ -e "$NVM_DIR/versions/node/$(nvm version)/bin/yarn" ]; then
    echo -e "${green}Yarn已经安装${plain}"
else
    echo -e "${yellow}开始安装Yarn${plain}"
    echo ${inputpass} | sudo -S npm install -g yarn
    yarn config set registry https://registry.npmmirror.com
    yarn -v >/dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo -e "${green}Yarn安装完成${plain}"
    else
        echo -e "${red}安装Yarn失败，请检查${plain}"
        exit 1
    fi
fi

#安装docker
echo -e "${yellow}开始检查Docker${plain}"
if [ -e "/usr/bin/docker" ]; then
    echo -e "${green}Docker已经安装${plain}"
else
    echo -e "${yellow}开始安装Docker${plain}"
    wget -N --no-check-certificate -O /tmp/gpg https://download.docker.com/linux/ubuntu/gpg
    echo ${inputpass} | sudo -S apt-key add /tmp/gpg
    rm -f /tmp/gpg
    echo ${inputpass} | sudo -S add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
    echo ${inputpass} | sudo -S apt update
    echo ${inputpass} | sudo -S apt install docker-ce docker-ce-cli containerd.io -y
    echo ${inputpass} | sudo -S systemctl enable docker --now
    docker -v >/dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo ${inputpass} | sudo -S groupadd docker
        echo ${inputpass} | sudo -S usermod -aG docker $USER
        echo -e "${green}Docker安装完成${plain}"
        echo -e "${yellow}刷新docker组更改需要注销并重新登录${plain}"
    else
        echo -e "${red}安装Docker失败，请检查${plain}"
        exit 1
    fi
fi
#安装docker-compose
echo -e "${yellow}开始检查Docker-compose${plain}"
if [ -e "/usr/local/bin/docker-compose" ]; then
    echo -e "${green}Docker-compose已经安装${plain}"
else
    echo -e "${yellow}开始安装Docker-compose${plain}"
    echo ${inputpass} | sudo -S curl -L "https://ghproxy.com/https://github.com/docker/compose/releases/download/v2.12.2/docker-compose-linux-x86_64" -o /usr/local/bin/docker-compose
    echo ${inputpass} | sudo -S chmod +x /usr/local/bin/docker-compose
    docker-compose -v >/dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo -e "${green}Docker-compose安装完成${plain}"
    else
        echo -e "${red}安装Docker-compose失败，请检查${plain}"
        exit 1
    fi
fi

#创建开发目录
echo -e "${yellow}开始检查开发目录${plain}"
if [ -e "$HOME/source/pvsite" ]; then
    echo -e "${green}开发目录已经创建${plain}"
else
    echo -e "${yellow}开始创建开发目录${plain}"
    [ -e $HOME/source ] || mkdir -p $HOME/source
    cd $HOME/source
    git clone https://gitlab.wware.org/pub/pipeline.git
    cd $HOME/source/pipeline/ && yarn install && yarn link
    cd $HOME/source
    git clone https://gitlab.wware.org/pub/pvsite.git
    cd $HOME/source/pvsite/ && yarn install
    cd $HOME/source/pvsite/node_modules/node-pty && yarn install
    cd $HOME/source/pvsite/
    yarn link "@masol/pipeline"
    [ -e $HOME/source/pvsite/config/dev ] || mkdir -p $HOME/source/pvsite/config/dev
    [ -e $HOME/source/pvsite/config/active ] || ln -s $HOME/source/pvsite/config/dev $HOME/source/pvsite/config/active
    newgrp docker << END
    gulp deploy
END
    echo -e "${green}开发目录创建完成${plain}"
fi

#检查环境状态
echo -e "${yellow}开始检查环境构建状态${plain}"
cd $HOME/source/pvsite/
    newgrp docker << END
    gulp status
END
echo -e "${yellow}docker用户组有变更，需要注销并重新登录生效${plain}"
echo -e "${green}环境构建执行完成，如有问题请根据提示检查${plain}"
