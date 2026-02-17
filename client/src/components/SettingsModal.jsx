import { useThemeStore } from '../store/themeStore';

export default function SettingsModal({ isOpen, onClose }) {
  const { 
    boardTheme, 
    tokenSkin, 
    soundEnabled, 
    themes, 
    tokenSkins,
    setBoardTheme, 
    setTokenSkin, 
    toggleSound 
  } = useThemeStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b-2 border-gray-200 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold">⚙️ Settings</h2>
            <button
              onClick={onClose}
              className="text-3xl hover:scale-110 transition-transform"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Board Theme */}
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              🎨 Board Theme
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(themes).map(([key, theme]) => (
                <button
                  key={key}
                  onClick={() => setBoardTheme(key)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    boardTheme === key
                      ? 'border-primary bg-blue-50 scale-105'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className={`w-full h-20 rounded ${theme.boardBg} ${theme.borderColor} border-2 mb-2`}></div>
                  <div className="text-sm font-semibold">{theme.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Token Skins */}
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              🎭 Token Skins
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(tokenSkins).map(([key, skin]) => (
                <button
                  key={key}
                  onClick={() => setTokenSkin(key)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    tokenSkin === key
                      ? 'border-primary bg-blue-50 scale-105'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex justify-center space-x-1 mb-2">
                    <span className="text-2xl">{skin.red}</span>
                    <span className="text-2xl">{skin.green}</span>
                    <span className="text-2xl">{skin.blue}</span>
                    <span className="text-2xl">{skin.yellow}</span>
                  </div>
                  <div className="text-sm font-semibold">{skin.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Sound Settings */}
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              🔊 Sound Effects
            </h3>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-semibold">Enable Sound Effects</div>
                <div className="text-sm text-gray-600">
                  Dice rolls, token moves, and captures
                </div>
              </div>
              <button
                onClick={toggleSound}
                className={`relative w-16 h-8 rounded-full transition-colors ${
                  soundEnabled ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                    soundEnabled ? 'translate-x-9' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Avatar Upload (Coming Soon) */}
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              👤 Avatar
            </h3>
            <div className="p-6 bg-gray-50 rounded-lg text-center">
              <div className="text-5xl mb-3">🎨</div>
              <div className="font-semibold text-gray-700">Custom Avatars</div>
              <div className="text-sm text-gray-500 mt-1">Coming Soon!</div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 p-6 rounded-b-2xl">
          <button
            onClick={onClose}
            className="btn-primary w-full"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
}
