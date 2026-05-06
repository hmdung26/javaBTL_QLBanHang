import { FormEvent, useState } from 'react';
import { Bot, MessageCircle, Send, X } from 'lucide-react';
import { sendChatMessage } from '../services/AiService';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Xin chao, toi co the tu van cau hinh PC, san pham va quy trinh dat hang cho ban.',
    },
  ]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    setMessages((current) => [...current, { role: 'user', content: trimmedMessage }]);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage(trimmedMessage);
      setMessages((current) => [...current, { role: 'assistant', content: response.answer }]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: 'Chưa kết nối được AI. Kiểm tra GEMINI_API_KEY trên backend.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen && (
        <div className="animate-chat-pop mb-3 w-[calc(100vw-40px)] max-w-sm overflow-hidden rounded-md border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-slate-950 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-yellow-300" />
              <span className="font-black uppercase">AI tu van</span>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} className="rounded p-1 hover:bg-white/10">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-80 space-y-3 overflow-y-auto bg-slate-50 p-3">
            {messages.map((item, index) => (
              <div
                key={`${item.role}-${index}`}
                className={[
                  'rounded-md px-3 py-2 text-sm leading-6',
                  item.role === 'user'
                    ? 'ml-10 bg-[#d71920] text-white'
                    : 'mr-10 border border-slate-200 bg-white text-slate-700',
                ].join(' ')}
              >
                {item.content}
              </div>
            ))}
            {isLoading && <p className="text-sm text-slate-500">AI đang trả lời...</p>}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2 border-t border-slate-200 p-3">
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Hoi ve cau hinh, bao hanh, dat hang..."
              className="min-w-0 flex-1 rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#d71920]"
            />
            <button type="submit" className="grid h-10 w-10 place-items-center rounded bg-[#d71920] text-white">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="animate-chat-pulse grid h-14 w-14 place-items-center rounded-full bg-[#d71920] text-white shadow-xl"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </div>
  );
}

export default ChatWidget;
