'use client';

import { useState, useEffect, useRef } from 'react';
import ChatBubble from '@/components/ChatBubble';
import { Send, Play, Square, Settings2, Bot } from 'lucide-react';
import { motion } from 'framer-motion';

type Message = {
  role: 'user' | 'gemini' | 'gpt';
  content: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'manual' | 'battle'>('manual');
  const [isBattleRunning, setIsBattleRunning] = useState(false);

  // Battle Config
  const [botA, setBotA] = useState<'gemini' | 'gpt'>('gpt');
  const [botB, setBotB] = useState<'gemini' | 'gpt'>('gemini');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Battle Orchestration
  useEffect(() => {
    if (!isBattleRunning || mode !== 'battle') return;

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) return;

    const runBattleTurn = async () => {
      if (isLoading) return;

      // Determine next speaker
      let nextBot: 'gemini' | 'gpt' | null = null;

      if (lastMessage.role === 'user') {
        // User started it, Bot A goes first
        nextBot = botA;
      } else if (lastMessage.role === botA) {
        // Bot A just spoke, Bot B's turn
        nextBot = botB;
      } else if (lastMessage.role === botB) {
        // Bot B just spoke, Bot A's turn
        nextBot = botA;
      }

      if (nextBot) {
        setIsLoading(true);
        try {
          // Slight delay for realism
          await new Promise(r => setTimeout(r, 1000));

          const response = await fetch('/api/chat', {
            method: 'POST',
            body: JSON.stringify({
              model: nextBot,
              messages: messages
            }),
          });
          const data = await response.json();

          if (data.reply) {
            setMessages(prev => [...prev, { role: nextBot!, content: data.reply }]);
          }
        } catch (e) {
          console.error("Battle Error", e);
          setIsBattleRunning(false); // Stop on error
        } finally {
          setIsLoading(false);
        }
      }
    };

    runBattleTurn();
  }, [messages, isBattleRunning, mode, botA, botB, isLoading]);


  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    if (mode === 'manual') {
      setIsLoading(true);
      try {
        // Default to Gemini for manual for now, or add selector
        // Let's just default to Bot A's model for manual
        const response = await fetch('/api/chat', {
          method: 'POST',
          body: JSON.stringify({ model: botA, messages: [...messages, userMsg] }),
        });
        const data = await response.json();
        if (data.reply) {
          setMessages(prev => [...prev, { role: botA, content: data.reply }]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Battle mode: user sets the topic, then effect takes over
      if (!isBattleRunning) setIsBattleRunning(true);
    }
  };

  return (
    <main className="flex h-screen bg-neutral-950 text-neutral-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-80 bg-neutral-900 border-r border-neutral-800 p-6 hidden md:flex flex-col gap-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500" />
          <h1 className="text-xl font-bold tracking-tight">AI Arena</h1>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-neutral-800/50 border border-neutral-700/50">
            <h2 className="text-sm font-semibold text-neutral-400 mb-3 uppercase tracking-wider">Mode</h2>
            <div className="flex gap-2">
              <button
                onClick={() => { setMode('manual'); setIsBattleRunning(false); }}
                className={`flex-1 py-2 px-3 rounded-lg text-sm transition-all ${mode === 'manual' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'bg-neutral-800 hover:bg-neutral-700'}`}
              >
                Manual
              </button>
              <button
                onClick={() => setMode('battle')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm transition-all ${mode === 'battle' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' : 'bg-neutral-800 hover:bg-neutral-700'}`}
              >
                Battle
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-neutral-800/50 border border-neutral-700/50">
            <h2 className="text-sm font-semibold text-neutral-400 mb-3 uppercase tracking-wider">Contestants</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-neutral-500 mb-1 block">Bot A (User Reply)</label>
                <select
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={botA}
                  onChange={(e) => setBotA(e.target.value as any)}
                >
                  <option value="gpt">ChatGPT (GPT-3.5)</option>
                  <option value="gemini">Gemini 2.0 Flash</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-neutral-500 mb-1 block">Bot B</label>
                <select
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  value={botB}
                  onChange={(e) => setBotB(e.target.value as any)}
                >
                  <option value="gemini">Gemini 2.0 Flash</option>
                  <option value="gpt">ChatGPT (GPT-3.5)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-neutral-800">
          <p className="text-xs text-neutral-500">
            {isBattleRunning ? (
              <span className="text-green-400 animate-pulse flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400"></span> Battle Active
              </span>
            ) : "Ready to chat"}
          </p>
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative bg-[url('/grid.svg')] bg-repeat opacity-80">
        {/* Header for Mobile */}
        <div className="md:hidden p-4 border-b border-neutral-800 bg-neutral-900 flex justify-between items-center">
          <h1 className="font-bold">AI Arena</h1>
          <button onClick={() => setMode(mode === 'battle' ? 'manual' : 'battle')} className="text-xs bg-neutral-800 p-2 rounded">
            {mode === 'battle' ? 'Switch to Manual' : 'Switch to Battle'}
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-neutral-500 opacity-50">
              <Bot className="w-16 h-16 mb-4" />
              <p className="text-lg">Start a conversation...</p>
            </div>
          )}
          {messages.map((m, i) => (
            <ChatBubble key={i} role={m.role} content={m.content} />
          ))}
          {isLoading && (
            <div className="flex justify-start w-full">
              <div className="flex items-center gap-1 bg-neutral-800/50 p-3 rounded-2xl w-16 h-10">
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-neutral-900/80 border-t border-neutral-800 backdrop-blur-md">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === 'battle' ? "Set the topic to start the battle..." : "Type a message..."}
                className="w-full bg-neutral-800/50 text-white rounded-xl pl-4 pr-12 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-neutral-700 placeholder-neutral-500 shadow-inner"
                disabled={isBattleRunning} // Disable input while battle runs automatically
              />
            </div>

            {mode === 'battle' && isBattleRunning ? (
              <button
                type="button"
                onClick={() => setIsBattleRunning(false)}
                className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-xl transition-all shadow-lg hover:shadow-red-500/20 active:scale-95 flex items-center gap-2 font-semibold"
              >
                <Square className="w-5 h-5 fill-current" />
                Stop
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-xl transition-all shadow-lg hover:shadow-blue-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mode === 'battle' ? <Play className="w-5 h-5 fill-current" /> : <Send className="w-5 h-5" />}
              </button>
            )}
          </form>
          <p className="text-center text-xs text-neutral-600 mt-2">
            Powered by OpenAI & Google Gemini
          </p>
        </div>
      </div>
    </main>
  );
}
