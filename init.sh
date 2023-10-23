#!/bin/bash

# 定义文件和URL
files=(
"./source/static/stackpath.bootstrapcdn.com_bootstrap_4.5.2_css_bootstrap.min.css"
"./source/static/code.jquery.com_jquery-3.5.1.min.js"
"./source/static/bootstrap.min.js"
)
urls=(
"https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"
"https://code.jquery.com/jquery-3.5.1.min.js"
"https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"
)

# 遍历文件和URL数组
for ((i=0; i<${#files[@]}; i++)); do
    file="${files[i]}"
    url="${urls[i]}"
    
    # 检查文件是否存在
    if [ ! -f "$file" ]; then
        echo "文件 '$file' 不存在，将从 '$url' 下载。"
        # 使用curl下载文件，你也可以使用wget或其他下载工具
        curl -o "$file" "$url"
        
        # 检查下载是否成功
        if [ $? -eq 0 ]; then
            echo "文件 '$file' 下载成功。"
        else
            echo "文件 '$file' 下载失败。"
        fi
    else
        echo "文件 '$file' 已存在，不需要下载。"
    fi
done

# 创建和激活conda环境
conda_env_name="flaskweb"

if conda env list | grep -q "$conda_env_name"; then
    echo "Conda环境 '$conda_env_name' 已存在，跳过创建。"
else
    echo "创建Conda环境 '$conda_env_name'。"
    conda create -n "$conda_env_name" python=3.8
fi

echo "激活Conda环境 '$conda_env_name'。"
conda activate "$conda_env_name"

# 使用pip安装依赖项
echo "使用pip安装依赖项..."
pip install -r requirements.txt

echo "项目部署完成。"
