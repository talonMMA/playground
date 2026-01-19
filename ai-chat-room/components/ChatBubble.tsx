'use client';

import { motion } from 'framer-motion';
import { User, Sparkles, Bot } from 'lucide-react';
import clsx from 'clsx';

interface ChatBubbleProps {
    role: 'user' | 'gemini' | 'gpt';
    content: string;
}

export default function ChatBubble({ role, content }: ChatBubbleProps) {
    const isUser = role === 'user';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx(
                "flex w-full mb-4",
                isUser ? "justify-end" : "justify-start"
            )}
        >
            <div className={clsx(
                "flex max-w-[80%] md:max-w-[70%] items-end gap-2",
                isUser ? "flex-row-reverse" : "flex-row"
            )}>
                {/* Avatar */}
                <div className={clsx(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-lg",
                    role === 'user' ? "bg-blue-500" :
                        role === 'gpt' ? "bg-green-500" : "bg-purple-500"
                )}>
                    {role === 'user' && <User className="w-5 h-5 text-white" />}
                    {role === 'gpt' && <Bot className="w-5 h-5 text-white" />}
                    {role === 'gemini' && <Sparkles className="w-5 h-5 text-white" />}
                </div>

                {/* Message Bubble */}
                <div className={clsx(
                    "p-3 rounded-2xl shadow-sm backdrop-blur-sm border border-opacity-20",
                    isUser ? "bg-blue-600/90 text-white rounded-br-none border-blue-400" :
                        "bg-white/10 text-gray-100 rounded-bl-none border-white/10"
                )}>
                    <p className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">
                        {content}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
