// ============================================
// 我的第一个 API - Express 入门示例
// 作者：API 学习者
// 功能：用户管理 CRUD 接口
// ============================================

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3100;

// ========== 中间件 ==========
// 让 Express 能读取 JSON 格式的请求体
app.use(express.json());

// 打印每次请求日志（方便调试）
app.use((req, res, next) => {
  const time = new Date().toLocaleTimeString('zh-CN');
  console.log(`[${time}] ${req.method} ${req.url}`);
  next(); // 继续处理请求
});


// ========== 模拟数据库 ==========
// 真实项目会连接 MySQL/MongoDB，这里用数组代替
let users = [
  { id: 1, name: '张三', email: 'zhangsan@example.com', age: 25, role: 'admin' },
  { id: 2, name: '李四', email: 'lisi@example.com',     age: 30, role: 'user'  },
  { id: 3, name: '王五', email: 'wangwu@example.com',   age: 22, role: 'user'  },
];

// 自增ID计数器
let nextId = 4;


// ========== 工具函数 ==========
// 成功响应统一格式
const success = (res, data, message = '操作成功', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

// 错误响应统一格式
const error = (res, message, code = 'ERROR', statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    error: { code, message },
  });
};


// ========== API 接口 ==========

// ✅ 根路径：欢迎信息
app.get('/', (req, res) => {
  res.json({
    message: '🎉 恭喜！你的第一个 API 正在运行！',
    version: '1.0.0',
    endpoints: {
      '获取用户列表': 'GET    /api/users',
      '获取单个用户': 'GET    /api/users/:id',
      '创建新用户':   'POST   /api/users',
      '更新用户':     'PUT    /api/users/:id',
      '删除用户':     'DELETE /api/users/:id',
    },
  });
});


// ✅ 1. 获取用户列表
// 请求：GET /api/users
// 支持查询参数：?role=admin 筛选角色
app.get('/api/users', (req, res) => {
  let result = [...users];

  // 支持按 role 筛选
  if (req.query.role) {
    result = result.filter(u => u.role === req.query.role);
  }

  return success(res, result, `共找到 ${result.length} 个用户`);
});


// ✅ 2. 获取单个用户
// 请求：GET /api/users/1
app.get('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id); // URL 里的 :id 是字符串，需转为数字
  const user = users.find(u => u.id === id);

  if (!user) {
    return error(res, `用户 ID=${id} 不存在`, 'NOT_FOUND', 404);
  }

  return success(res, user);
});


// ✅ 3. 创建新用户
// 请求：POST /api/users
// 请求体：{ "name": "赵六", "email": "xxx@xx.com", "age": 28 }
app.post('/api/users', (req, res) => {
  const { name, email, age } = req.body;

  // 数据验证
  if (!name || !email) {
    return error(res, 'name 和 email 是必填字段', 'VALIDATION_ERROR', 422);
  }

  // 检查邮箱是否已存在
  const exists = users.find(u => u.email === email);
  if (exists) {
    return error(res, '该邮箱已被注册', 'EMAIL_EXISTS', 422);
  }

  // 创建新用户对象
  const newUser = {
    id: nextId++,
    name,
    email,
    age: age || null,
    role: 'user', // 默认角色
  };

  users.push(newUser);
  return success(res, newUser, '用户创建成功', 201); // 201 = Created
});


// ✅ 4. 更新用户
// 请求：PUT /api/users/1
// 请求体：{ "name": "新名字", "age": 26 }
app.put('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = users.findIndex(u => u.id === id);

  if (index === -1) {
    return error(res, `用户 ID=${id} 不存在`, 'NOT_FOUND', 404);
  }

  // 只更新传入的字段，不覆盖未传入的字段
  users[index] = { ...users[index], ...req.body, id }; // id 不允许修改

  return success(res, users[index], '用户更新成功');
});


// ✅ 5. 删除用户
// 请求：DELETE /api/users/1
app.delete('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = users.findIndex(u => u.id === id);

  if (index === -1) {
    return error(res, `用户 ID=${id} 不存在`, 'NOT_FOUND', 404);
  }

  const deleted = users.splice(index, 1)[0]; // 删除并返回被删用户
  return success(res, deleted, '用户已删除');
});


// ========== 错误处理中间件 ==========
// 处理所有未匹配的路由
app.use((req, res) => {
  return error(res, `路由 ${req.url} 不存在`, 'ROUTE_NOT_FOUND', 404);
});

// 处理服务器内部错误
app.use((err, req, res, next) => {
  console.error('服务器错误:', err.message);
  return error(res, '服务器内部错误', 'INTERNAL_ERROR', 500);
});


// ========== 启动服务器 ==========
app.listen(PORT, () => {
  console.log('');
  console.log('✅ API 服务器启动成功！');
  console.log(`📡 访问地址：http://localhost:${PORT}`);
  console.log('');
  console.log('📋 可用接口：');
  console.log(`   GET    http://localhost:${PORT}/api/users`);
  console.log(`   GET    http://localhost:${PORT}/api/users/1`);
  console.log(`   POST   http://localhost:${PORT}/api/users`);
  console.log(`   PUT    http://localhost:${PORT}/api/users/1`);
  console.log(`   DELETE http://localhost:${PORT}/api/users/1`);
  console.log('');
});
