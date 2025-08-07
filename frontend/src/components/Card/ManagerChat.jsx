
import React, { useState, useEffect, useRef, memo } from 'react';
import apiClient from '../../api/apiClient';
import './ManagerChat.css';

const ManagerChat = memo(function ManagerChat({ mode, shouldFocusInput, triggerSource, onDataRefresh, systemMessage }) {
    const [messages, setMessages] = useState(() => {
        try {
            const savedMessages = localStorage.getItem('chatMessages');
            return savedMessages ? JSON.parse(savedMessages) : [];
        } catch (error) { 
            console.error("localStorage 파싱 오류", error); 
            return []; 
        }
    });

    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSpecialFocusActive, setIsSpecialFocusActive] = useState(false);
    const [initialMessageForFocus, setInitialMessageForFocus] = useState('');
    const [initialPlaceholderForFocus, setInitialPlaceholderForFocus] = useState('');

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    
    useEffect(() => {
        const initChat = () => {
            const userNickname = localStorage.getItem('userNickname') || '게스트';
            const userMode = localStorage.getItem('userMode');
            const modeDescriptions = { easy: "편안한 시작", normal: "꾸준한 관리", hard: "강력한 변화" };
            let initialMessages = [ { sender: 'ai', text: `안녕하세요! ${userNickname}님, 하루핏과 함께 건강해질 준비 되셨나요?` } ];
            if (userMode) {
                initialMessages.push({ sender: 'ai', text: `'${userMode.toUpperCase()}' 모드를 선택하셨군요. '${modeDescriptions[userMode]}'를 목표로 함께 나아가요!` });
            }
            setMessages(initialMessages);
        };
        const savedMessages = localStorage.getItem('chatMessages');
        if (!savedMessages || JSON.parse(savedMessages).length === 0) {
            initChat();
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('chatMessages', JSON.stringify(messages));
    }, [messages]);

    useEffect(() => {
        if (systemMessage && systemMessage.text) {
            if (messages.length === 0 || messages[messages.length - 1].text !== systemMessage.text) {
                setMessages(prevMessages => [...prevMessages, systemMessage]);
            }
        }
    }, [systemMessage]);
    
    useEffect(() => {
        if (!isLoading) { inputRef.current?.focus(); }
    }, [isLoading]);

    const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };
    useEffect(scrollToBottom, [messages]);

    useEffect(() => {
        if (shouldFocusInput > 0 && triggerSource) {
            if (inputRef.current) {
                inputRef.current.focus();
                let messageToSet = '';
                let placeholderToSet = '';
                switch (triggerSource) {
                    case 'diet': messageToSet = "오늘 식단 기록할게요: "; placeholderToSet = "오늘 식단 기록을 시작해보세요!"; break;
                    case 'workout': messageToSet = "오늘 운동 기록할게요: "; placeholderToSet = "오늘 운동 기록을 시작해보세요!"; break;
                    case 'status': messageToSet = "오늘 상태 기록할게요: "; placeholderToSet = "오늘 상태 기록을 시작해보세요!"; break;
                    default: messageToSet = ""; placeholderToSet = "메시지를 입력하세요..."; break;
                }
                setInput(messageToSet);
                setInitialMessageForFocus(messageToSet);
                setInitialPlaceholderForFocus(placeholderToSet);
                setIsSpecialFocusActive(true);
                setTimeout(() => { inputRef.current.setSelectionRange(inputRef.current.value.length, inputRef.current.value.length); }, 0);
            }
        }
    }, [shouldFocusInput, triggerSource]);

    useEffect(() => {
        if (isSpecialFocusActive && initialMessageForFocus && input !== initialMessageForFocus) {
            setIsSpecialFocusActive(false);
        }
    }, [input, isSpecialFocusActive, initialMessageForFocus]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        const userMessage = { sender: 'user', text: input };
        const historyForApi = messages.map(msg => ({ role: msg.sender === 'ai' ? 'assistant' : 'user', content: msg.text }));
        setMessages(prev => [...prev, userMessage]);
        setInput(''); 
        setIsLoading(true);
        try {
            const response = await apiClient.post('/ai/parse-and-log', { message: userMessage.text, history: historyForApi });

            // 1. AI의 핵심 답변을 먼저 표시.
            const aiReplyMessage = { sender: 'ai', text: response.data.reply };
            setMessages(prev => [...prev, aiReplyMessage]);

            const savedData = response.data.savedData;
            
            // 2. 백엔드로부터 받은 데이터(기록 또는 추천)가 있다면, 무조건 HomePage로 전달하여 UI를 업데이트.
            if (savedData && savedData.length > 0) {
                if (onDataRefresh) {
                    onDataRefresh(savedData);
                }

                // 3. 데이터의 종류가 '기록'일 경우에만 추가적인 확인 메시지를 표시.
                const dataType = savedData[0].type;
                if (dataType !== 'diet_recommendation' && dataType !== 'water_goal_update') {
                     let successText = '말씀하신 내용을 바탕으로 정보를 업데이트했어요! 👍';
                     switch (dataType) {
                        case 'diet': successText = '말씀하신 내용을 바탕으로 식단 정보를 기록했어요! 🍽️'; break;
                        case 'workout': successText = '말씀하신 내용을 바탕으로 운동 정보를 기록했어요! 💪'; break;
                        case 'status': successText = '말씀하신 내용을 바탕으로 상태 정보를 업데이트했어요! 📊'; break;
                        case 'water': successText = '물 섭취량을 기록했어요! 💧'; break;
                    }
                    const successLogMessage = { sender: 'ai', text: successText };
                    setMessages(prev => [...prev, successLogMessage]);
                }
            }
            
            // 4. AI가 추가 질문을 한 경우, 해당 질문 표시.
            if (response.data.clarification) {
                const clarificationMessage = { sender: 'ai', text: response.data.clarification };
                setMessages(prev => [...prev, clarificationMessage]);
            }

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
                {isLoading && ( <div className="message ai"><div className="bubble typing-indicator"><span></span><span></span><span></span></div></div> )}
                <div ref={messagesEndRef} />
            </div>
            <form className="chat-input-form" onSubmit={handleSendMessage}>
                <input
                    className={`chat-input ${isSpecialFocusActive ? 'focused' : ''}`}
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isSpecialFocusActive ? initialPlaceholderForFocus : "메시지를 입력하세요..."}
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoading} className="chat-send-btn">전송</button>
            </form>
        </div>
    );
});

export default ManagerChat;