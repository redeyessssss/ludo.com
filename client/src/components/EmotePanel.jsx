import { useState } from 'react';

export default function EmotePanel({ onEmote, playerColor }) {
  const [isOpen, setIsOpen] = useState(false);

  const emotes = [
    { emoji: '👍', label: 'Nice!' },
    { emoji: '😂', label: 'LOL' },
    { emoji: '😮', label: 'Wow!' },
    { emoji: '😢', label: 'Sad' },
    { emoji: '😡', label: 'Angry' },
    { emoji: '🎉', label: 'GG!' },
    { emoji: '🤔', label: 'Thinking' },
    { emoji: '😎', label: 'Cool' },
  ];

  const handleEmote = (emote) => {
    onEmote(emote);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-secondary px-4 py-2 text-2xl"
        title="Send Emote"
      >
        😊
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-full mb-2 right-0 bg-white rounded-lg shadow-2xl p-3 z-50 border-2 border-gray-200">
            <div className="grid grid-cols-4 gap-2">
              {emotes.map((emote) => (
                <button
                  key={emote.emoji}
                  onClick={() => handleEmote(emote)}
                  className="text-3xl hover:scale-125 transition-transform p-2 hover:bg-gray-100 rounded"
                  title={emote.label}
                >
                  {emote.emoji}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function EmoteDisplay({ emote, playerName, playerColor }) {
  const colorClasses = {
    red: 'bg-red-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
  };

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-emote-pop">
      <div className={`${colorClasses[playerColor]} text-white px-6 py-3 rounded-full shadow-2xl`}>
        <div className="text-5xl mb-2 text-center">{emote.emoji}</div>
        <div className="text-sm font-semibold text-center">{playerName}</div>
      </div>
    </div>
  );
}
