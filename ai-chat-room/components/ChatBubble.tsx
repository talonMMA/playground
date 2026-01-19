'use client';

import { motion } from 'framer-motion';
import { User, Sparkles, Bot } from 'lucide-react';
import clsx from 'clsx';

interface ChatBubbleProps {
    role: 'user' | 'gemini' | 'gpt';
    content: string;
    sender?: 'user' | 'botA' | 'botB';
}

export default function ChatBubble({ role, content, sender }: ChatBubbleProps) {
    const isUser = role === 'user' || sender === 'user';

    // Determine style based on Sender if available, otherwise fallback to Role
    let avatarColor = "bg-blue-500";
    let Icon = User;
    let bubbleColor = "bg-blue-600/90 text-white rounded-br-none border-blue-400";

    if (!isUser) {
        if (sender === 'botA') {
            avatarColor = "bg-green-500";
            Icon = Bot;
            bubbleColor = "bg-green-500/10 text-green-100 rounded-bl-none border-green-500/20";
        } else if (sender === 'botB') {
            avatarColor = "bg-purple-500";
            Icon = Sparkles;
            bubbleColor = "bg-purple-500/10 text-purple-100 rounded-bl-none border-purple-500/20";
        } else {
            // Fallback for old messages
            if (role === 'gpt') {
                avatarColor = "bg-teal-500";
                Icon = Bot;
                bubbleColor = "bg-teal-500/10 text-teal-100 rounded-bl-none border-teal-500/20";
            } else {
                avatarColor = "bg-amber-500";
                Icon = Sparkles;
                bubbleColor = "bg-amber-500/10 text-amber-100 rounded-bl-none border-amber-500/20";
            }
        }
    }

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
                    avatarColor
                )}>
                    <Icon className="w-5 h-5 text-white" />
                </div>

                {/* Message Bubble */}
                <div className={clsx(
                    "p-3 rounded-2xl shadow-sm backdrop-blur-sm border border-opacity-20",
                    bubbleColor
                )}>
                    <p className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">
                        {content}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
