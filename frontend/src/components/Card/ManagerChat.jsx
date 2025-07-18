import React, { useState, useEffect, useRef, memo } from 'react'; // ✅ [수정] memo import 추가
import apiClient from '../../api/apiClient';
import './ManagerChat.css';

// ✅ [수정] memo를 직접 사용
const ManagerChat = memo(function ManagerChat({ mode, shouldFocusInput, triggerSource, onDataRefresh, systemMessage }) {
    const [messages, setMessages] = useState(() => {
        try {
            const savedMessages = localStorage.getItem('chatMessages');
            if (savedMessages) {
                return JSON.parse(savedMessages);
            }
        } catch (error) {
            console.error("Failed to parse chat messages from localStorage", error);
        }
        const userNickname = localStorage.getItem('userNickname') || '게스트';
        const welcomeMessage = {
            sender: 'ai',
            text: `안녕하세요! ${userNickname}님, 하루핏과 함께 건강해질 준비 되셨나요?`
        };
        return [welcomeMessage];
    });

    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSpecialFocusActive, setIsSpecialFocusActive] = useState(false);
    const [initialMessageForFocus, setInitialMessageForFocus] = useState('');
    const [initialPlaceholderForFocus, setInitialPlaceholderForFocus] = useState('');

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const modeDescriptions = {
        easy: "편안한 시작",
        normal: "꾸준한 관리",
        hard: "강력한 변화",
    };

    useEffect(() => {
        const savedMessages = localStorage.getItem('chatMessages');
        if (!savedMessages || !JSON.parse(savedMessages).some(msg => msg.sender === 'ai' && msg.text.includes('안녕하세요!'))) {
            const userNickname = localStorage.getItem('userNickname') || '게스트';
            const userMode = localStorage.getItem('userMode') || 'normal';
            const welcomeMessage = {
                sender: 'ai',
                text: `안녕하세요! ${userNickname}님, 하루핏과 함께 건강해질 준비 되셨나요?`
            };
            const modeInfoMessage = {
                sender: 'ai',
                text: `'${userMode.toUpperCase()}' 모드를 선택하셨군요. '${modeDescriptions[userMode]}'를 목표로 함께 나아가요!`
            };
            setMessages([welcomeMessage, modeInfoMessage]);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('chatMessages', JSON.stringify(messages));
    }, [messages]);

    useEffect(() => {
        if (systemMessage && systemMessage.text) {
            setMessages(prevMessages => [...prevMessages, systemMessage]);
        }
    }, [systemMessage]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    useEffect(scrollToBottom, [messages]);
    useEffect(() => {
        if (shouldFocusInput > 0 && triggerSource) {
            if (inputRef.current) {
                inputRef.current.focus();
                let messageToSet = '';
                let placeholderToSet = '';
                switch (triggerSource) {
                    case 'diet':
                        messageToSet = "오늘 식단 기록할게요: ";
                        placeholderToSet = "오늘 식단 기록을 시작해보세요!";
                        break;
                    case 'workout':
                        // ✅ [수정] message_to_set -> messageToSet
                        // ✅ [수정] placeholder_to_set -> placeholderToSet
                        messageToSet = "오늘 운동 기록할게요: ";
                        placeholderToSet = "오늘 운동 기록을 시작해보세요!";
                        break;
                    case 'status':
                        messageToSet = "오늘 상태 기록할게요: ";
                        placeholderToSet = "오늘 상태 기록을 시작해보세요!";
                        break;
                    default:
                        messageToSet = "";
                        placeholderToSet = "메시지를 입력하세요...";
                        break;
                }
                setInput(messageToSet);
                setInitialMessageForFocus(messageToSet);
                setInitialPlaceholderForFocus(placeholderToSet);
                setIsSpecialFocusActive(true);
                setTimeout(() => {
                    inputRef.current.setSelectionRange(inputRef.current.value.length, inputRef.current.value.length);
                }, 0);
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
        const historyForApi = messages.map(msg => ({
            role: msg.sender === 'ai' ? 'assistant' : 'user',
            content: msg.text
        }));

        setMessages(prev => [...prev, userMessage]); // 사용자 메시지 먼저 추가

        setInput('');
        setIsLoading(true);
        setIsSpecialFocusActive(false);

        try {
            const response = await apiClient.post('/ai/parse-and-log', {
                message: userMessage.text,
                history: historyForApi,
            });

            const aiReplyMessage = { sender: 'ai', text: response.data.reply };
            let newMessagesBatch = [aiReplyMessage];

            if (response.data.savedData && response.data.savedData.length > 0) {
                const successLogMessage = { sender: 'ai', text: '말씀하신 내용을 바탕으로 식단/운동 정보를 기록했어요! 👍' };
                newMessagesBatch.push(successLogMessage);
            }

            setMessages(prev => [...prev, ...newMessagesBatch]); // 모든 AI 관련 메시지를 한 번에 추가

            // 데이터 새로고침을 딜레이 시켜 메시지 표시 후 깜빡임 발생
            if (response.data.savedData && response.data.savedData.length > 0 && onDataRefresh) {
                setTimeout(() => { // 딜레이 추가 (예: 500ms)
                    onDataRefresh();
                }, 500); // 0.5초 후 데이터 새로고침 시작
            }

        } catch (error) {
            const errorMessage = { sender: 'ai', text: '죄송해요, 지금은 답변하기 어려워요.' };
            setMessages(prev => [...prev, errorMessage]);
            console.error("AI 채팅 오류:", error);
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
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
                <input className={`chat-input ${isSpecialFocusActive ? 'focused' : ''}`}
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
}); // ✅ [수정] 함수 닫는 괄호와 세미콜론

export default ManagerChat; // ✅ [수정] export default 문