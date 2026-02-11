
# 🇨🇳 国产大模型配置手册

本应用已更新为支持 **OpenAI 兼容接口协议**，这意味着您可以直接使用 **阿里云·通义千问 (Qwen)** 或 **字节跳动·豆包 (Doubao)** 等支持该协议的国产大模型，无需修改代码逻辑，只需简单的配置。

当前代码默认针对 **阿里云·通义千问 VL** 进行了优化，因为它在中文手写体识别（OCR）和语义理解方面表现卓越。

---

## 🛠 快速开始：使用阿里云·通义千问 (推荐)

通义千问 (Qwen-VL) 对图片的处理能力非常强，且 API 调用方式标准。

### 1. 获取 API Key
1. 访问 [阿里云百炼平台 (DashScope)](https://bailian.console.aliyun.com/)。
2. 注册/登录并开通 DashScope 服务。
3. 在控制台创建一个新的 API-KEY。

### 2. 配置环境
在项目根目录的 `.env` 文件（如果没有则新建）中设置：

```bash
API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

*注意：代码中的 `API_CONFIG` 默认使用了 `qwen-vl-max` 模型，这是目前效果最好的版本。*

---

## 🌋 进阶配置：使用字节跳动·豆包

如果您更喜欢使用豆包（火山引擎），需要修改 `services/geminiService.ts` 中的配置。

### 1. 获取 API Key 和推理接入点
1. 访问 [火山引擎·方舟平台](https://console.volcengine.com/ark/region:ark+cn-beijing/endpoint)。
2. 获取 API Key。
3. 在“在线推理”中创建一个接入点 (Endpoint)。
   * **重要**：选择的模型必须支持视觉能力 (Vision)，例如 `Doubao-Pro-32k-Vision`。
   * 创建成功后，您会获得一个 **Endpoint ID** (例如 `ep-20240604xxxx-xxxxx`)。

### 2. 修改代码配置
打开 `services/geminiService.ts`，找到顶部的 `API_CONFIG` 部分，修改为：

```typescript
const API_CONFIG = {
  // 豆包 API 地址
  baseUrl: "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
  // 您的火山引擎 API Key
  apiKey: process.env.API_KEY,
  // ⚠️ 重点：这里填写您的 Endpoint ID，而不是模型名称
  model: "ep-20240604xxxx-xxxxx", 
};
```

---

## 📋 功能说明

本次更新保留了之前的核心逻辑：

1.  **分年级人设**：
    *   **小学低年级**：幼儿园老师语气，叠词+Emoji。
    *   **小学高年级**：资深语文老师，幽默三明治沟通法。
    *   **初中**：文学导师，深度解析。
2.  **统一输出格式**：
    *   无论使用哪个模型，输出的“老师总评”都会严格遵循【温暖抱抱】、【成长小贴士】、【未来寄语】的格式，确保前端排版美观。
3.  **图片处理**：
    *   自动压缩图片至 1024px 以内，加快上传速度并节省 Token。

---

## ⚠️ 常见问题

**Q: 为什么上传图片后报错 "400 Bad Request"?**
A: 可能是图片太大或格式不支持。代码中已经内置了压缩逻辑。如果仍报错，请检查 API Key 是否欠费，或者该 Key 是否有调用 Vision 模型的权限。

**Q: 返回的内容格式乱了怎么办？**
A: 虽然 Prompt 中强制要求了 JSON 格式，但不同模型的遵循程度不同。如果出现问题，可以尝试在 `services/geminiService.ts` 的 `getSystemPrompt` 中加强对 JSON 结构的描述。
