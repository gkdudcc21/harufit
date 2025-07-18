import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../../api/apiClient'; // API 클라이언트 import
import './ManagerChat.css';

export default function ManagerChat({ mode, shouldFocusInput, triggerSource }) {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: '안녕하세요! 하루핏과 함께 건강해질 준비 되셨나요?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  //  스크롤과 입력창 포커스를 위한 ref 2개 생성
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null); // 입력창 참조를 위한 ref 추가

  //state: 특수 포커스 효과가 활성화될지 여부를 제어.
  const [isSpecialFocusActive, setIsSpecialFocusActive] = useState(false);
  // 특수 포커스 시 설정되는 초기 메시지를 저장 (해제 로직에 사용)
  const [initialMessageForFocus, setInitialMessageForFocus] = useState('');
  // 특수 포커스 시 설정되는 플레이스홀더 텍스트를 저장
  const [initialPlaceholderForFocus, setInitialPlaceholderForFocus] = useState('');

  // 메시지 목록이 변경될 때마다 맨 아래로 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // shouldFocusInput나 triggerSource이 변경될 때 포커스를 주도록  
  useEffect(() => {
    // shouldFocusInput 값 0보다 크거나(새로운 트리거 요청) triggerSource가 유효한 값으로 변경되었을 때 (이미 shouldFocusInput이 트리거된 후에도)
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

        setInput(messageToSet); // ✅ 동적으로 메시지 설정
        setInitialMessageForFocus(messageToSet); // 초기 메시지 저장
        setInitialPlaceholderForFocus(placeholderToSet); // 초기 플레이스홀더 저장

        // 특수 포커스 효과 활성화
        setIsSpecialFocusActive(true);

        // 😥디버깅용
        console.log('ManagerChat: isSpecialFocusActive TRUE로 설정됨'); 

        // 커서를 맨 뒤로 보내기 위한 지연
        setTimeout(() => {
          inputRef.current.setSelectionRange(inputRef.current.value.length, inputRef.current.value.length);
        }, 0);

        // 중요: 특수효과 적용된 후, HomepPage에 해당 트리거 초기화 요청
        // ManagerChat 내부에서 직접 HomePage의 state를 변경할 수 없으므로, HomePage에서 이 상태를 초기화할 수 있는 콜백함수를 ManagerChat에 prop으로 넘겨줘함! 일단 여기서는 특수 포커스 활성 상태를 false로 바로 되돌림.
        // (이후 HomePage에서 shouldFocusInput을 다시 0으로 초기화하는 로직이 필요할 수 있음. 현재는 HomePage의 shouldFocusInput은 ManagerChat이 독립적 처리하지 않고, HomePage에서 Chat페이지로 전환되는 신호로 사용되므로, ManagerChat에서 초기화하지 않고 className='focused'만 제어하는 isSpecialFocusActive를 사용.)
      }
    }
  }, [shouldFocusInput, triggerSource]);  

  // input값 변경(사용자 타이핑 시작) 시 특수포커스 비활성화
  useEffect(() => {
    // 초기 메시지가 설정되어 있는 경우에만 비교
    if (isSpecialFocusActive && initialMessageForFocus && input !== initialMessageForFocus) {
      setIsSpecialFocusActive(false); 
    }
  }, [input, isSpecialFocusActive, initialMessageForFocus]);


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
    // 메시지 전송 후에는 항상 특수 포커스 효과 비활성화
    setIsSpecialFocusActive(false);

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
      // 로딩이 끝난 후 다시 일반적인 포커스 유지
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
        {/* isSpecialFocusActive 상태에 따라 'focused' 클래스 적용 */}
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
}
