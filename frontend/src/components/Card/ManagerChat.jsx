import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../../api/apiClient'; // API 클라이언트 import
import './ManagerChat.css';  

export default function ManagerChat({ mode }) {
    const [messages, setMessages] = useState([
        { sender: 'ai', text: '안녕하세요! 하루핏과 함께 건강해질 준비 되셨나요?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // ✅ 1. 스크롤과 입력창 포커스를 위한 ref 2개 생성
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null); // 입력창 참조를 위한 ref 추가

    // 메시지 목록이 변경될 때마다 맨 아래로 스크롤
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    // ✅ 2. 로딩 상태가 변경될 때마다 입력창에 포커스를 주는 useEffect 추가
    useEffect(() => {
        // 로딩이 끝났을 때(false) 입력창에 포커스를 줍니다.
        if (!isLoading) {
            inputRef.current?.focus();
        }
    }, [isLoading]);


    // 메시지 전송 처리 함수
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { sender: 'user', text: input };
        
        const historyForApi = messages.map(msg => ({
            role: msg.sender === 'ai' ? 'assistant' : 'user',
            content: msg.text
        }));

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
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
                {/* ✅ 3. 생성한 inputRef를 input 태그에 연결 */}
                <input
                    ref={inputRef}
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
