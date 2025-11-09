import React from 'react';

interface ApiKeySelectorProps {
  onKeySelected: () => void;
}

export const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelected }) => {
  const handleSelectKey = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      try {
        await window.aistudio.openSelectKey();
        // Assume selection is successful and trigger the callback
        onKeySelected();
      } catch (e) {
        console.error("Error opening API key selector:", e);
      }
    } else {
        alert("API key selection is not available in this environment.");
    }
  };

  return (
    <div className="w-full text-center p-6 bg-yellow-900/20 border border-yellow-700 rounded-lg">
      <h3 className="text-lg font-semibold text-yellow-300">Action Required</h3>
      <p className="mt-2 text-sm text-yellow-400">
        Video generation with Veo requires you to select your own API key. 
        This ensures you are aware of any potential billing implications.
      </p>
      <p className="mt-1 text-xs text-yellow-500">
          For more information, see the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-300">billing documentation</a>.
      </p>
      <div className="mt-4">
        <button
          onClick={handleSelectKey}
          className="px-5 py-2.5 text-sm font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 focus:ring-4 focus:outline-none focus:ring-yellow-800"
        >
          Select API Key
        </button>
      </div>
    </div>
  );
};
