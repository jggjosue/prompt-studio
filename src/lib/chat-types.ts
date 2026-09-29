export type ChatMode = 'image' | 'video' | 'project' | 'vision' | 'text' | 'videoUnderstanding';
export type MessageRole = 'user' | 'assistant' | 'system';
export type MessageStatus = 'pending' | 'completed' | 'failed';

export type GenerationStatus = 'queued' | 'generating' | 'uploading' | 'completed' | 'failed';
export interface GenerationEntry {
  jobId: string;
  status: GenerationStatus;
  imageUrl?: string;
  error?: string;
  progressMessage?: string;
  creditsUsed?: number;
  provider: string;
}

export interface ChatParams {
  imageStyle?: string; imageRatio?: string; imageRes?: string; imageFormat?: string;
  imageLighting?: string; imageCamera?: string; imageCFG?: number; imageSteps?: number;
  imageNegative?: string; imageLens?: string; imageComposition?: string; imageRealism?: number;
  imageColors?: string; imageVariationPack?: boolean; referenceImage?: string;
  referenceInstructions?: string;
  videoMotion?: string; videoCamera?: string; videoDuration?: number; videoFPS?: number;
  videoInterpolation?: boolean; videoStyle?: string; videoAspect?: string;
  webFramework?: string; webTheme?: string; webComponent?: string; webColor?: string;
  webModel?: string; webPages?: number;
  model?: string; provider?: string; aspectRatio?: string; generationTier?: string;
  thinkingLevel?: string; systemInstruction?: string;
  // Video understanding params
  videoInputMethod?: string; videoProcessingMode?: string;
  youtubeUrl?: string; videoUrl?: string;
  videoBase64?: string; videoMimeType?: string;
  startOffset?: number; endOffset?: number; fps?: number;
}

export interface ChatMessageResult {
  imageUrl?: string; imageUrls?: string[];
  videoUrl?: string;
  html?: string;
  text?: string;
  error?: string;
  creditsUsed?: number;
  costUsd?: number;
  provider?: string;
}

export interface ChatGeneratorMessage {
  id: string; role: 'user' | 'assistant'; mode: ChatMode; prompt: string;
  params: ChatParams; result?: ChatMessageResult; status: 'pending' | 'completed' | 'failed'; progress: number;
}

export interface ChatSession {
  id?: string; userId: string; title: string; mode: ChatMode;
  messages?: ChatGeneratorMessage[]; isArchived?: boolean;
  createdAt?: Date; updatedAt?: Date;
}

export type ChatQueueStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface ChatQueueItem {
  id: string; prompt: string; mode: ChatMode; status: ChatQueueStatus; progress: number;
  params: ChatParams;
  result?: ChatMessageResult; error?: string;
}

export interface ChatGeneratorReturn {
  messages: ChatGeneratorMessage[];
  params: ChatParams;
  draftPrompt: string;
  setDraftPrompt: (prompt: string) => void;
  setParams: (params: ChatParams | ((previous: ChatParams) => ChatParams)) => void;
  sessions: Array<{ id: string; title: string; mode: ChatMode }>;
  activeSessionId: string | null;
  createSession: () => Promise<void>;
  loadSession: (id: string) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  selectedMode: ChatMode;
  setSelectedMode: (m: ChatMode) => void;
  localGenerating: boolean;
  genProgress: number;
  genStatus: string;
  generationError: { title: string; message: string } | null;
  outputImageUrl: string;
  outputImageVariations: Array<{ label: string; url: string }>;
  outputVideoUrl: string;
  outputWebHTML: string;
  copiedCode: boolean;
  generate: (prompt: string, params: ChatParams, mode: ChatMode) => Promise<string>;
  reset: () => void;
  queue: ChatQueueItem[];
  queueRunning: boolean;
  enqueue: (prompt: string) => boolean;
  startQueue: () => void;
  removeQueueItem: (id: string) => void;
  retryQueueItem: (id: string) => void;
  clearQueue: () => void;
  imageGen: {
    imageProvider: 'openai' | 'fal' | 'google'; setImageProvider: (p: 'openai' | 'fal' | 'google') => void;
    openAIKey: string; setOpenAIKey: (k: string) => void; replicateKey: string; setReplicateKey: (k: string) => void;
    vertexKey: string; setVertexKey: (k: string) => void; credits: number; setCredits: (c: number) => void;
    generations: Map<string, GenerationEntry>; updateGeneration: (jobId: string, patch: Partial<GenerationEntry>) => void;
  };
  videoGen: any;
  webGen: any;
  visionGen: any;
  textGen: any;
  videoUnderstandingGen: any;
  setOutputImageUrl: (url: string) => void;
  setOutputImageVariations: (v: Array<{ label: string; url: string }>) => void;
  setOutputVideoUrl: (url: string) => void;
  setOutputWebHTML: (h: string) => void;
  setCopiedCode: (c: boolean) => void;
  setCredits: (c: number) => void;
}

export type ChatMessage = ChatGeneratorMessage;
