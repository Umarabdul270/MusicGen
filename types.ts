export enum ProcessStep {
  UPLOAD = 'UPLOAD',
  TRANSLATE = 'TRANSLATE',
  REMIX = 'REMIX',
  VIDEO = 'VIDEO',
  PREVIEW = 'PREVIEW',
}

export interface Language {
    code: string;
    name: string;
    mood: string;
}

export const VEO_POLLING_MESSAGES = [
    "Warming up the visual synthesizers...",
    "Teaching the AI about cinematography...",
    "Rendering pixel by pixel...",
    "Compositing scenes from lyrical concepts...",
    "Syncing visuals with the rhythm...",
    "This is taking a bit longer than usual, the AI is being extra creative!",
    "Finalizing the color grade...",
    "Almost there, adding the final touches of digital magic..."
];
