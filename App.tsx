
import React, { useState, useEffect } from 'react';
import { BookOpenCheck, AlertCircle, Key, Eye, EyeOff } from 'lucide-react';
import FileUpload from './components/FileUpload';
import LoadingView from './components/LoadingView';
import AnalysisResult from './components/AnalysisResult';
import { analyzeEssay, setApiKey, hasApiKey } from './services/geminiService';
import { EssayAnalysis, AppState, GradeLevel } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [analysisResult, setAnalysisResult] = useState<EssayAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isApiKeyConfigured, setIsApiKeyConfigured] = useState(false);

  // 检查 API KEY 是否已配置
  useEffect(() => {
    setIsApiKeyConfigured(hasApiKey());
  }, []);

  const handleSaveApiKey = () => {
    const key = apiKeyInput.trim();
    if (key) {
      // 阿里云 API KEY 应该是 32 或 36 位字符
      console.log('API KEY 长度:', key.length, '内容:', key.substring(0, 10) + '...');
      if (key.length < 30) {
        alert('API KEY 长度似乎不对，请检查是否完整。阿里云 API KEY 通常是 sk- 开头的 32-36 位字符。');
        return;
      }
      setApiKey(key);
      setIsApiKeyConfigured(true);
      setShowApiKeyInput(false);
      setApiKeyInput('');
      alert('API KEY 已保存！');
    }
  };

  const handleFileSelect = async (files: string[], previews: string[], grade: GradeLevel) => {
    setImagePreviews(previews);
    setAppState(AppState.ANALYZING);
    setErrorMsg('');

    try {
      const result = await analyzeEssay(files, grade);
      setAnalysisResult(result);
      setAppState(AppState.RESULT);
    } catch (error: any) {
      console.error('详细错误信息:', error);
      setAppState(AppState.ERROR);
      // 显示详细的错误信息
      const errorMsg = error?.message || String(error);
      setErrorMsg(`错误：${errorMsg}`);
    }
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setImagePreviews([]);
    setAnalysisResult(null);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-warm-50 font-sans text-gray-800 selection:bg-warm-200">
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-warm-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleReset}>
            <div className="bg-warm-500 p-2 rounded-lg shadow-sm">
              <BookOpenCheck className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-cute text-warm-900 tracking-wide">AI 作文批改器</h1>
          </div>

          <div className="flex items-center gap-2">
            {!isApiKeyConfigured && (
              <button
                onClick={() => setShowApiKeyInput(true)}
                className="text-sm bg-orange-100 text-orange-700 hover:bg-orange-200 font-medium px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
              >
                <Key size={14} />
                配置 API KEY
              </button>
            )}
            {isApiKeyConfigured && (
              <button
                onClick={() => {
                  if (confirm('要重新配置 API KEY 吗？')) {
                    localStorage.removeItem('ai_essay_api_key');
                    setIsApiKeyConfigured(false);
                  }
                }}
                className="text-sm bg-green-100 text-green-700 hover:bg-green-200 font-medium px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                title="点击重新配置"
              >
                <Key size={14} />
                已配置 ✓
              </button>
            )}
            {appState === AppState.RESULT && (
               <button
                 onClick={handleReset}
                 className="text-sm text-warm-600 hover:text-warm-800 font-medium px-3 py-1 rounded-full hover:bg-warm-50 transition-colors"
               >
                 重新上传
               </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">

        {/* API KEY 配置模态框 */}
        {showApiKeyInput && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in duration-300">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-orange-100 p-2 rounded-full">
                  <Key className="text-orange-600" size={20} />
                </div>
                <h3 className="text-lg font-bold text-gray-800">配置 API KEY</h3>
              </div>

              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                请输入阿里云通义千问的 API KEY 以启用 AI 批改功能。
                <a href="https://dashscope.aliyun.com/" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline ml-1">
                  获取 API KEY →
                </a>
              </p>

              <div className="mb-4">
                <div className="relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                    autoFocus
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowApiKeyInput(false);
                    setApiKeyInput('');
                  }}
                  className="flex-1 px-4 py-2.5 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveApiKey}
                  disabled={!apiKeyInput.trim()}
                  className="flex-1 px-4 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  保存
                </button>
              </div>

              <p className="text-xs text-gray-400 mt-4 text-center">
                API KEY 仅存储在您的浏览器本地，不会上传到其他服务器
              </p>
            </div>
          </div>
        )}
        
        {/* IDLE STATE */}
        {appState === AppState.IDLE && (
          <div className="animate-in fade-in zoom-in duration-500">
             <div className="text-center mb-10 mt-4">
               <h2 className="text-3xl md:text-4xl font-cute text-warm-800 mb-4 leading-tight">
                 20年教龄AI名师<br className="hidden md:inline"/> 为孩子作文把脉诊断
               </h2>
               <div className="flex flex-wrap justify-center gap-2 text-warm-600 text-sm md:text-base">
                 <span className="px-3 py-1 bg-white rounded-full shadow-sm border border-warm-100">✨ 深度闪光点挖掘</span>
                 <span className="px-3 py-1 bg-white rounded-full shadow-sm border border-warm-100">🪄 魔法修辞升级</span>
                 <span className="px-3 py-1 bg-white rounded-full shadow-sm border border-warm-100">💎 金句赏析积累</span>
               </div>
             </div>
             <FileUpload onFileSelect={handleFileSelect} />
          </div>
        )}

        {/* LOADING STATE */}
        {appState === AppState.ANALYZING && (
          <LoadingView />
        )}

        {/* RESULT STATE */}
        {appState === AppState.RESULT && analysisResult && (
          <AnalysisResult 
            analysis={analysisResult} 
            imagePreviews={imagePreviews} 
            onReset={handleReset}
          />
        )}

        {/* ERROR STATE */}
        {appState === AppState.ERROR && (
          <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-8 animate-in slide-in-from-bottom-4">
            <div className="bg-red-50 p-6 rounded-full mb-6 shadow-sm">
              <AlertCircle size={48} className="text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">分析过程中遇到一点小问题</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">{errorMsg}</p>
            <button 
              onClick={handleReset}
              className="px-8 py-3 bg-warm-500 text-white rounded-full hover:bg-warm-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 font-medium"
            >
              重新尝试
            </button>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-warm-400 text-xs md:text-sm">
        <p>© 2025 AI Essay Grader. 专为中小学生打造的智能写作助手。</p>
      </footer>
    </div>
  );
};

export default App;
