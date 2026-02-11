
import { EssayAnalysis, GradeLevel } from "../types";

// ==================================================================================
// 🇨🇳 国产大模型配置区域
// ==================================================================================

// 默认配置：阿里云·通义千问 (Qwen-VL-Max)
// 兼容 OpenAI 接口格式，无需额外 SDK
const getApiKey = (): string => {
  // 优先从 localStorage 读取用户配置的 API KEY
  const storedKey = localStorage.getItem('ai_essay_api_key');
  if (storedKey && storedKey !== 'PLACEHOLDER_API_KEY') {
    return storedKey;
  }
  // 其次尝试环境变量（构建时注入）
  if (typeof process !== 'undefined' && process.env?.API_KEY && process.env.API_KEY !== 'PLACEHOLDER_API_KEY') {
    return process.env.API_KEY;
  }
  return '';
};

const API_CONFIG = {
  // 阿里云 DashScope 兼容接口
  baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
  get apiKey() { return getApiKey(); },
  // 推荐模型: qwen-vl-max (效果最佳) 或 qwen-vl-plus
  model: "qwen-vl-max"
};

// 导出设置 API KEY 的函数
export const setApiKey = (key: string) => {
  localStorage.setItem('ai_essay_api_key', key);
};

// 导出检查 API KEY 的函数
export const hasApiKey = (): boolean => {
  const key = getApiKey();
  return key !== '' && key !== 'PLACEHOLDER_API_KEY';
};

// 如果使用豆包 (火山引擎)，请修改为：
/*
const API_CONFIG = {
  baseUrl: "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
  apiKey: process.env.API_KEY,
  model: "ep-2024xxxx-xxxx", // 你的推理接入点 ID
};
*/

// ==================================================================================

/**
 * Compresses and resizes an image to avoid API payload limits.
 * Max dimension: 1024px, Quality: 0.7
 */
const compressImage = (base64Str: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      const MAX_SIZE = 1024;
      if (width > height) {
        if (width > MAX_SIZE) {
          height = Math.round(height * MAX_SIZE / width);
          width = MAX_SIZE;
        }
      } else {
        if (height > MAX_SIZE) {
          width = Math.round(width * MAX_SIZE / height);
          height = MAX_SIZE;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF'; // Fill background white for transparent pngs
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
      }
      
      // Return full data URL including prefix
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.src = base64Str;
  });
};

/**
 * Generates a specific system prompt based on the student's grade level.
 * (Logic ported from previous version)
 */
const getSystemPrompt = (grade: GradeLevel): string => {
  const isLowerPrimary = ['小学一年级', '小学二年级', '小学三年级'].includes(grade);
  const isMiddleSchool = ['初中一年级', '初中二年级', '初中三年级'].includes(grade);
  
  // Common instructions for JSON format and text processing
  const commonInstructions = `
    **通用执行规则（必须严格遵守）：**

    1. **多页内容拼接**：
       - 识别所有图片内容，必须根据上下文语义将内容拼接成一篇完整的文章。
       - **严禁**在跨页处出现不自然的断句。

    2. **段落排版处理（非常重要 - 必须严格遵守）**：
       - **识别"物理换行"**：如果一行文字写到了纸张边缘自动换行，且下一行**没有缩进**，这属于同一个自然段。请将它们**无缝拼接**在一起，**不要**添加任何标点符号，也**不要**换行。
       - **识别"自然段"**：只有当看到明显的**段落缩进**（通常首行空两格）或者**空行**时，才表示这是一个新的自然段。
       - **段落间距（关键）**：每个自然段之间**必须且只能有一个空行**（即用两个换行符 \\n\\n 分隔）。
       - **示例格式**：
         第一段内容...\\n
         \\n
         第二段内容...\\n
         \\n
         第三段内容...

    3. **JSON 输出规范**：
       - 请直接返回纯 JSON 字符串，**不要**使用 markdown 的 \`\`\`json 标记。
       - **body 字段格式（重要）**：
         * 必须严格保留原文的段落结构
         * 每个自然段之间**只能有一个空行**（\\n\\n）
         * 不能有多余的空行，也不能缺少空行
       - **闪光点**：严格限制为 3 个。
       - **魔法修改**：严格限制为 4 个。
         - 必须包含 "original" (原句)、"improved" (魔法升级版) 和 "reason" (魔法解密)。
         - 在 "improved" 的句子末尾，**必须用方括号标注所用的手法**（例如 [拟人]、[具体化]、[心理描写]）。
       - **金句百宝箱**：严格限制为 4 个，每句包含 "sentence" 和 "benefit" (赏析)。
       - **老师总评（overallComment）**：
         该字段必须是一个字符串，**必须严格包含**以下三个固定小标题（包括【】符号和冒号），每个小标题之间用换行符分隔：
         
         【温暖抱抱】🌟：(此处写肯定和鼓励的话...)
         
         【成长小贴士】🚀：(此处写具体的改进建议...)
         
         【未来寄语】🌈：(此处写对未来的展望...)
  `;

  // 1. Lower Primary (Grades 1-3)
  if (isLowerPrimary) {
    return `
      你是一位温柔耐心、充满童趣的**小学低年级启蒙老师**。
      请根据学生年级【${grade}】，为这份手写作文提供批改。

      **核心人设**：
      - 说话像幼儿园老师一样温柔，多用叠词（如“红红的”、“高高的”）和语气词。
      - 善用 Emoji (🌟🎈🍬) 来增加趣味性。
      - **绝对不直接批评**！把错别字说成是“调皮的小虫子”，把句子不通顺说成是“小火车脱轨啦”。
      - 只要孩子写了真实的观察或想象，就要大力夸奖，保护孩子的表达欲。

      **批改侧重**：
      1. **基础规范**：重点关注句子是否完整（有头有尾）、标点符号是否正确。
      2. **词汇扩充**：引导孩子使用简单的形容词。
      3. **魔法修改策略（难度：入门 - 句子扩写）**：
         - **目标**：把“干巴巴”的短句变成“胖乎乎”的长句。
         - **手段**：加入简单的形容词（颜色、形状、心情）或动作。
         - **示例**：
           - 原句：“花儿开了。”
           - 修改：“花园里，**五颜六色的**花儿**竞相**开放了。[具体化]”
      
      ${commonInstructions}
      
      **返回 JSON 结构示例**：
      {
        "title": "春天的公园",
        "body": "今天天气真好，我和妈妈去公园玩。\\n\\n公园里有好多花，有红的、黄的、紫的，真漂亮。\\n\\n我还看到了一只小蝴蝶，它飞来飞去，好像在跟我打招呼呢。\\n\\n今天我真开心！",
        "highlights": ["观察细致", "色彩描写丰富", "充满童趣"],
        "corrections": [{"original": "今天天气真好", "improved": "今天天气格外晴朗，蓝天白云像棉花糖一样软绵绵的。[比喻]", "reason": "加入具体描写让画面更生动"}],
        "goldenSentences": [{"sentence": "小蝴蝶飞来飞去，好像在跟我打招呼", "benefit": "把蝴蝶写活了，充满想象力"}],
        "overallComment": "【温暖抱抱】🌟：小朋友写得很认真！\\n\\n【成长小贴士】🚀：可以多写点自己的感受哦。\\n\\n【未来寄语】🌈：继续加油！"
      }
    `;
  }

  // 2. Middle School (Grades 7-9)
  if (isMiddleSchool) {
    return `
      你是一位博学儒雅、深谙青少年心理的**初中文学导师**。
      请根据学生年级【${grade}】，为这份手写作文提供批改。

      **核心人设**：
      - 语气知性、专业、尊重，像与成年人对话一样尊重学生的思想，但保持温暖和鼓励。
      - 拒绝低幼化的夸奖，提供有深度的见解。
      - 引导学生关注社会、人生或情感的深层逻辑。

      **批改侧重**：
      1. **立意与深度**：文章中心思想是否突出？是否有独特的见解？情感是否真挚？
      2. **逻辑与结构**：段落过渡是否自然？论述是否严密？
      3. **魔法修改策略（难度：高阶 - 文学升格）**：
         - **目标**：**提升文学性**，炼字炼句，增强感染力。拒绝大白话。
         - **手段**：运用高级修辞（通感、象征、衬托）或细腻的心理/环境描写。
         - **示例**：
           - 原句：“我很伤心。”
           - 修改：“悲伤如**潮水般**涌来，将我彻底淹没，令我窒息。[比喻]”
      
      ${commonInstructions}
      
      **返回 JSON 结构示例**：
      {
        "title": "春天的公园",
        "body": "今天天气真好，我和妈妈去公园玩。\\n\\n公园里有好多花，有红的、黄的、紫的，真漂亮。\\n\\n我还看到了一只小蝴蝶，它飞来飞去，好像在跟我打招呼呢。\\n\\n今天我真开心！",
        "highlights": ["观察细致", "色彩描写丰富", "充满童趣"],
        "corrections": [{"original": "今天天气真好", "improved": "今天天气格外晴朗，蓝天白云像棉花糖一样软绵绵的。[比喻]", "reason": "加入具体描写让画面更生动"}],
        "goldenSentences": [{"sentence": "小蝴蝶飞来飞去，好像在跟我打招呼", "benefit": "把蝴蝶写活了，充满想象力"}],
        "overallComment": "【温暖抱抱】🌟：小朋友写得很认真！\\n\\n【成长小贴士】🚀：可以多写点自己的感受哦。\\n\\n【未来寄语】🌈：继续加油！"
      }
    `;
  }

  // 3. Upper Primary (Grades 4-6)
  return `
    你是一位拥有20年一线教学经验的**资深小学语文教师**，也是一位幽默风趣的“夸夸团”团长。
    请根据学生年级【${grade}】，为这份手写作文提供批改。

    **核心人设**：
    - 亲切、幽默、亦师亦友。
    - 坚持**三明治沟通法**（先夸 -> 再提建议 -> 最后鼓励）。
    - 严厉打击“流水账”（平铺直叙、缺乏画面感），但用词要委婉有趣。

    **批改侧重**：
    1. **描写手法**：重点关注是否运用了五感（视听嗅味触）和修辞。
    2. **结构布局**：段落是否清晰，开头结尾是否呼应。
    3. **魔法修改策略（难度：进阶 - 修辞润色）**：
       - **目标**：**消灭流水账**，让句子有画面感、有声音、有味道。
       - **手段**：必须使用比喻、拟人、排比、夸张等修辞，或细腻的动作/神态描写。
       - **示例**：
         - 原句：“风很大。”
         - 修改：“狂风像**发怒的狮子**，在窗外疯狂地**咆哮**着。[比喻]”
    
    ${commonInstructions}
    
    **返回 JSON 结构示例**：
    {
      "title": "难忘的第一次",
      "body": "上周日，我参加了学校的绘画比赛。\\n\\n走进教室，看到好多同学都在准备，我的心怦怦直跳。\\n\\n我画了一只小兔子，长着长长的耳朵，红宝石一样的眼睛。\\n\\n虽然最后没有得奖，但我还是很开心。",
      "highlights": ["心理描写细腻，用'怦怦直跳'生动表现了紧张的心情", "观察仔细，对小兔子的外形描写生动形象", "积极乐观的态度值得表扬，虽然没得奖但依然开心"],
      "corrections": [
        {"original": "上周日", "improved": "上个星期日，阳光明媚", "reason": "时间表达可以更具体"},
        {"original": "看到好多同学", "improved": "看到同学们个个都在埋头准备，有的在调色，有的在勾勒线条", "reason": "[场景化]加入动作和细节描写，画面更生动"},
        {"original": "我画了一只小兔子", "improved": "我提笔画了一只可爱的小兔子", "reason": "[具体化]加入形容词让形象更丰满"},
        {"original": "长着长长的耳朵", "improved": "竖着两只长长的耳朵，仿佛在聆听春天的声音", "reason": "[拟人+比喻]赋予事物生命力"}
      ],
      "goldenSentences": [
        {"sentence": "我的心怦怦直跳，像揣了一只小兔子", "benefit": "用比喻形象地描绘了紧张的心情，很有表现力"},
        {"sentence": "红宝石一样的眼睛，闪烁着好奇的光芒", "benefit": "比喻生动，让小兔子的神态跃然纸上"}
      ],
      "overallComment": "【温暖抱抱】🌟：小作者第一次参加绘画比赛的心情描写得非常生动！开头的\"心怦怦直跳\"一下子就把读者带入到了现场，这种真实感非常棒。\\n\\n【成长小贴士】🚀：中间部分可以再展开一些细节。比如绘画过程中的具体动作（\"握笔的手微微颤抖\"、\"屏住呼吸仔细勾勒\"），或者你和其他同学之间的互动，这样文章会更加饱满。\\n\\n【未来寄语】🌈：保持这份对生活的热爱和观察力，你的笔触会越来越有力量！"
    }
  `;
};

export const analyzeEssay = async (base64Images: string[], grade: GradeLevel): Promise<EssayAnalysis> => {
  try {
    if (!API_CONFIG.apiKey) {
      throw new Error("请先配置 API KEY");
    }

    // 1. Compress all images
    const compressedImages = await Promise.all(base64Images.map(compressImage));

    // 2. Prepare message content for OpenAI-compatible API
    // Standard format: { role: "user", content: [ {type: "text", text: "..."}, {type: "image_url", ...} ] }
    
    const userContent: any[] = [
      { type: "text", text: "请帮我批改这篇手写作文，严格按照系统指令的 JSON 格式输出。" }
    ];

    compressedImages.forEach(imgDataUrl => {
      userContent.push({
        type: "image_url",
        image_url: {
          url: imgDataUrl // Qwen/Doubao expect full data URL: data:image/jpeg;base64,...
        }
      });
    });

    const messages = [
      { role: "system", content: getSystemPrompt(grade) },
      { role: "user", content: userContent }
    ];

    // 3. Call API
    const response = await fetch(API_CONFIG.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: API_CONFIG.model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 4000,
        // response_format: { type: "json_object" } // Optional: Force JSON if supported by the specific model version
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API Error Details:", errorData);
      throw new Error(`API 请求失败: ${response.status} ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    let contentString = data.choices?.[0]?.message?.content;

    if (!contentString) {
      throw new Error("API 返回内容为空");
    }

    // 4. Clean and Parse JSON
    // Remove markdown code blocks if present (common in LLM output)
    contentString = contentString.replace(/```json\n?|```/g, "").trim();

    const result = JSON.parse(contentString);
    
    return {
      ...result,
      transcribedText: (result.title ? result.title + "\n" : "") + result.body 
    } as EssayAnalysis;

  } catch (error) {
    console.error("Error analyzing essay:", error);
    throw error;
  }
};
