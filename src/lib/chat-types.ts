export type ChatMode = 'image' | 'video' | 'project';
export type MessageRole = 'user' | 'assistant' | 'system';
export type MessageStatus = 'pending' | 'completed' | 'failed';

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
  model?: string; provider?: string; aspectRatio?: string;
  generationTier?: 'fast' | 'quality' | 'pro' | 'cinematic' | 'advanced';
}

export interface ChatMessageResult {
  imageUrl?: string; imageUrls?: string[];
  videoUrl?: string;
  html?: string;
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
  imageGen: {
    imageProvider: 'openai' | 'fal' | 'google'; setImageProvider: (p: 'openai' | 'fal' | 'google') => void;
    openAIKey: string; setOpenAIKey: (k: string) => void; replicateKey: string; setReplicateKey: (k: string) => void;
    vertexKey: string; setVertexKey: (k: string) => void; credits: number; setCredits: (c: number) => void;
  };
  videoGen: any;
  webGen: any;
  setOutputImageUrl: (url: string) => void;
  setOutputImageVariations: (v: Array<{ label: string; url: string }>) => void;
  setOutputVideoUrl: (url: string) => void;
  setOutputWebHTML: (h: string) => void;
  setCopiedCode: (c: boolean) => void;
  setCredits: (c: number) => void;
}

export type ChatMessage = ChatGeneratorMessage;
