import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    Plane, Sun, CreditCard, Smartphone, Pill, Map,
    Loader2, Sparkles, Terminal, ArrowRight,
    Radio, AlertTriangle, Zap, Mic, Send, MoreHorizontal, Square, X, FileText, Cpu, Upload, Check, Crown, Shield, Gem, Wine,
    Brain, History, Tag, ThumbsUp, ThumbsDown, HelpCircle, Globe, BarChart3, CheckCircle2, Clock, Activity
} from 'lucide-react';
import { useI18n } from '../i18n';

// ------------------- 图标映射 -------------------
const AGENT_ICONS = {
    lifestyle: Wine,
    access: Crown,
    tech: Gem,
    wellness: Shield,
    concierge: Map,
};

const AGENT_COLORS = {
    lifestyle: { color: 'text-amber-600', bg: 'bg-amber-50/50' },
    access: { color: 'text-slate-800', bg: 'bg-slate-100' },
    tech: { color: 'text-slate-600', bg: 'bg-slate-50' },
    wellness: { color: 'text-rose-900', bg: 'bg-rose-50' },
    concierge: { color: 'text-emerald-900', bg: 'bg-emerald-50' },
};

const AGENT_IDS = ['lifestyle', 'access', 'tech', 'wellness', 'concierge'];

const getMockLogs = (t) => [
    { time: 'Now', event: t('logs.monitoring'), status: 'working' },
    { time: '09:00 AM', event: t('logs.scanning'), status: 'success' },
    { time: '06:45 AM', event: t('logs.securityUpdate'), status: 'info' },
    { time: '04:30 AM', event: t('logs.dataSync'), status: 'success' },
    { time: '02:15 AM', event: t('logs.systemCheck'), status: 'success' },
];

// ------------------- 组件区域 -------------------

export default function Home() {
    const { t, locale, toggleLocale } = useI18n();

    // 构建当前语言的 AGENTS 数据
    const agents = AGENT_IDS.map(id => ({
        id,
        name: t(`agents.${id}`),
        icon: AGENT_ICONS[id],
        color: AGENT_COLORS[id].color,
        bg: AGENT_COLORS[id].bg,
    }));

    const getAgentDoc = (id) => ({
        role: t(`agentDocs.${id}.role`),
        skills: t(`agentDocs.${id}.skills`),
        instruction: t(`agentDocs.${id}.instruction`),
    });

    const initialMemories = (t('memories.initial') || []).map((m, i) => ({ ...m, id: i + 1 }));

    const [isProcessing, setIsProcessing] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [selectedAgentId, setSelectedAgentId] = useState(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [showStatusPanel, setShowStatusPanel] = useState(false);
    const [showAlert, setShowAlert] = useState(false);

    // 记忆系统状态
    const [memories, setMemories] = useState(initialMemories);
    const [pendingMemories, setPendingMemories] = useState([]);

    const [waitingAgentId, setWaitingAgentId] = useState(null);
    const [agentStates, setAgentStates] = useState(AGENT_IDS.reduce((acc, id) => ({ ...acc, [id]: { status: 'idle', log: t('agents.idle') } }), {}));
    const [formData, setFormData] = useState({ destination: t('demo.destination'), duration: t('demo.duration'), sections: {} });
    const [messages, setMessages] = useState([{ role: 'ai', text: t('demo.initialMessage') }]);
    const [inputMessage, setInputMessage] = useState('');
    const messagesEndRef = useRef(null);
    const checklistEndRef = useRef(null);

    // 语言变更时重置状态
    useEffect(() => {
        const newMemories = (t('memories.initial') || []).map((m, i) => ({ ...m, id: i + 1 }));
        setMemories(newMemories);
        setPendingMemories([]);
        setAgentStates(AGENT_IDS.reduce((acc, id) => ({ ...acc, [id]: { status: 'idle', log: t('agents.idle') } }), {}));
        setFormData({ destination: t('demo.destination'), duration: t('demo.duration'), sections: {} });
        setMessages([{ role: 'ai', text: t('demo.initialMessage') }]);
        setIsProcessing(false);
        setIsListening(false);
        setIsListening(false);
        setSelectedAgentId(null);
        setShowStatusPanel(false);
        setShowAlert(false);
    }, [locale]);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    // --- 记忆操作函数 ---
    const acceptMemory = (memory) => {
        setMemories(prev => [memory, ...prev]);
        setPendingMemories(prev => prev.filter(m => m.id !== memory.id));
        addMessage('system', t('demo.memoryTuning').replace('{content}', memory.content));
    };

    const rejectMemory = (id) => {
        setPendingMemories(prev => prev.filter(m => m.id !== id));
    };

    // --- 核心逻辑 ---
    const startPlanning = async () => {
        setIsProcessing(true);
        addMessage('user', t('demo.confirmTrip').replace('{destination}', formData.destination));

        await delay(500);
        addMessage('ai', t('demo.readingMemory'));

        const promises = AGENT_IDS.map(async (agentId, index) => {
            await delay(index * 800 + Math.random() * 500);
            updateAgentStatus(agentId, 'working', t('demo.readingProfile'));

            const task = { type: 'checkbox', label: t('demo.defaultTask'), checked: true };
            if (agentId === 'lifestyle') task.label = t('demo.lifestyleTask');
            if (agentId === 'access') task.label = t('demo.accessTask');

            addFormItem(agentId, task);
            updateAgentStatus(agentId, 'done', t('demo.memoryMatched'));
        });

        await Promise.all(promises);
        setIsProcessing(false);
    };

    const handleVoiceDemo = async () => {
        if (isListening) return;
        setIsListening(true);
        await delay(2000);
        setIsListening(false);

        addMessage('user', t('demo.voiceText'));
        setIsProcessing(true);

        updateAgentStatus('lifestyle', 'working', t('demo.analyzingDiet'));
        await delay(1000);
        addFormItem('lifestyle', { type: 'alert', label: t('demo.dietAdjust'), checked: true });
        updateAgentStatus('lifestyle', 'done', t('demo.updateDone'));

        const newMemory = {
            id: Date.now(),
            type: 'habit',
            content: t('demo.newMemoryContent'),
            agent: 'lifestyle',
            date: locale === 'zh' ? '刚刚' : 'Just now',
            isNew: true
        };
        setPendingMemories(prev => [newMemory, ...prev]);

        setIsProcessing(false);
        addMessage('ai', t('demo.voiceResult'));

        // 演示流程：先打开记忆确认面板，然后自动打开状态总览
        setTimeout(() => {
            setSelectedAgentId('lifestyle');
            setActiveTab('memory');
        }, 1500);

        // 记忆确认后 5 秒自动弹出状态总览
        setTimeout(() => {
            setSelectedAgentId(null);
            addMessage('ai', t('demo.statusSummaryMsg'));
            setTimeout(() => setShowStatusPanel(true), 500);

            // 状态总览展示 5 秒后，触发突发事件 (Proactive Alert)
            setTimeout(() => {
                setShowStatusPanel(false); // 关闭总览以便展示 Alert
                triggerProactiveAlert();
            }, 6000);
        }, 8000);
    };

    const triggerProactiveAlert = async () => {
        setShowAlert(true);
        addMessage('system', t('alert.title') + ': ' + t('alert.flightChange'));

        // Access agent 开始工作
        updateAgentStatus('access', 'working', t('alert.rebooking'));
        await delay(2500);

        // 自动解决
        addFormItem('access', { type: 'alert', label: t('alert.newFlight'), checked: true });
        updateAgentStatus('access', 'done', t('alert.solved'));
    };

    // 辅助函数
    const addMessage = (role, text) => setMessages(prev => [...prev, { role, text, timestamp: new Date() }]);
    const updateAgentStatus = (id, status, log) => setAgentStates(prev => ({ ...prev, [id]: { status, log } }));
    const addFormItem = (sectionId, item) => {
        setFormData(prev => ({ ...prev, sections: { ...prev.sections, [sectionId]: [...(prev.sections[sectionId] || []), item] } }));
        if (checklistEndRef.current) checklistEndRef.current.scrollTop = checklistEndRef.current.scrollHeight;
    };
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // 获取数据
    const selectedAgent = selectedAgentId ? agents.find(a => a.id === selectedAgentId) : null;
    const selectedAgentDoc = selectedAgentId ? getAgentDoc(selectedAgentId) : null;

    // 标签列表
    const tagList = [t('modal.allTag'), t('modal.ideaTag'), t('modal.toneTag'), t('modal.prefsTag'), t('modal.habitTag')];

    // --- 状态总览计算 ---
    const completedAgents = AGENT_IDS.filter(id => agentStates[id].status === 'done').length;
    const workingAgents = AGENT_IDS.filter(id => agentStates[id].status === 'working').length;
    const idleAgents = AGENT_IDS.filter(id => agentStates[id].status === 'idle').length;
    const totalTasks = Object.values(formData.sections).flat().length;
    const completedTasks = Object.values(formData.sections).flat().filter(t => t.checked).length;
    const progressPercent = AGENT_IDS.length > 0 ? Math.round((completedAgents / AGENT_IDS.length) * 100) : 0;
    const hasTasks = Object.keys(formData.sections).length > 0;

    return (
        <div className="flex h-screen bg-[#FDFBF7] text-slate-800 font-sans overflow-hidden selection:bg-amber-100 relative">

            {/* ----------------- Proactive Alert Banner ----------------- */}
            {showAlert && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-top-4 duration-500 w-[90%] max-w-2xl">
                    <div className="bg-white border-l-4 border-amber-500 shadow-2xl p-4 flex items-start gap-4 rounded-r-md">
                        <div className="p-2 bg-amber-50 rounded-full animate-pulse">
                            <AlertTriangle className="w-6 h-6 text-amber-600" />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                    {t('alert.title')}
                                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">{t('alert.source')}</span>
                                </h3>
                                <button onClick={() => setShowAlert(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                            </div>
                            <p className="mt-2 text-sm font-serif text-slate-800">{t('alert.flightChange')}</p>

                            {/* 动态解决过程演示 */}
                            <div className="mt-3 space-y-2">
                                <div className="flex items-center gap-2 text-xs text-amber-600">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    {t('alert.rebooking')}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-emerald-600 animate-in fade-in slide-in-from-left-2 delay-1000 duration-500" style={{ animationDelay: '2000ms', animationFillMode: 'backwards' }}>
                                    <CheckCircle2 className="w-3 h-3" />
                                    {t('alert.newFlight')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ----------------- Modal: 协议状态总览 ----------------- */}
            {showStatusPanel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowStatusPanel(false)}>
                    <div className="bg-[#FFFEFC] w-[820px] max-h-[88vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-8 duration-300 border border-slate-200" onClick={e => e.stopPropagation()}>

                        {/* Header */}
                        <div className="px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-slate-900 to-slate-800 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-white/10 backdrop-blur-sm border border-white/20">
                                    <BarChart3 className="w-6 h-6 text-amber-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-serif font-medium text-white tracking-wide">{t('status.title')}</h3>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mt-1">{t('status.subtitle')}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowStatusPanel(false)} className="text-slate-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8">

                            {/* 总体进度卡片 */}
                            <div className="grid grid-cols-3 gap-4">
                                {/* 进度环 */}
                                <div className="col-span-1 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white flex flex-col items-center justify-center">
                                    <div className="relative w-24 h-24 mb-3">
                                        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                                            <circle cx="50" cy="50" r="42" fill="none" stroke="#f59e0b" strokeWidth="6"
                                                strokeDasharray={`${progressPercent * 2.64} 264`}
                                                strokeLinecap="round"
                                                className="transition-all duration-1000 ease-out"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-2xl font-bold font-mono">{progressPercent}%</span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] uppercase tracking-[0.15em] text-slate-400">{t('status.overallProgress')}</span>
                                </div>

                                {/* 任务统计 */}
                                <div className="bg-white border border-slate-100 p-6 flex flex-col justify-between">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2 mb-4">
                                        <CheckCircle2 className="w-3 h-3" /> {t('status.taskChecklist')}
                                    </h4>
                                    <div>
                                        <div className="text-3xl font-bold font-mono text-slate-900">{completedTasks}<span className="text-sm text-slate-300 font-normal">/{totalTasks}</span></div>
                                        <p className="text-[10px] text-slate-400 mt-1">{completedTasks} {t('status.tasksCompleted')} · {totalTasks} {t('status.totalTasks')}</p>
                                    </div>
                                    {totalTasks > 0 && (
                                        <div className="w-full bg-slate-100 h-1.5 mt-4">
                                            <div className="bg-emerald-500 h-1.5 transition-all duration-700" style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks * 100) : 0}%` }}></div>
                                        </div>
                                    )}
                                </div>

                                {/* 记忆库统计 */}
                                <div className="bg-white border border-slate-100 p-6 flex flex-col justify-between">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2 mb-4">
                                        <Brain className="w-3 h-3" /> {t('status.memoryBank')}
                                    </h4>
                                    <div>
                                        <div className="text-3xl font-bold font-mono text-slate-900">{memories.length}</div>
                                        <p className="text-[10px] text-slate-400 mt-1">{memories.length} {t('status.memoriesActive')}</p>
                                    </div>
                                    {pendingMemories.length > 0 && (
                                        <div className="mt-3 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                            <span className="text-[10px] font-bold text-red-500">{pendingMemories.length} {t('status.pendingReview')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 行程信息 */}
                            {hasTasks && (
                                <div className="bg-slate-50 border border-slate-100 p-5 flex items-center gap-8">
                                    <div className="flex items-center gap-3">
                                        <Map className="w-4 h-4 text-slate-400" />
                                        <div>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{t('status.destination')}</span>
                                            <p className="text-sm font-serif font-medium text-slate-900">{formData.destination}</p>
                                        </div>
                                    </div>
                                    <div className="h-8 w-px bg-slate-200"></div>
                                    <div className="flex items-center gap-3">
                                        <Clock className="w-4 h-4 text-slate-400" />
                                        <div>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{t('status.duration')}</span>
                                            <p className="text-sm font-serif font-medium text-slate-900">{formData.duration}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Agent 状态详情 */}
                            <div>
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2 mb-4">
                                    <Activity className="w-3 h-3" /> {t('status.agentStatus')}
                                </h4>
                                <div className="space-y-3">
                                    {agents.map(agent => {
                                        const state = agentStates[agent.id];
                                        const tasks = formData.sections[agent.id] || [];
                                        const Icon = agent.icon;
                                        const statusColor = state.status === 'done' ? 'text-emerald-600' : state.status === 'working' ? 'text-amber-500' : 'text-slate-300';
                                        const statusBg = state.status === 'done' ? 'bg-emerald-50 border-emerald-100' : state.status === 'working' ? 'bg-amber-50 border-amber-100' : 'bg-white border-slate-100';
                                        const statusLabel = state.status === 'done' ? t('status.completed') : state.status === 'working' ? t('status.working') : t('status.idle');

                                        return (
                                            <div key={agent.id} className={`border p-4 ${statusBg} transition-all duration-300`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`${agent.color}`}>
                                                            <Icon className="w-4 h-4" strokeWidth={1.5} />
                                                        </div>
                                                        <span className="font-serif text-sm font-medium text-slate-900">{agent.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[9px] font-bold uppercase tracking-widest ${statusColor}`}>{statusLabel}</span>
                                                        {state.status === 'done' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                                                        {state.status === 'working' && <Loader2 className="w-3.5 h-3.5 text-amber-500 animate-spin" />}
                                                    </div>
                                                </div>
                                                {tasks.length > 0 && (
                                                    <div className="ml-7 mt-2 space-y-1.5">
                                                        {tasks.map((task, idx) => (
                                                            <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-600">
                                                                {task.checked
                                                                    ? <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                                                                    : <div className="w-3 h-3 border border-slate-300 shrink-0"></div>
                                                                }
                                                                <span className={task.checked ? '' : 'text-slate-400'}>{task.label}</span>
                                                                {task.type === 'alert' && <span className="text-[8px] font-bold text-red-500 uppercase border border-red-200 px-1.5 py-0.5 ml-auto">{t('demo.updated')}</span>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {tasks.length === 0 && state.status === 'idle' && (
                                                    <p className="ml-7 mt-1 text-[10px] text-slate-300 italic">{t('status.noTasks')}</p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-5 border-t border-slate-100 bg-white flex justify-between items-center shrink-0">
                            <span className="text-[9px] text-slate-300 font-mono uppercase tracking-widest">
                                {t('status.generatedAt')} {new Date().toLocaleTimeString()}
                            </span>
                            <button onClick={() => setShowStatusPanel(false)} className="px-6 py-2.5 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-slate-800 transition-colors shadow-lg flex items-center gap-2">
                                <X className="w-3 h-3" /> {t('status.close')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ----------------- Modal: Agent Dossier & Memory ----------------- */}
            {selectedAgentId && selectedAgent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedAgentId(null)}>
                    <div className="bg-[#FFFEFC] w-[700px] h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-8 duration-300 border border-slate-200" onClick={e => e.stopPropagation()}>

                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex justify-between items-start shrink-0">
                            <div className="flex items-center gap-5">
                                <div className={`p-3 bg-white border border-slate-100 shadow-sm ${selectedAgent.color}`}>
                                    <selectedAgent.icon className="w-8 h-8" strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-serif font-medium text-slate-900 tracking-wide">{selectedAgent.name}</h3>
                                    <div className="flex gap-4 mt-3 text-[10px] font-bold tracking-[0.15em] uppercase text-slate-400">
                                        <button
                                            onClick={() => setActiveTab('profile')}
                                            className={`pb-1 border-b-2 transition-colors ${activeTab === 'profile' ? 'border-slate-800 text-slate-800' : 'border-transparent hover:text-slate-600'}`}
                                        >
                                            {t('modal.serviceProfile')}
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('memory')}
                                            className={`pb-1 border-b-2 transition-colors flex items-center gap-1 ${activeTab === 'memory' ? 'border-amber-600 text-amber-600' : 'border-transparent hover:text-slate-600'}`}
                                        >
                                            <Brain className="w-3 h-3" />
                                            {t('modal.clientDossier')}
                                            {(pendingMemories.length > 0 && selectedAgent.id === 'lifestyle') && (
                                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('logs')}
                                            className={`pb-1 border-b-2 transition-colors flex items-center gap-1 ${activeTab === 'logs' ? 'border-amber-600 text-amber-600' : 'border-transparent hover:text-slate-600'}`}
                                        >
                                            <Activity className="w-3 h-3" />
                                            {t('logs.tab')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setSelectedAgentId(null)} className="text-slate-300 hover:text-slate-800 transition-colors"><X className="w-6 h-6" /></button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto bg-[#F9F9F9] p-0">

                            {/* Tab 1: Profile */}
                            {activeTab === 'profile' && selectedAgentDoc && (
                                <div className="p-8 space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
                                    <div>
                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-4 flex items-center gap-2"><Cpu className="w-3 h-3" /> {t('modal.servicePosition')}</h4>
                                        <div className="font-serif text-lg text-slate-700 leading-relaxed italic">"{selectedAgentDoc.role}"</div>
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-4 flex items-center gap-2"><Sparkles className="w-3 h-3" /> {t('modal.exclusiveBenefits')}</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            {selectedAgentDoc.skills.map((skill, idx) => (
                                                <div key={idx} className="text-xs font-medium text-slate-600 border border-slate-200 px-4 py-3 bg-white shadow-sm flex items-center gap-2">
                                                    <div className="w-1 h-1 bg-amber-500 rounded-full"></div>{skill}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab 2: Memory Bank */}
                            {activeTab === 'memory' && (
                                <div className="p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                    {pendingMemories.length > 0 && (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-[10px] font-bold text-red-500 uppercase tracking-[0.15em] flex items-center gap-2">
                                                    <Zap className="w-3 h-3" /> {t('modal.pendingInsights')}
                                                </h4>
                                                <span className="text-[9px] text-slate-400 font-mono">{t('modal.autoExpire')}</span>
                                            </div>
                                            {pendingMemories.map(memory => (
                                                <div key={memory.id} className="bg-white border border-red-100 shadow-xl shadow-red-500/5 p-5 relative overflow-hidden group">
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                                                    <p className="font-serif text-lg text-slate-800 mb-4 leading-relaxed">"{memory.content}"</p>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <span className="bg-slate-100 text-slate-500 text-[9px] px-2 py-1 uppercase tracking-wider font-bold">{memory.type}</span>
                                                            <span className="text-[9px] text-slate-400 font-mono">From: Interaction 5 mins ago</span>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button onClick={() => rejectMemory(memory.id)} className="px-4 py-1.5 text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors">{t('modal.undo')}</button>
                                                            <button onClick={() => acceptMemory(memory)} className="px-4 py-1.5 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-lg">{t('modal.accept')}</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2">
                                            <History className="w-3 h-3" /> {t('modal.longTermDossier')}
                                        </h4>
                                        <div className="flex gap-2 overflow-x-auto pb-2">
                                            {tagList.map((tag, i) => (
                                                <span key={i} className={`text-[10px] px-3 py-1 border transition-colors cursor-pointer ${i === 0 ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'}`}>{tag}</span>
                                            ))}
                                        </div>
                                        <div className="space-y-3">
                                            {memories.map(memory => (
                                                <div key={memory.id} className="bg-white border border-slate-100 p-4 hover:border-slate-300 transition-all duration-300 group">
                                                    <div className="flex items-start gap-3">
                                                        <div className="mt-1 p-1 bg-slate-50 text-slate-400 rounded-sm"><Tag className="w-3 h-3" /></div>
                                                        <div className="flex-1">
                                                            <p className="text-sm text-slate-700 font-medium leading-relaxed mb-2">{memory.content}</p>
                                                            <div className="flex items-center justify-between border-t border-slate-50 pt-2">
                                                                <span className="text-[9px] text-slate-400 font-mono uppercase">{t('modal.loggedBy')} {agents.find(a => a.id === memory.agent)?.name} · {memory.date}</span>
                                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                                                    <button className="text-slate-300 hover:text-slate-600"><ThumbsUp className="w-3 h-3" /></button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab 3: Operation Logs */}
                            {activeTab === 'logs' && (
                                <div className="p-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="relative border-l border-slate-200 ml-3 space-y-8">
                                        {getMockLogs(t).map((log, idx) => (
                                            <div key={idx} className="relative pl-6">
                                                <div className={`absolute -left-1.5 top-1.5 w-3 h-3 rounded-full border-2 border-white ${log.status === 'working' ? 'bg-amber-500 animate-pulse' : log.status === 'info' ? 'bg-blue-400' : 'bg-emerald-400'}`}></div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{log.time}</span>
                                                    <span className={`text-sm font-medium ${log.status === 'working' ? 'text-amber-600' : 'text-slate-700'}`}>{log.event}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-12 p-4 bg-slate-50 border border-slate-100 rounded text-center">
                                        <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                            24/7 Active Monitoring
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-slate-100 bg-white flex justify-between items-center text-[9px] text-slate-300 font-mono uppercase tracking-widest">
                            <span>{t('modal.memoryEngineVersion')}</span>
                            <span className="text-amber-600 flex items-center gap-1"><Brain className="w-3 h-3" /> {t('modal.learningActive')}</span>
                        </div>
                    </div>
                </div>
            )
            }

            {/* ----------------- 左栏：私人管家团队 ----------------- */}
            <div className="w-72 bg-white border-r border-slate-100 flex flex-col z-20 shrink-0">
                <div className="p-8 border-b border-slate-100 bg-white flex items-center justify-between">
                    <div>
                        <h2 className="font-serif text-xl text-slate-900 flex items-center gap-3 tracking-wide">
                            <Crown className="w-5 h-5 text-amber-600" />
                            {t('app.concierge')}
                        </h2>
                        <p className="text-[10px] text-slate-400 mt-3 uppercase tracking-[0.2em] font-medium">{t('app.subtitle')}</p>
                    </div>
                    <button
                        onClick={toggleLocale}
                        className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-700 transition-colors border border-slate-100 px-2.5 py-1.5 hover:border-slate-300"
                        title="Switch Language"
                    >
                        <Globe className="w-3 h-3" />
                        {t('langSwitch.label')}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-0">
                    {agents.map(agent => (
                        <button
                            key={agent.id}
                            onClick={() => { setSelectedAgentId(agent.id); setActiveTab('profile'); }}
                            className={`w-full text-left px-8 py-6 border-b border-slate-50 transition-all duration-500 group relative ${agentStates[agent.id].status === 'working' ? 'bg-slate-50' : 'hover:bg-slate-50/50'}`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-4">
                                    <div className={`text-slate-300 ${agentStates[agent.id].status !== 'idle' ? agent.color : ''}`}>
                                        <agent.icon className="w-5 h-5" strokeWidth={1.5} />
                                    </div>
                                    <span className={`font-medium text-sm tracking-wide font-serif ${agentStates[agent.id].status !== 'idle' ? 'text-slate-900' : 'text-slate-400'}`}>{agent.name}</span>
                                </div>
                                {pendingMemories.some(m => m.agent === agent.id) && (
                                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-red-500/50 shadow-lg"></span>
                                )}
                            </div>
                            <div className="font-mono text-[10px] truncate text-slate-300 pl-9">{agentStates[agent.id].log}</div>
                        </button>
                    ))}
                </div>

                {/* 底部按钮区 */}
                <div className="p-4 border-t border-slate-100 space-y-2">
                    {hasTasks && (
                        <button
                            onClick={() => setShowStatusPanel(true)}
                            className="flex items-center justify-center gap-2 w-full py-3 text-[10px] font-bold text-amber-700 uppercase tracking-[0.15em] hover:bg-amber-50 transition-all border border-amber-200 bg-amber-50/50"
                        >
                            <BarChart3 className="w-3.5 h-3.5" />
                            {t('home.viewStatus')}
                        </button>
                    )}
                    <Link
                        to="/help"
                        className="flex items-center justify-center gap-2 w-full py-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] hover:text-slate-700 hover:bg-slate-50 transition-all border border-slate-100"
                    >
                        <HelpCircle className="w-3.5 h-3.5" />
                        {t('home.protocolManual')}
                    </Link>
                </div>
            </div>

            {/* ----------------- 中栏：定制行程清单 ----------------- */}
            <div className="flex-1 bg-[#FDFBF7] flex flex-col min-w-0 relative">
                <div className="p-8 border-b border-slate-200/60 z-10 flex flex-wrap gap-12 items-end">
                    <div className="group">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-3">{t('home.clientProfile')}</label>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-slate-900 text-white flex items-center justify-center font-serif font-bold text-xs rounded-none">L</div>
                            <span className="font-serif text-lg text-slate-900">{t('home.clientName')}</span>
                            <span className="text-[9px] border border-amber-200 text-amber-700 px-2 py-0.5 uppercase tracking-wider bg-amber-50">{t('home.memoryAccessOn')}</span>
                        </div>
                    </div>
                    <div className="ml-auto text-right">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1">{t('home.lastSync')}</span>
                        <div className="text-xs font-bold text-slate-900 font-mono">{t('home.today')}</div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-12 space-y-16 pb-20 scroll-smooth" ref={checklistEndRef}>
                    {Object.keys(formData.sections).length === 0 && !isProcessing && (
                        <div className="flex flex-col items-center justify-center h-64 opacity-50">
                            <Brain className="w-12 h-12 text-slate-300 mb-4 stroke-1" />
                            <p className="text-xs font-bold tracking-[0.2em] uppercase text-slate-400">{t('home.waitingToInitiate')}</p>
                        </div>
                    )}
                    {agents.map(agent => formData.sections[agent.id] && (
                        <div key={agent.id} className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="flex items-center gap-4 mb-6 border-l-2 border-slate-900 pl-4">
                                <span className="font-serif text-lg text-slate-900 tracking-wide">{agent.name}</span>
                                <span className="h-px flex-1 bg-slate-200"></span>
                            </div>
                            <div className="space-y-3 pl-4">
                                {formData.sections[agent.id].map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-5 p-5 bg-white shadow-sm border border-slate-100 hover:shadow-md transition-all">
                                        <div className="relative flex items-center mt-0.5">
                                            <input type="checkbox" defaultChecked={item.checked} className="peer appearance-none w-4 h-4 border border-slate-300 checked:bg-slate-900 checked:border-slate-900 cursor-pointer rounded-none" />
                                            <div className="absolute inset-0 pointer-events-none text-white hidden peer-checked:flex items-center justify-center"><Check className="w-3 h-3" /></div>
                                        </div>
                                        <span className={`text-sm font-medium ${item.checked ? 'text-slate-800' : 'text-slate-400 line-through'}`}>{item.label}</span>
                                        {item.type === 'alert' && <span className="ml-auto text-[9px] font-bold text-red-500 uppercase border border-red-200 px-2 py-0.5">{t('demo.updated')}</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ----------------- 右栏：私人指令中心 ----------------- */}
            <div className="w-[400px] bg-white border-l border-slate-100 flex flex-col z-20 shrink-0 shadow-xl shadow-slate-200/50">
                <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/30">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}>
                            <div className={`max-w-[85%] p-5 text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-100 text-slate-600'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                <div className="p-6 border-t border-slate-100 bg-white">
                    {!isProcessing && Object.keys(formData.sections).length === 0 && (
                        <button onClick={startPlanning} className="w-full mb-6 bg-slate-900 text-white py-4 font-bold text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-lg">
                            <Sparkles className="w-4 h-4" /> {t('home.initiateProtocol')}
                        </button>
                    )}
                    {/* 状态总览快捷按钮 - 在有任务后显示 */}
                    {hasTasks && (
                        <button onClick={() => setShowStatusPanel(true)} className="w-full mb-4 bg-gradient-to-r from-amber-50 to-amber-100/50 text-amber-800 py-3 font-bold text-[10px] uppercase tracking-[0.15em] hover:from-amber-100 hover:to-amber-50 transition-all flex items-center justify-center gap-2 border border-amber-200">
                            <BarChart3 className="w-3.5 h-3.5" /> {t('home.viewStatus')}
                        </button>
                    )}
                    <div className={`relative flex items-center gap-0 border transition-all duration-300 ${isListening ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-slate-50'}`}>
                        <button onClick={handleVoiceDemo} disabled={isListening} className={`p-4 transition-colors border-r border-slate-100 ${isListening ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-slate-600'}`}><Mic className="w-4 h-4" /></button>
                        <input value={inputMessage} onChange={e => setInputMessage(e.target.value)} placeholder={isListening ? t('home.listening') : t('home.typePlaceholder')} className="flex-1 bg-transparent px-5 py-4 text-sm outline-none text-slate-900 placeholder-slate-400 font-serif" />
                        <button className="p-4 text-slate-800 border-l border-slate-100"><Send className="w-4 h-4" /></button>
                    </div>
                </div>
            </div>
        </div >
    );
}
