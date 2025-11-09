import React from 'react';
import { Language } from '../types';
import { TARGET_LANGUAGES } from '../constants';
import { UploadCloudIcon, MusicIcon } from './IconComponents';

interface FileUploadProps {
  audioFile: File | null;
  setAudioFile: (file: File | null) => void;
  lyrics: string;
  setLyrics: (lyrics: string) => void;
  language: Language;
  setLanguage: (language: Language) => void;
  onProcess: () => void;
  apiKeySelected: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  audioFile,
  setAudioFile,
  lyrics,
  setLyrics,
  language,
  setLanguage,
  onProcess,
  apiKeySelected,
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
    }
  };

  const isFormValid = lyrics.trim().length > 10 && audioFile !== null && apiKeySelected;

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in">
      <div className="space-y-6">
        {/* Audio Upload */}
        <div>
          <label htmlFor="audio-upload" className="block text-sm font-medium text-gray-300 mb-2">
            1. Upload Your Song
          </label>
          <div
            className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md cursor-pointer hover:border-indigo-500 transition-colors"
            onClick={() => document.getElementById('audio-upload')?.click()}
          >
            <div className="space-y-1 text-center">
              {audioFile ? (
                <>
                    <MusicIcon className="mx-auto h-12 w-12 text-green-400" />
                    <p className="text-sm text-gray-300">{audioFile.name}</p>
                    <p className="text-xs text-gray-500">Click to replace</p>
                </>
              ) : (
                <>
                  <UploadCloudIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-400">
                    <span className="relative font-medium text-indigo-400">
                      <span>Click to upload</span>
                      <input id="audio-upload" name="audio-upload" type="file" className="sr-only" accept="audio/*" onChange={handleFileChange} />
                    </span>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">MP3, WAV, FLAC up to 50MB</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Lyrics Input */}
        <div>
          <label htmlFor="lyrics" className="block text-sm font-medium text-gray-300">
            2. Enter Your Lyrics
          </label>
          <div className="mt-1">
            <textarea
              id="lyrics"
              name="lyrics"
              rows={6}
              className="shadow-sm block w-full sm:text-sm bg-gray-900 border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500"
              placeholder="Paste your original song lyrics here..."
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
            />
          </div>
        </div>

        {/* Language Selector */}
        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-300">
            3. Choose Target Language
          </label>
          <select
            id="language"
            name="language"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-900 border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={language.code}
            onChange={(e) => {
                const selectedLang = TARGET_LANGUAGES.find(l => l.code === e.target.value);
                if (selectedLang) setLanguage(selectedLang);
            }}
          >
            {TARGET_LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-8">
        <button
          type="button"
          onClick={onProcess}
          disabled={!isFormValid}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 transition-all transform hover:scale-105"
        >
          Globalize My Song
        </button>
        {!apiKeySelected && (
            <p className="text-center text-xs text-yellow-400 mt-2">Please select an API key via the popup to enable this button.</p>
        )}
      </div>
    </div>
  );
};
