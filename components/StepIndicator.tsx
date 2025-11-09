import React from 'react';
import { ProcessStep } from '../types';
import { UploadIcon, TranslateIcon, RemixIcon, VideoIcon, PreviewIcon } from './IconComponents';

interface StepIndicatorProps {
  currentStep: ProcessStep;
}

const steps = [
  { id: ProcessStep.UPLOAD, name: 'Upload', icon: UploadIcon },
  { id: ProcessStep.TRANSLATE, name: 'Translate', icon: TranslateIcon },
  { id: ProcessStep.REMIX, name: 'Remix', icon: RemixIcon },
  { id: ProcessStep.VIDEO, name: 'Visualize', icon: VideoIcon },
  { id: ProcessStep.PREVIEW, name: 'Preview', icon: PreviewIcon },
];

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const currentIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center">
        {steps.map((step, stepIdx) => (
          <li key={step.name} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
            {stepIdx < currentIndex ? (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-indigo-600" />
                </div>
                <div className="relative flex h-8 w-8 items-center justify-center bg-indigo-600 rounded-full">
                  <step.icon className="w-5 h-5 text-white" />
                </div>
              </>
            ) : stepIdx === currentIndex ? (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-gray-600" />
                </div>
                <div className="relative flex h-8 w-8 items-center justify-center bg-indigo-600 rounded-full ring-4 ring-indigo-500/50">
                  <step.icon className="w-5 h-5 text-white" />
                </div>
              </>
            ) : (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-gray-600" />
                </div>
                <div className="relative flex h-8 w-8 items-center justify-center bg-gray-700 rounded-full">
                  <step.icon className="w-5 h-5 text-gray-400" />
                </div>
              </>
            )}
            <span className="absolute -bottom-7 text-xs text-center w-full left-1/2 -translate-x-1/2 text-gray-300">{step.name}</span>
          </li>
        ))}
      </ol>
    </nav>
  );
};
