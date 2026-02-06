# 房源展示平台

一个现代化的房源展示和管理平台，提供房源浏览、用户认证、房东管理等功能。

## 功能特性

### 用户端
- 房源列表展示
- 房源详情查看
- 地图定位展示
- 实名认证
- 联系房东
- 分享房源

### 房东端
- 房源管理（增删改查）
- 账号设置
- 二维码配置
- 用户管理
- 聊天消息管理

## 技术栈

### 前端
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Material Symbols

### 后端
- Node.js
- Express.js
- MongoDB
- Mongoose

## 快速开始

### 环境要求
- Node.js 18+
- MongoDB 6.0+

### 安装依赖

```bash
npm install
```

### 配置环境变量

在 `backend/.env` 文件中配置：

```env
PORT=3002
MONGODB_URI=mongodb://localhost:27017/renthouse
NODE_ENV=development
```

### 启动数据库

确保MongoDB服务正在运行：

```bash
# Windows
net start MongoDB

# Linux/Mac
sudo systemctl start mongod
```

### 初始化数据

```bash
cd backend
node initData.js
```

### 启动开发服务器

```bash
# 启动后端
cd backend
node index.js

# 启动前端（新终端）
npm run dev
```

访问 http://localhost:3000 查看应用

## 项目结构

```
├── backend/                 # 后端代码
│   ├── config/            # 配置文件
│   ├── controllers/       # 控制器
│   ├── models/          # 数据模型
│   ├── routes/          # 路由
│   └── index.js        # 入口文件
├── components/          # React组件
├── public/            # 静态资源
├── src/              # 源代码
│   ├── assets/       # 资源文件
│   └── services/    # API服务
├── App.tsx          # 主应用
└── index.tsx        # 入口文件
```

## API接口

### 房源相关
- `GET /api/properties` - 获取所有房源
- `GET /api/properties/:id` - 获取单个房源
- `POST /api/properties` - 添加房源
- `PUT /api/properties/:id` - 更新房源
- `DELETE /api/properties/:id` - 删除房源

### 用户相关
- `GET /api/users` - 获取所有用户
- `POST /api/users` - 添加用户
- `POST /api/users/auth` - 实名认证

### 聊天相关
- `GET /api/chat` - 获取聊天消息
- `POST /api/chat` - 发送消息
- `PUT /api/chat/:id/read` - 标记已读

### 房东相关
- `GET /api/landlord/config` - 获取房东配置
- `PUT /api/landlord/config` - 更新房东配置
- `POST /api/landlord/login` - 房东登录

## 默认账号

### 房东账号
- 密码：`123456`

## 许可证

MIT License
