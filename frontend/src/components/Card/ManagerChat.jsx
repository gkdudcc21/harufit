import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../../api/apiClient'; // API 클라이언트 import
import './ManagerChat.css';  

export default function ManagerChat({ mode }) {
    // 대화 기록, 사용자 입력, 로딩 상태를 관리하는 state 추가
    const [messages, setMessages] = useState([
        { sender: 'ai', text: '안녕하세요! 하루핏과 함께 건강해질 준비 되셨나요?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // 메시지 목록이 변경될 때마다 맨 아래로 스크롤
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(scrollToBottom, [messages]);

    // 메시지 전송 처리 함수
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { sender: 'user', text: input };
        
        // 이전 대화 기록을 AI에게 보낼 형식으로 변환
        const historyForApi = messages.map(msg => ({
            role: msg.sender === 'ai' ? 'assistant' : 'user',
            content: msg.text
        }));

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // 백엔드의 AI 채팅 API 호출
            const response = await apiClient.post('/ai/chat', {
                message: userMessage.text,
                history: historyForApi
            });
            const aiMessage = { sender: 'ai', text: response.data.reply };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage = { sender: 'ai', text: '죄송해요, 지금은 답변하기 어려워요.' };
            setMessages(prev => [...prev, errorMessage]);
            console.error("AI 채팅 오류:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // JSX 구조를 실제 채팅창에 맞게 변경
        <div className="manager-chat-container">
            <div className={`manager-card-header ${mode}-theme`}>하루핏 AI 매니저</div>
            <div className="chat-messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.sender}`}>
                        <div className="bubble">{msg.text}</div>
                    </div>
                ))}
                {isLoading && (
                    <div className="message ai">
                        <div className="bubble typing-indicator">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <form className="chat-input-form" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="메시지를 입력하세요..."
                    disabled={isLoading}
                    className="chat-input"
                />
                <button type="submit" disabled={isLoading} className="chat-send-btn">전송</button>
            </form>
        </div>
    );
}