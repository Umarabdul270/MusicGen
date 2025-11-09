import React, { useState, useCallback, useEffect } from 'react';
import { ProcessStep, Language, VEO_POLLING_MESSAGES } from './types';
import { TARGET_LANGUAGES } from './constants';
import { translateLyrics, generateVideo } from './services/geminiService';
import { StepIndicator } from './components/StepIndicator';
import { FileUpload } from './components/FileUpload';
import { ProcessingView } from './components/ProcessingView';
import { ResultView } from './components/ResultView';
import { ApiKeySelector } from './components/ApiKeySelector';

// In a real environment, the `window.aistudio` object would be provided by the host.
// The type declaration was removed as it was conflicting with an existing one.
declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

const App: React.FC = () => {
  const [step, setStep] = useState<ProcessStep>(ProcessStep.UPLOAD);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [lyrics, setLyrics] = useState<string>('');
  const [language, setLanguage] = useState<Language>(TARGET_LANGUAGES[0]);
  const [translatedLyrics, setTranslatedLyrics] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progressMessage, setProgressMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [apiKeySelected, setApiKeySelected] = useState<boolean>(false);

  const checkApiKey = useCallback(async () => {
    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setApiKeySelected(hasKey);
      return hasKey;
    }
    // Fallback for local development or if aistudio is not available
    if (process.env.API_KEY) {
      setApiKeySelected(true);
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    checkApiKey();
  }, [checkApiKey]);

  const handleReset = () => {
    setStep(ProcessStep.UPLOAD);
    setAudioFile(null);
    setLyrics('');
    setLanguage(TARGET_LANGUAGES[0]);
    setTranslatedLyrics('');
    setVideoUrl('');
    setIsLoading(false);
    setProgressMessage('');
    setError(null);
  };

  const handleStartProcessing = useCallback(async () => {
    if (!lyrics || !language) return;

    // VEO requires API key selection
    const hasKey = await checkApiKey();
    if (!hasKey) {
        setError("Please select an API key to proceed with video generation.");
        return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Translate Lyrics
      setStep(ProcessStep.TRANSLATE);
      setProgressMessage('Translating lyrics with cultural adaptation...');
      const translated = await translateLyrics(lyrics, language.name);
      setTranslatedLyrics(translated);

      // Step 2: Simulate Remixing Audio
      setStep(ProcessStep.REMIX);
      setProgressMessage('Enhancing, remixing, and mastering audio...');
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate delay

      // Step 3: Generate Video
      setStep(ProcessStep.VIDEO);
      const videoPrompt = `Create a short, visually stunning music video that captures the essence of these lyrics: "${translated.substring(0, 200)}...". The mood should be ${language.mood}.`;
      
      // FIX: Changed NodeJS.Timeout to number for browser compatibility.
      let pollingInterval: number | null = null;
      const updatePollingMessage = () => {
        setProgressMessage(VEO_POLLING_MESSAGES[Math.floor(Math.random() * VEO_POLLING_MESSAGES.length)]);
      };
      updatePollingMessage();
      pollingInterval = setInterval(updatePollingMessage, 5000);

      try {
        const url = await generateVideo(videoPrompt);
        setVideoUrl(url);
        setStep(ProcessStep.PREVIEW);
      } catch (videoError: any) {
        if (videoError?.message?.includes('Requested entity was not found')) {
            setError("API key not found or invalid. Please select your key again.");
            setApiKeySelected(false);
            setStep(ProcessStep.UPLOAD); // Go back to start
        } else {
            throw videoError;
        }
      } finally {
        if (pollingInterval) clearInterval(pollingInterval);
      }
      
    } catch (e: any) {
      console.error(e);
      setError(`An error occurred: ${e.message}`);
      setStep(ProcessStep.UPLOAD);
    } finally {
      setIsLoading(false);
      setProgressMessage('');
    }
  }, [lyrics, language, checkApiKey]);

  const renderContent = () => {
    if (!apiKeySelected && step !== ProcessStep.UPLOAD) {
        return <ApiKeySelector onKeySelected={() => { setApiKeySelected(true); setError(null); }} />;
    }

    if (error && step === ProcessStep.UPLOAD) {
        return (
            <div className="text-center">
                 <p className="text-red-400 bg-red-900/50 p-4 rounded-lg mb-4">{error}</p>
                 { !apiKeySelected && <ApiKeySelector onKeySelected={() => { setApiKeySelected(true); setError(null); handleStartProcessing(); }} /> }
            </div>
        );
    }
      
    if (isLoading) {
      return <ProcessingView step={step} message={progressMessage} />;
    }
    
    switch (step) {
      case ProcessStep.UPLOAD:
        return (
          <FileUpload
            audioFile={audioFile}
            setAudioFile={setAudioFile}
            lyrics={lyrics}
            setLyrics={setLyrics}
            language={language}
            setLanguage={setLanguage}
            onProcess={handleStartProcessing}
            apiKeySelected={apiKeySelected}
          />
        );
      case ProcessStep.PREVIEW:
        return (
          <ResultView
            translatedLyrics={translatedLyrics}
            videoUrl={videoUrl}
            onReset={handleReset}
            language={language}
          />
        );
      default:
        // This case covers TRANSLATE, REMIX, VIDEO when not loading (i.e., in an error state before loading finishes)
        // It's a fallback, but the isLoading check should normally catch these states.
        return <ProcessingView step={step} message={progressMessage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-500">
            AI Music Platform
          </h1>
          <p className="mt-2 text-lg text-gray-400">Translate, Remix, and Visualize Your Music for the World.</p>
        </header>

        <main className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl shadow-purple-500/10 p-6 sm:p-8 border border-gray-700">
          <StepIndicator currentStep={step} />
          <div className="mt-8 min-h-[400px] flex items-center justify-center">
            {renderContent()}
          </div>
        </main>
        <footer className="text-center mt-8 text-gray-500 text-sm">
            <p>Powered by Gemini & Veo</p>
        </footer>
      </div>
    </div>
  );
};

export default App;