import { useState, useRef, useCallback } from 'react';
import { aiApi, conversationApi } from '../lib/api';

export interface ChatMessage {
    id: string;
    sender: 'user' | 'ai';
    text: string;
    timestamp: number;
    responseType?: string;
    hotels?: any[];
    flights?: any;
    tourPackage?: any;
    attachments?: any[];
    action?: any;
    isStreaming?: boolean;
}

interface UseChatStreamOptions {
    onNewConversationCreated?: (id: string, title: string) => void;
    onError?: (err: any) => void;
}

export function useChatStream(options: UseChatStreamOptions = {}) {
    const [isStreaming, setIsStreaming] = useState(false);
    const [activeToolText, setActiveToolText] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const stopStreaming = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        setIsStreaming(false);
        setActiveToolText(null);
    }, []);

    const sendStreamMessage = useCallback(async ({
        query,
        messages,
        currentConversationId,
        userMemory,
        user,
        attachments,
        setMessages,
        navigate
    }: {
        query: string;
        messages: ChatMessage[];
        currentConversationId: string | null;
        userMemory?: any;
        user?: any;
        attachments?: any[];
        setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
        navigate: (path: string, options?: any) => void;
    }) => {
        const timestamp = Date.now();
        const userMsg: ChatMessage = {
            id: `u-${timestamp}`,
            sender: 'user',
            text: query,
            timestamp,
            attachments: attachments && attachments.length > 0 ? attachments : undefined
        };

        let targetConversationId = currentConversationId;

        // 1. Create DB Conversation if Turn 1
        if (!targetConversationId) {
            try {
                const titleSnippet = query.length > 40 ? query.slice(0, 40) + '...' : query;
                const convRes = await conversationApi.create(titleSnippet);
                if (convRes.success && convRes.conversation?.id) {
                    const newId: string = String(convRes.conversation.id);
                    targetConversationId = newId;
                    options.onNewConversationCreated?.(newId, convRes.conversation.title || titleSnippet);
                    if (!user) {
                        try {
                            const currentStored = JSON.parse(localStorage.getItem('gethotel_guest_conversation_ids') || '[]');
                            if (!currentStored.includes(newId)) {
                                currentStored.push(newId);
                                localStorage.setItem('gethotel_guest_conversation_ids', JSON.stringify(currentStored));
                            }
                            const currentMeta = JSON.parse(localStorage.getItem('gethotel_guest_conversations_meta') || '[]');
                            currentMeta.unshift({
                                id: newId,
                                title: convRes.conversation.title || titleSnippet,
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString()
                            });
                            localStorage.setItem('gethotel_guest_conversations_meta', JSON.stringify(currentMeta.slice(0, 30)));
                        } catch {}
                    }
                    navigate(`/c/${targetConversationId}`, { replace: true });
                }
            } catch (convErr) {
                console.warn('[Conversation] Create failed on turn 1:', convErr);
            }
        }

        // 2. Add User Message and Streaming AI Placeholder
        const aiMsgId = `ai-${timestamp + 1}`;
        const initialAiMsg: ChatMessage = {
            id: aiMsgId,
            sender: 'ai',
            text: '',
            timestamp: timestamp + 1,
            isStreaming: true
        };

        setMessages(prev => [...prev, userMsg, initialAiMsg]);
        setIsStreaming(true);
        setActiveToolText(null);

        // Abort Controller for Stream
        const controller = new AbortController();
        abortControllerRef.current = controller;

        const historyPayload = messages.map(m => ({
            role: m.sender === 'ai' ? 'ai' : 'user',
            content: m.text
        }));
        historyPayload.push({ role: 'user', content: query });

        let accumulatedText = '';

        try {
            const finalResult = await aiApi.chatStream(historyPayload, {
                conversationId: targetConversationId || undefined,
                userMemory,
                signal: controller.signal,
                onToken: (token: string) => {
                    accumulatedText += token;
                    setMessages(prev =>
                        prev.map(m => (m.id === aiMsgId ? { ...m, text: accumulatedText, isStreaming: true } : m))
                    );
                },
                onEvent: (event: string, data: any) => {
                    if (event === 'tool_start') {
                        setActiveToolText(data?.text || 'Searching live database...');
                    } else if (event === 'tool_result') {
                        setActiveToolText(null);
                        if (data?.hotels?.length > 0 || data?.tourPackage || data?.flights) {
                            setMessages(prev =>
                                prev.map(m =>
                                    m.id === aiMsgId
                                        ? {
                                              ...m,
                                              hotels: data.hotels,
                                              tourPackage: data.tourPackage,
                                              flights: data.flights
                                          }
                                        : m
                                )
                            );
                        }
                    }
                }
            });

            // Stream Finished: finalize message state
            setMessages(prev =>
                prev.map(m =>
                    m.id === aiMsgId
                        ? {
                              ...m,
                              text: accumulatedText || finalResult?.reply || 'Here are the details for you!',
                              isStreaming: false,
                              ...(finalResult?.hotels && { hotels: finalResult.hotels }),
                              ...(finalResult?.tourPackage && { tourPackage: finalResult.tourPackage }),
                              ...(finalResult?.flights && { flights: finalResult.flights }),
                              ...(finalResult?.responseType && { responseType: finalResult.responseType }),
                              ...(finalResult?.action && { action: finalResult.action })
                          }
                        : m
                )
            );
        } catch (err: any) {
            if (err.name === 'AbortError') {
                console.log('[useChatStream] Stream stopped by user');
            } else {
                console.error('[useChatStream] Stream error:', err);
                options.onError?.(err);
                setMessages(prev =>
                    prev.map(m =>
                        m.id === aiMsgId
                            ? {
                                  ...m,
                                  text: accumulatedText || "Oops! I encountered a brief connection issue. Please try again! 🙏",
                                  isStreaming: false
                              }
                            : m
                    )
                );
            }
        } finally {
            setIsStreaming(false);
            setActiveToolText(null);
            abortControllerRef.current = null;
        }
    }, [options]);

    return {
        isStreaming,
        activeToolText,
        sendStreamMessage,
        stopStreaming
    };
}
