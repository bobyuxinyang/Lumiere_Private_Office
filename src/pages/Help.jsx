import React from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Crown, BookOpen, Sparkles, Brain, Globe } from 'lucide-react';
import { useI18n } from '../i18n';
import readmeContent from '../../README.md?raw';

export default function Help() {
    const { t, toggleLocale } = useI18n();

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-slate-800 font-sans selection:bg-amber-100">

            {/* -------- 顶部导航栏 -------- */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-100">
                <div className="max-w-4xl mx-auto px-8 py-5 flex items-center justify-between">
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] hover:text-slate-700 transition-colors group"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                        {t('help.backToConsole')}
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <Crown className="w-4 h-4 text-amber-600" />
                            <span className="font-serif text-sm text-slate-900 tracking-wide">LUMIÈRE</span>
                            <span className="text-[9px] border border-slate-200 text-slate-400 px-2 py-0.5 uppercase tracking-wider">{t('home.protocolManual')}</span>
                        </div>
                        <button
                            onClick={toggleLocale}
                            className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-700 transition-colors border border-slate-100 px-2.5 py-1.5 hover:border-slate-300"
                        >
                            <Globe className="w-3 h-3" />
                            {t('langSwitch.label')}
                        </button>
                    </div>
                </div>
            </header>

            {/* -------- 主体内容 -------- */}
            <main className="max-w-3xl mx-auto px-6 py-20 animate-in fade-in slide-in-from-bottom-8 duration-700">

                {/* 装饰性标题区域 */}
                <div className="mb-20 text-center">
                    <div className="inline-flex items-center gap-2 mb-8 text-[10px] font-bold text-amber-600 uppercase tracking-[0.25em] px-4 py-2 bg-amber-50 border border-amber-100 rounded-full">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{t('help.documentation')}</span>
                    </div>
                    <h1 className="font-serif text-5xl text-slate-900 tracking-tight mb-6 leading-tight">
                        {t('help.pageTitle')}
                    </h1>
                    <p className="text-base text-slate-500 max-w-lg mx-auto leading-relaxed">
                        {t('help.pageDesc')}
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-8 text-[10px] text-slate-400 uppercase tracking-[0.2em] font-medium border-t border-b border-slate-100 py-4 mx-auto max-w-md">
                        <span className="flex items-center gap-2 hover:text-slate-800 transition-colors cursor-help">
                            <Brain className="w-4 h-4 text-amber-500" /> {t('help.memoryEngine')}
                        </span>
                        <span className="text-slate-200">|</span>
                        <span className="flex items-center gap-2 hover:text-slate-800 transition-colors cursor-help">
                            <Sparkles className="w-4 h-4 text-amber-500" /> {t('help.multiAgent')}
                        </span>
                    </div>
                </div>

                {/* Markdown 渲染区域 */}
                <div className="bg-white border border-slate-100 shadow-xl shadow-slate-200/40 p-10 md:p-16 rounded-sm relative overflow-hidden">
                    {/* 顶部装饰线 */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 opacity-50"></div>

                    <article className="prose-lumiere">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {readmeContent}
                        </ReactMarkdown>
                    </article>
                </div>

                {/* 底部快速返回 */}
                <div className="mt-20 text-center">
                    <Link
                        to="/"
                        className="group inline-flex items-center gap-3 px-10 py-5 bg-slate-900 text-white text-[11px] font-bold uppercase tracking-[0.25em] hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                    >
                        <Sparkles className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                        {t('help.launchConsole')}
                    </Link>
                    <div className="text-[10px] text-slate-300 mt-6 uppercase tracking-widest font-mono flex items-center justify-center gap-2">
                        <ArrowLeft className="w-3 h-3" />
                        {t('help.returnToConsole')}
                    </div>
                </div>
            </main>

            {/* -------- 页脚 -------- */}
            <footer className="border-t border-slate-100 bg-white mt-16">
                <div className="max-w-4xl mx-auto px-8 py-6 flex items-center justify-between text-[9px] text-slate-300 font-mono uppercase tracking-widest">
                    <span>{t('app.title')}</span>
                    <span className="text-amber-600 flex items-center gap-1">
                        <Brain className="w-3 h-3" /> {t('modal.learningActive')}
                    </span>
                </div>
            </footer>
        </div>
    );
}
