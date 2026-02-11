 📝 AI 作文批改器

**20年教龄AI名师，为孩子作文把脉诊断**

[![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?logo=vite)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

🌐 **在线体验**: https://ai-essay-reviewer.pages.dev

</div>

---

## ✨ 功能特点

- 📷 **智能 OCR 识别** - 支持拍照、相册、拖拽上传，自动识别手写作文
- 🎯 **年级适配** - 针对小学1-6年级、初中1-3年级采用不同批改策略
- 💡 **四大批改模块**
  - ✨ **闪光点** - 深度挖掘文章亮点
  - 🪄 **魔法修改** - 逐句优化，标注修辞手法
  - 💎 **金句百宝箱** - 优秀句子赏析
  - 👩‍🏫 **老师总评** - 温暖抱抱、成长小贴士、未来寄语
- 📄 **段落保持** - 严格保留原文段落格式
- 🔒 **隐私安全** - API KEY 存储在本地，不上传服务器

---

## 🛠️ 技术栈

| 技术 | 说明 |
|------|------|
| **前端框架** | React 19.2.0 + TypeScript |
| **构建工具** | Vite 6.2.0 |
| **UI 库** | Tailwind CSS + Lucide Icons |
| **AI 模型** | 阿里云通义千问 Qwen-VL-Max |
| **部署平台** | Cloudflare Pages |

---

## 🚀 快速开始

### 本地运行

```bash
# 1. 克隆项目
git clone https://github.com/ghz98315/ai_essay_reviewer.git
cd ai_essay_reviewer

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
```

访问 http://localhost:3000

### 构建部署

```bash
# 构建
npm run build

# 预览构建结果
npm run preview
```

---

## 🔑 API KEY 配置

首次使用需要配置阿里云通义千问 API KEY：

1. 获取 API KEY：https://dashscope.aliyun.com/
2. 打开应用，点击右上角"配置 API KEY"
3. 输入你的 API KEY（格式：`sk-xxxxx`）
4. 保存后即可使用

> API KEY 仅存储在你的浏览器本地，不会上传到其他服务器

---

## 📦 部署

### Vercel 部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ghz98315/ai_essay_reviewer)

### Cloudflare Pages 部署

1. 访问 https://dash.cloudflare.com/
2. Workers & Pages → Create → Connect to Git
3. 选择仓库并配置构建设置：
   - **Framework**: Vite
   - **Build command**: `npm run build`
   - **Output directory**: `dist`

---

## 📁 项目结构

```
ai-essay-reviewer/
├── components/           # React 组件
│   ├── FileUpload.tsx    # 文件上传组件
│   ├── LoadingView.tsx   # 加载动画
│   └── AnalysisResult.tsx # 结果展示
├── services/
│   └── geminiService.ts  # AI 批改服务
├── App.tsx               # 主应用
├── types.ts              # 类型定义
└── index.html            # HTML 入口
```

---

## 🎨 批改策略

| 年级 | 风格 | 策略 |
|------|------|------|
| **小学 1-3 年级** | 温柔启蒙 | 句子扩写，简单形容词 |
| **小学 4-6 年级** | 幽默风趣 | 修辞润色，消灭流水账 |
| **初中 1-3 年级** | 文学导师 | 文学升格，深度解析 |

---

## 📄 License

[MIT](LICENSE)

---

## 🙏 致谢

- [阿里云通义千问](https://dashscope.aliyun.com/) - 提供 AI 能力
- [Vite](https://vitejs.dev/) - 极速的前端构建工具
- [React](https://react.dev/) - 用户界面框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架

---

<div align="center">

**如果这个项目对你有帮助，请给个 ⭐ Star**

Made with ❤️ by ghz98315

</div>
