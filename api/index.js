// ============================================
// 我的第一个 API - Express 入门示例
// 作者：ASD5222
// 功能：用户管理 CRUD 接口
// 部署：Vercel
// ============================================

const express = require('express');
const app = express();

// ========== 中间件 ==========
app.use(express.json());

// 打印请求日志
app.use((req, res, next) => {
  const time = new Date().toISOString();
  console.log(`[${time}] ${req.method} ${req.url}`);
  next();
});


// ========== 模拟数据库 ==========
let users = [
  { id: 1, name: '张三', email: 'zhangsan@example.com', age: 25, role: 'admin' },
  { id: 2, name: '李四', email: 'lisi@example.com',     age: 30, role: 'user'  },
  { id: 3, name: '王五', email: 'wangwu@example.com',   age: 22, role: 'user'  },
];
let nextId = 4;


// ========== 工具函数 ==========
const success = (res, data, message = '操作成功', statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data });
};

const error = (res, message, code = 'ERROR', statusCode = 400) => {
  return res.status(statusCode).json({ success: false, error: { code, message } });
};


// ========== API 接口 ==========

// ✅ 根路径
app.get('/', (req, res) => {
  res.json({
    message: '🎉 我的第一个 API 正在运行！',
    version: '1.0.0',
    author: 'ASD5222',
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
app.get('/api/users', (req, res) => {
  let result = [...users];
  if (req.query.role) {
    result = result.filter(u => u.role === req.query.role);
  }
  return success(res, result, `共找到 ${result.length} 个用户`);
});

// ✅ 2. 获取单个用户
app.get('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const user = users.find(u => u.id === id);
  if (!user) return error(res, `用户 ID=${id} 不存在`, 'NOT_FOUND', 404);
  return success(res, user);
});

// ✅ 3. 创建新用户
app.post('/api/users', (req, res) => {
  const { name, email, age } = req.body;
  if (!name || !email) return error(res, 'name 和 email 是必填字段', 'VALIDATION_ERROR', 422);
  const exists = users.find(u => u.email === email);
  if (exists) return error(res, '该邮箱已被注册', 'EMAIL_EXISTS', 422);
  
  const newUser = { id: nextId++, name, email, age: age || null, role: 'user' };
  users.push(newUser);
  return success(res, newUser, '用户创建成功', 201);
});

// ✅ 4. 更新用户
app.put('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return error(res, `用户 ID=${id} 不存在`, 'NOT_FOUND', 404);
  users[index] = { ...users[index], ...req.body, id };
  return success(res, users[index], '用户更新成功');
});

// ✅ 5. 删除用户
app.delete('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return error(res, `用户 ID=${id} 不存在`, 'NOT_FOUND', 404);
  const deleted = users.splice(index, 1)[0];
  return success(res, deleted, '用户已删除');
});

// ========== 错误处理 ==========
app.use((req, res) => error(res, `路由 ${req.url} 不存在`, 'ROUTE_NOT_FOUND', 404));

// ========== Vercel 导出 ==========
module.exports = app;
