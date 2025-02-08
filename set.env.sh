#!/bin/sh

# 设置环境变量
PRIVATE=${PRIVATE:-""}
API_URL=${API_URL:-""}
DOC_URL=${DOC_URL:-""}

# 创建public/js目录
mkdir -p /var/www/html

# 写入env.js文件
cat > /var/www/html/env.js << EOF
(function () {
  if (typeof window === "object") {
    var envObj = {};
    Object.defineProperty(envObj, "PRIVATE", { value: "$PRIVATE", writable: false, configurable: false });
    Object.defineProperty(envObj, "API_URL", { value: "$API_URL", writable: false, configurable: false });
    Object.defineProperty(envObj, "DOC_URL", { value: "$DOC_URL", writable: false, configurable: false });
    Object.defineProperty(window, "_env_host", { value: envObj, writable: true, configurable: false });
  }
})()
EOF

# 输出结果
echo "set-env success"
echo "PRIVATE: $PRIVATE"
echo "API_URL: $API_URL"
echo "DOC_URL: $DOC_URL"
