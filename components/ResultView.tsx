import React from 'react';
import { Language } from '../types';
import { DownloadIcon } from './IconComponents';

interface ResultViewProps {
  translatedLyrics: string;
  videoUrl: string;
  onReset: () => void;
  language: Language;
}

export const ResultView: React.FC<ResultViewProps> = ({
  translatedLyrics,
  videoUrl,
  onReset,
  language
}) => {
    const downloadLyrics = () => {
        const blob = new Blob([translatedLyrics], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `translated_lyrics_${language.code}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
  return (
    <div className="w-full animate-fade-in space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Video Player */}
            <div className="w-full">
                <h3 className="text-lg font-semibold text-gray-200 mb-2">AI Generated Music Video</h3>
                <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-lg">
                    {videoUrl ? (
                         <video src={videoUrl} controls className="w-full h-full object-cover"></video>
                    ): (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                           Loading video...
                        </div>
                    )}
                </div>
            </div>
            {/* Translated Lyrics */}
            <div>
                 <h3 className="text-lg font-semibold text-gray-200 mb-2">{language.name} Lyrics</h3>
                 <div className="h-64 bg-gray-900/50 p-4 rounded-lg overflow-y-auto border border-gray-700">
                    <pre className="text-gray-300 whitespace-pre-wrap font-sans text-sm">{translatedLyrics}</pre>
                 </div>
            </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <button
                onClick={downloadLyrics}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
            >
                <DownloadIcon className="w-5 h-5" /> Download Lyrics
            </button>
            <a
                href={videoUrl}
                download="ai_music_video.mp4"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
                <DownloadIcon className="w-5 h-5" /> Download Video
            </a>
            <button
                onClick={onReset}
                className="w-full sm:w-auto px-6 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
            >
                Create Another
            </button>
        </div>
    </div>
  );
};
