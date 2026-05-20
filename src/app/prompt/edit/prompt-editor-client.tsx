'use client';

import { handleImageGeneration, proxyOpenAIImage, proxyOpenAIChat, proxyAnthropicChat, proxyRunwayStart, proxyRunwayPoll, proxyVeoVideo, proxyGemini, type ImageGenerationFormState } from '@/app/actions';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { 
  Clapperboard, 
  ClipboardPaste, 
  Image as ImageIcon, 
  Loader2, 
  Sparkles, 
  Globe, 
  Code, 
  Eye, 
  Copy, 
  Check, 
  Wand2, 
  Sliders, 
  Trash2, 
  Play,
  Settings2,
  Tv,
  MessageSquare,
  Send,
  KeyRound
} from 'lucide-react';
import { OptimizedImage } from '@/components/optimized-image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useActionState, useEffect, useState, useTransition, useRef } from 'react';

// Sample video placeholders to simulate dynamic generation
const sampleVideos = [
  'https://assets.mixkit.co/videos/44883/44883-720.mp4',
  'https://assets.mixkit.co/videos/5399/5399-720.mp4',
  'https://assets.mixkit.co/videos/45204/45204-720.mp4',
  'https://assets.mixkit.co/videos/48889/48889-720.mp4',
  'https://assets.mixkit.co/videos/48574/48574-720.mp4',
];

// Helper to generate custom landing page HTML templates for Web previews
function generateMockLandingHTML(promptText: string, framework: string, theme: string, component: string, color: string): string {
  const title = promptText.split('.')[0]?.substring(0, 60) || "AI-Powered Landing Page";
  const desc = promptText.substring(0, 200) || "Experience the future of design and content creation. Render components instantly with state-of-the-art AI layouts.";
  
  const bgClass = theme === 'dark' ? 'bg-slate-950 text-slate-50' : 
                  theme === 'neon' ? 'bg-black text-cyan-400 font-mono' :
                  theme === 'glassmorphism' ? 'bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white' :
                  'bg-slate-50 text-slate-900';

  const accentColor = color === 'emerald' ? 'emerald-500' :
                      color === 'rose' ? 'rose-500' :
                      color === 'amber' ? 'amber-500' :
                      'indigo-500';

  const textAccent = `text-${accentColor}`;
  const bgAccent = `bg-${accentColor}`;
  const hoverBgAccent = `hover:bg-${color}-600`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <title>${title}</title>
</head>
<body class="${bgClass} min-h-screen flex flex-col justify-between">
  
  <!-- Header -->
  <header class="border-b ${theme === 'glassmorphism' ? 'border-white/10 bg-white/5 backdrop-blur-md' : 'border-slate-800/10'} p-4">
    <div class="max-w-6xl mx-auto flex justify-between items-center">
      <div class="font-bold text-xl flex items-center gap-2">
        <span class="${textAccent}">⚡</span> DesignEngine
      </div>
      <nav class="hidden md:flex gap-6 text-sm">
        <a href="#" class="hover:opacity-80 transition">Features</a>
        <a href="#" class="hover:opacity-80 transition">Pricing</a>
        <a href="#" class="hover:opacity-80 transition">Docs</a>
      </nav>
      <button class="${bgAccent} text-white px-4 py-2 rounded-lg text-sm font-semibold transition ${hoverBgAccent}">
        Get Started
      </button>
    </div>
  </header>

  <!-- Content Block: ${component} -->
  <main class="flex-grow max-w-6xl mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
    ${component === 'hero' || component === 'full-page' ? `
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${theme === 'glassmorphism' ? 'bg-white/10 border border-white/10' : 'bg-slate-200/50 text-slate-800'} mb-6">
        <span>✨</span> Powered by ${framework}
      </div>
      <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight max-w-3xl mb-6">
        ${title}
      </h1>
      <p class="text-lg opacity-80 max-w-2xl mb-8">
        ${desc}
      </p>
      <div class="flex gap-4">
        <button class="${bgAccent} text-white px-8 py-3 rounded-xl font-semibold text-lg transition ${hoverBgAccent}">
          Try Free Demo
        </button>
        <button class="px-8 py-3 rounded-xl border ${theme === 'glassmorphism' ? 'border-white/20 bg-white/5 hover:bg-white/10' : 'border-slate-700 bg-transparent hover:bg-slate-800'} transition font-semibold text-lg">
          Learn More
        </button>
      </div>
    ` : component === 'pricing' ? `
      <h2 class="text-3xl md:text-5xl font-bold mb-4">Pricing Plans</h2>
      <p class="text-muted-foreground mb-12">Select the option that works best for your team.</p>
      <div class="grid md:grid-cols-2 gap-8 max-w-3xl w-full text-left">
        <div class="p-8 rounded-2xl border ${theme === 'glassmorphism' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} shadow-sm">
          <h3 class="text-xl font-bold mb-2">Starter</h3>
          <p class="text-3xl font-extrabold mb-4">$0 <span class="text-sm font-normal text-muted-foreground">/mo</span></p>
          <ul class="space-y-2.5 text-sm mb-8 opacity-80">
            <li>✓ 10 projects</li>
            <li>✓ 2GB storage</li>
            <li>✓ Community support</li>
          </ul>
          <button class="w-full py-2.5 rounded-lg border border-slate-300 font-semibold text-sm hover:bg-slate-50 transition">Get Started</button>
        </div>
        <div class="p-8 rounded-2xl border ${theme === 'glassmorphism' ? 'bg-white/10 border-white/20' : 'bg-slate-900 border-slate-800 text-white'} relative overflow-hidden">
          <div class="absolute top-0 right-0 ${bgAccent} text-white text-xs px-3 py-1 rounded-bl-lg font-bold">Popular</div>
          <h3 class="text-xl font-bold mb-2">Pro</h3>
          <p class="text-3xl font-extrabold mb-4">$29 <span class="text-sm font-normal opacity-70">/mo</span></p>
          <ul class="space-y-2.5 text-sm mb-8 opacity-90">
            <li>✓ Unlimited projects</li>
            <li>✓ 100GB storage</li>
            <li>✓ priority 24/7 support</li>
            <li>✓ API access</li>
          </ul>
          <button class="w-full py-2.5 rounded-lg ${bgAccent} text-white font-semibold text-sm ${hoverBgAccent} transition">Go Pro</button>
        </div>
      </div>
    ` : `
      <!-- Features Grid -->
      <h2 class="text-3xl md:text-4xl font-bold mb-12">Core Features</h2>
      <div class="grid md:grid-cols-3 gap-6 max-w-5xl w-full text-left">
        <div class="p-6 rounded-xl border ${theme === 'glassmorphism' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}">
          <div class="text-3xl mb-4">🚀</div>
          <h3 class="font-bold text-lg mb-2">Fast Performance</h3>
          <p class="text-sm opacity-80">Highly optimized asset loading and fast interactive responses.</p>
        </div>
        <div class="p-6 rounded-xl border ${theme === 'glassmorphism' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}">
          <div class="text-3xl mb-4">🛡️</div>
          <h3 class="font-bold text-lg mb-2">Secure & Reliable</h3>
          <p class="text-sm opacity-80">Robust data standards and military-grade authentication structures.</p>
        </div>
        <div class="p-6 rounded-xl border ${theme === 'glassmorphism' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}">
          <div class="text-3xl mb-4">🤖</div>
          <h3 class="font-bold text-lg mb-2">Smart Workflows</h3>
          <p class="text-sm opacity-80">Auto-triggers and integrations linked with modern AI APIs.</p>
        </div>
      </div>
    `}
  </main>

  <!-- Footer -->
  <footer class="border-t ${theme === 'glassmorphism' ? 'border-white/10' : 'border-slate-800/10'} p-6 text-center text-xs opacity-60">
    &copy; 2026 DesignEngine. Custom rendering powered by AI.
  </footer>
</body>
</html>`;
}

export default function PromptEditorClient() {
  const searchParams = useSearchParams();
  const initialPromptQuery = searchParams.get('prompt') || '';
  
  // States
  const [rawPromptInput, setRawPromptInput] = useState(initialPromptQuery);
  const [editingText, setEditingText] = useState('');
  const [activeTab, setActiveTab] = useState('pure-text');

  // API Key States
  const [openAIKey, setOpenAIKey] = useState('');
  const [replicateKey, setReplicateKey] = useState('');
  const [vertexKey, setVertexKey] = useState('');
  const [runwayKey, setRunwayKey] = useState('');
  const [veoKey, setVeoKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [credits, setCredits] = useState(12.0);

  // Model States
  const [openAIChatModel, setOpenAIChatModel] = useState('gpt-4o');
  const [openAIImageModel, setOpenAIImageModel] = useState('dall-e-3');
  const [anthropicModel, setAnthropicModel] = useState('claude-3-5-sonnet-20240620');
  const [googleWebModel, setGoogleWebModel] = useState('gemini-1.5-flash');
  const [googleVeoModel, setGoogleVeoModel] = useState('veo-2.0-generate-001');
  const [falModel, setFalModel] = useState('fal-ai/flux/schnell');

  // Preferred API Provider States
  const [imageProvider, setImageProvider] = useState<'mock' | 'openai' | 'fal' | 'google'>('openai');
  const [videoProvider, setVideoProvider] = useState<'mock' | 'runway' | 'veo'>('runway');
  const [webProvider, setWebProvider] = useState<'mock' | 'anthropic' | 'openai' | 'google'>('openai');
  const [chatProvider, setChatProvider] = useState<'mock' | 'openai' | 'anthropic' | 'google'>('openai');

  // Sync state with localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOpenAIKey(localStorage.getItem('ps_openai_key') || '');
      setReplicateKey(localStorage.getItem('ps_replicate_key') || '');
      setVertexKey(localStorage.getItem('ps_vertex_key') || '');
      setRunwayKey(localStorage.getItem('ps_runway_key') || '');
      setVeoKey(localStorage.getItem('ps_veo_key') || '');
      setAnthropicKey(localStorage.getItem('ps_anthropic_key') || '');
      setImageProvider((localStorage.getItem('ps_image_provider') as any) || 'openai');
      setVideoProvider((localStorage.getItem('ps_video_provider') as any) || 'runway');
      setWebProvider((localStorage.getItem('ps_web_provider') as any) || 'openai');
      setChatProvider((localStorage.getItem('ps_chat_provider') as any) || 'openai');
      const savedCredits = localStorage.getItem('ps_credits');
      if (savedCredits !== null) {
        setCredits(parseFloat(savedCredits));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ps_openai_key', openAIKey);
    }
  }, [openAIKey]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ps_replicate_key', replicateKey);
    }
  }, [replicateKey]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ps_vertex_key', vertexKey);
    }
  }, [vertexKey]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ps_runway_key', runwayKey);
    }
  }, [runwayKey]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ps_veo_key', veoKey);
    }
  }, [veoKey]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ps_anthropic_key', anthropicKey);
    }
  }, [anthropicKey]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ps_image_provider', imageProvider);
    }
  }, [imageProvider]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ps_video_provider', videoProvider);
    }
  }, [videoProvider]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ps_web_provider', webProvider);
    }
  }, [webProvider]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ps_chat_provider', chatProvider);
    }
  }, [chatProvider]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ps_credits', credits.toString());
    }
  }, [credits]);
  
  // Chat States
  type ChatMessage = {
    id: string;
    sender: 'user' | 'assistant';
    text: string;
    timestamp: Date;
    suggestedPrompt?: string;
    promptType?: 'image' | 'video' | 'web' | 'general';
  };

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: '¡Hola! Escribe cualquier idea, tema o requerimiento de prompt y te ayudaré a expandirlo y optimizarlo. Además, podrás enviarlo directamente a las herramientas avanzadas de generación.',
      timestamp: new Date()
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatIsTyping, setChatIsTyping] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState<{
    id: string;
    text: string;
    type: 'image' | 'video' | 'web' | 'general';
    timestamp: Date;
  }[]>([]);
  
  // Parsed metadata from import detector
  const [importedMetadata, setImportedMetadata] = useState<{
    type: 'image' | 'video' | 'web' | 'text';
    title?: string;
    description?: string;
    imageUrl?: string;
    tags?: string[];
    stack?: string[];
  } | null>(null);

  // Advanced Option States - AI Image
  const [imageModel, setImageModel] = useState('nano-banana-pro');
  const [imageStyle, setImageStyle] = useState('cinematic');
  const [imageRatio, setImageRatio] = useState('1-1');
  const [imageRes, setImageRes] = useState('1k');
  const [imageFormat, setImageFormat] = useState('png');
  const [imageLighting, setImageLighting] = useState('volumetric');
  const [imageCamera, setImageCamera] = useState('eye-level');
  const [imageCFG, setImageCFG] = useState(7.5);
  const [imageSteps, setImageSteps] = useState(30);
  const [imageNegative, setImageNegative] = useState('blurry, low quality, distorted, extra limbs, bad anatomy, deformed');

  // Advanced Option States - AI Video
  const [videoModel, setVideoModel] = useState('chrono-animator');
  const [videoMotion, setVideoMotion] = useState('medium');
  const [videoCamera, setVideoCamera] = useState('none');
  const [videoDuration, setVideoDuration] = useState('8');
  const [videoFPS, setVideoFPS] = useState(30);
  const [videoInterpolation, setVideoInterpolation] = useState(true);
  const [videoStyle, setVideoStyle] = useState('photorealistic');
  const [videoAspect, setVideoAspect] = useState('16-9');

  // Advanced Option States - Web Landing
  const [webFramework, setWebFramework] = useState('nextjs');
  const [webTheme, setWebTheme] = useState('glassmorphism');
  const [webComponent, setWebComponent] = useState('hero');
  const [webColor, setWebColor] = useState('indigo');

  // Mock Generation UI flows
  const [isPending, startTransition] = useTransition();
  const [localGenerating, setLocalGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [genStatus, setGenStatus] = useState('');
  
  // Outputs
  const [outputImageUrl, setOutputImageUrl] = useState('');
  const [outputVideoUrl, setOutputVideoUrl] = useState('');
  const [outputWebHTML, setOutputWebHTML] = useState('');
  const [outputWebTab, setOutputWebTab] = useState<'preview' | 'code'>('preview');
  const [copiedCode, setCopiedCode] = useState(false);

  const { toast } = useToast();

  // State to hold user raw description (excluding advanced settings suffix)
  const [basePrompt, setBasePrompt] = useState(initialPromptQuery);

  // Helper to strip tags from text
  const stripTags = (text: string) => {
    let clean = text;
    const tags = [
      /,\s*cinematic style/i, /,\s*anime style/i, /,\s*surreal style/i, /,\s*watercolor style/i, /,\s*photography style/i, /,\s*sketch style/i,
      /,\s*volumetric lighting/i, /,\s*studio lighting/i, /,\s*neon lighting/i, /,\s*sunset lighting/i, /,\s*moody lighting/i,
      /,\s*eye-level shot/i, /,\s*close-up shot/i, /,\s*wide shot/i, /,\s*aerial shot/i,
      /,\s*1:1 aspect ratio/i, /,\s*16:9 aspect ratio/i, /,\s*9:16 aspect ratio/i, /,\s*4:3 aspect ratio/i, /,\s*21:9 aspect ratio/i,
      /,\s*1:1 video aspect ratio/i, /,\s*16:9 video aspect ratio/i, /,\s*9:16 video aspect ratio/i, /,\s*4:3 video aspect ratio/i, /,\s*21:9 video aspect ratio/i,
      /,\s*photorealistic style/i, /,\s*3d-animation style/i, /,\s*anime-movie style/i,
      /,\s*low motion/i, /,\s*medium motion/i, /,\s*high motion/i,
      /,\s*zoom-in/i, /,\s*zoom-out/i, /,\s*pan-left/i, /,\s*pan-right/i, /,\s*orbit/i,
      /,\s*zoom-in camera/i, /,\s*zoom-out camera/i, /,\s*pan-left camera/i, /,\s*pan-right camera/i, /,\s*orbit camera/i,
      /,\s*nextjs framework/i, /,\s*react framework/i, /,\s*html framework/i,
      /,\s*glassmorphism theme/i, /,\s*dark theme/i, /,\s*light theme/i, /,\s*neon theme/i,
      /,\s*indigo color/i, /,\s*emerald color/i, /,\s*rose color/i, /,\s*amber color/i,
      /,\s*hero layout/i, /,\s*pricing layout/i, /,\s*features layout/i, /,\s*full-page layout/i
    ];
    tags.forEach(re => {
      clean = clean.replace(re, '');
    });
    return clean.trim();
  };

  // Compile full prompt with settings
  const compilePrompt = (base: string, tab: string) => {
    let compiled = stripTags(base);
    if (!compiled) return '';

    if (tab === 'ai-image') {
      if (imageStyle) compiled += `, ${imageStyle} style`;
      if (imageLighting) compiled += `, ${imageLighting} lighting`;
      if (imageCamera) compiled += `, ${imageCamera} shot`;
      if (imageRatio) {
        const ratioLabel = imageRatio === '1-1' ? '1:1' : imageRatio === '16-9' ? '16:9' : imageRatio === '9-16' ? '9:16' : '4:3';
        compiled += `, ${ratioLabel} aspect ratio`;
      }
    } else if (tab === 'ai-video') {
      if (videoStyle) compiled += `, ${videoStyle} style`;
      if (videoMotion) compiled += `, ${videoMotion} motion`;
      if (videoCamera && videoCamera !== 'none') compiled += `, ${videoCamera} camera`;
      if (videoAspect) {
        const aspectLabel: Record<string, string> = { '16-9': '16:9', '9-16': '9:16', '1-1': '1:1', '4-3': '4:3', '21-9': '21:9' };
        compiled += `, ${aspectLabel[videoAspect] || '16:9'} video aspect ratio`;
      }
    } else if (tab === 'ai-web') {
      if (webFramework) compiled += `, ${webFramework} framework`;
      if (webTheme) compiled += `, ${webTheme} theme`;
      if (webColor) compiled += `, ${webColor} color`;
      if (webComponent) compiled += `, ${webComponent} layout`;
    }

    return compiled;
  };

  // Auto-update editing text when advanced settings change
  const initialSettingsMount = useRef(true);
  useEffect(() => {
    if (initialSettingsMount.current) {
      initialSettingsMount.current = false;
      return;
    }
    if (basePrompt) {
      setEditingText(compilePrompt(basePrompt, activeTab));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab,
    imageStyle, imageLighting, imageCamera, imageRatio,
    videoStyle, videoMotion, videoCamera, videoAspect,
    webFramework, webTheme, webColor, webComponent
  ]);

  // Smart Parser for Clipboard / Input text
  const parsePromptInput = (input: string) => {
    if (!input.trim()) {
      setImportedMetadata(null);
      setEditingText('');
      setBasePrompt('');
      return;
    }

    // 1. Check if JSON payload
    if (input.trim().startsWith('{') && input.trim().endsWith('}')) {
      try {
        const parsed = JSON.parse(input);
        const description = parsed.description || parsed.prompt || '';
        const title = parsed.title?.en || parsed.title || '';
        const tags = parsed.tags || [];
        const stack = parsed.stack || [];
        const imageUrl = parsed.imageUrl || '';
        
        let type: 'image' | 'video' | 'web' | 'text' = 'image';
        if (parsed.type === 'video' || tags.some((t: string) => t.toLowerCase() === 'video')) {
          type = 'video';
        } else if (parsed.type === 'web' || parsed.type === 'landing' || stack.length > 0) {
          type = 'web';
        }

        setImportedMetadata({
          type,
          title: typeof title === 'string' ? title : undefined,
          description: typeof description === 'string' ? description : undefined,
          imageUrl,
          tags,
          stack
        });
        
        // Auto-fill active editor text with the extracted clean prompt
        const cleanDesc = stripTags(description);
        setBasePrompt(cleanDesc);
        setEditingText(description);
        setActiveTab(type === 'video' ? 'ai-video' : type === 'web' ? 'ai-web' : 'ai-image');
        
        if (tags.length > 0) {
          // Pre-select styling match
          const matchedStyle = tags[0].toLowerCase();
          if (['cinematic', 'anime', 'surreal', 'watercolor', 'photography', 'sketch'].includes(matchedStyle)) {
            setImageStyle(matchedStyle);
          }
        }
        return;
      } catch (e) {
        // Fall back to plain text parsing
      }
    }

    // 2. Plain text parsing rules
    const textLower = input.toLowerCase();
    let detectedType: 'image' | 'video' | 'web' | 'text' = 'text';
    
    if (textLower.includes('video') || textLower.includes('motion') || textLower.includes('pan left') || textLower.includes('zoom in') || textLower.includes('fps')) {
      detectedType = 'video';
      setActiveTab('ai-video');
    } else if (textLower.includes('html') || textLower.includes('react') || textLower.includes('landing page') || textLower.includes('navbar') || textLower.includes('tailwind') || textLower.includes('saas website')) {
      detectedType = 'web';
      setActiveTab('ai-web');
    } else {
      detectedType = 'image';
      setActiveTab('ai-image');
    }

    setImportedMetadata({
      type: detectedType,
      description: input,
    });
    const cleanInput = stripTags(input);
    setBasePrompt(cleanInput);
    setEditingText(input);
  };

  // Sync state when URL prompt loads
  useEffect(() => {
    if (initialPromptQuery) {
      setRawPromptInput(initialPromptQuery);
      parsePromptInput(initialPromptQuery);
    }
  }, [initialPromptQuery]);

  // Ref to hold the latest basePrompt without triggering re-runs while typing
  const basePromptRef = useRef(basePrompt);
  useEffect(() => {
    basePromptRef.current = basePrompt;
  }, [basePrompt]);

  // Update editingText automatically in the textarea only when settings or activeTab change
  useEffect(() => {
    const compiled = compilePrompt(basePromptRef.current, activeTab);
    setEditingText(prev => prev === compiled ? prev : compiled);
  }, [
    activeTab,
    imageStyle, imageLighting, imageCamera, imageRatio,
    videoStyle, videoMotion, videoCamera, videoAspect,
    webFramework, webTheme, webColor, webComponent
  ]);

  // Handle Clipboard Paste
  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setRawPromptInput(text);
        parsePromptInput(text);
        toast({
          title: 'Import Successful!',
          description: 'Loaded content and auto-detected settings.',
        });
      }
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Clipboard Access Blocked',
        description: 'Please paste your prompt directly into the input area.',
      });
    }
  };

  // Enhance prompt with detailed tokens based on settings
  const handleEnhancePrompt = () => {
    if (!editingText.trim()) {
      toast({
        variant: 'destructive',
        title: 'Empty prompt',
        description: 'Type or paste a prompt first to enhance it.',
      });
      return;
    }

    let enhanced = editingText.trim();
    if (activeTab === 'ai-image') {
      enhanced += `, in a gorgeous ${imageStyle} style`;
      enhanced += `, lit with detailed ${imageLighting} lighting`;
      enhanced += `, shot at ${imageCamera} angle`;
      enhanced += `, photorealistic rendering, highly detailed, octane render, 8k resolution, award-winning aesthetics`;
    } else if (activeTab === 'ai-video') {
      enhanced += `, cinematic high-fidelity video`;
      if (videoCamera !== 'none') {
        enhanced += `, dynamic ${videoCamera} camera movement`;
      }
      const aspectLabel: Record<string, string> = { '16-9': '16:9 horizontal landscape', '9-16': '9:16 vertical portrait', '1-1': '1:1 square', '4-3': '4:3 classic', '21-9': '21:9 ultra-wide cinematic' };
      enhanced += `, ${aspectLabel[videoAspect] || '16:9'} aspect ratio, styled as ${videoStyle}, smooth ${videoMotion} motion speed, 60fps slow-motion capture`;

    } else if (activeTab === 'ai-web') {
      enhanced += `, modern high-converting UI landing component, responsive structure built with ${webFramework} and styled in a premium ${webTheme} theme, showcasing a ${webColor} theme palette.`;
    }

    setEditingText(enhanced);
    toast({
      title: 'Prompt Optimized!',
      description: 'Appended rich style tokens and directives.',
    });
  };

  // Reset all editor parameters
  const handleClearAll = () => {
    setRawPromptInput('');
    setEditingText('');
    setBasePrompt('');
    setImportedMetadata(null);
    setOutputImageUrl('');
    setOutputVideoUrl('');
    setOutputWebHTML('');
    toast({
      title: 'Cleared',
      description: 'Reset editing states.',
    });
  };

  const handleSendChatMessage = async () => {
    const trimmed = chatInput.trim();
    if (!trimmed) return;

    // Validate keys based on the selected chatProvider
    if (chatProvider === 'openai' && !openAIKey) {
      toast({ variant: 'destructive', title: 'OpenAI Key Required', description: 'Enter your OpenAI API Key to chat.' });
      return;
    }
    if (chatProvider === 'anthropic' && !anthropicKey) {
      toast({ variant: 'destructive', title: 'Anthropic Key Required', description: 'Enter your Anthropic API Key to chat.' });
      return;
    }
    if (chatProvider === 'google' && !vertexKey) {
      toast({ variant: 'destructive', title: 'Google Gemini Key Required', description: 'Enter your Google Gemini API Key to chat.' });
      return;
    }

    // User Message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: trimmed,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatIsTyping(true);

    const promptInstructions = `You are a helpful AI Assistant. Respond directly and naturally to the user's request: "${trimmed}".
If the user asks a general question or makes a conversational request, provide your full answer in the "reply" field, and leave "enhanced_prompt" empty.
If the user explicitly asks you to generate or write an AI prompt for an image, video, or web page, provide a brief friendly explanation in "reply", the optimized prompt in "enhanced_prompt", and the category in "prompt_type".
Respond ALWAYS in JSON format with exactly three fields:
1. "reply": Your conversational response or explanation in Spanish.
2. "enhanced_prompt": The optimized prompt in English (if requested, otherwise empty string).
3. "prompt_type": The target category. Must be one of: "image", "video", "web", or "general".`;

    let reply = '';
    let enhanced = '';
    let promptType: 'image' | 'video' | 'web' | 'general' = 'general';
    let success = false;
    let errorMsg = '';

    if (chatProvider === 'openai') {
      try {
        const data = await proxyOpenAIChat(
          openAIKey,
          promptInstructions,
          trimmed,
          openAIChatModel
        );
        if (data && 'error' in data && data.error) {
          errorMsg = data.error;
        } else {
          const text = data.choices?.[0]?.message?.content || '';
          try {
            const parsed = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
            reply = parsed.reply || text;
            enhanced = parsed.enhanced_prompt || '';
            promptType = parsed.prompt_type || 'general';
          } catch {
            reply = text;
            enhanced = '';
            promptType = 'general';
          }
          success = true;
        }
      } catch (e: any) {
        console.error('Chat OpenAI Error:', e);
        errorMsg = e.message || 'Error executing OpenAI Chat request.';
      }
    } else if (chatProvider === 'anthropic') {
      try {
        const data = await proxyAnthropicChat(
          anthropicKey,
          promptInstructions,
          trimmed,
          anthropicModel
        );
        if (data && 'error' in data && data.error) {
          errorMsg = data.error;
        } else {
          const text = data.content?.[0]?.text || '';
          try {
            const parsed = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
            reply = parsed.reply || text;
            enhanced = parsed.enhanced_prompt || '';
            promptType = parsed.prompt_type || 'general';
          } catch {
            reply = text;
            enhanced = '';
            promptType = 'general';
          }
          success = true;
        }
      } catch (e: any) {
        console.error('Chat Anthropic Error:', e);
        errorMsg = e.message || 'Error executing Anthropic Chat request.';
      }
    } else if (chatProvider === 'google') {
      try {
        const data = await proxyGemini(
          vertexKey,
          promptInstructions + "\nIMPORTANT: Reply ONLY with valid JSON. No markdown backticks.",
          googleWebModel
        );
        if (data && 'error' in data && data.error) {
          errorMsg = data.error;
        } else {
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          try {
            const parsed = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
            reply = parsed.reply || text;
            enhanced = parsed.enhanced_prompt || '';
            promptType = parsed.prompt_type || 'general';
          } catch {
            reply = text;
            enhanced = '';
            promptType = 'general';
          }
          success = true;
        }
      } catch (e: any) {
        console.error('Chat Gemini Error:', e);
        errorMsg = e.message || 'Error executing Google Gemini request.';
      }
    } else if (chatProvider === 'mock') {
      // Local mock / sandbox conversational simulator
      const lower = trimmed.toLowerCase();
      
      if (lower.includes('hola') || lower.includes('buenos dias') || lower.includes('buenas tardes')) {
        reply = '¡Hola! ¿En qué puedo ayudarte hoy? Puedes hacerme preguntas, pedirme consejos sobre prompts o solicitarme que genere y optimice un prompt para ti.';
        promptType = 'general';
        enhanced = '';
      } else if (lower.includes('lista de prompts') || lower.includes('ejemplos de prompt') || lower.includes('prompts de ai') || lower.includes('prompts de ia')) {
        reply = 'Aquí tienes algunos ejemplos de prompts populares que puedes probar en Prompt Studio:\n\n1. **Imagen**: "A beautiful sunset over mountains, digital art style"\n2. **Video**: "Slow-motion drone shot of ocean waves breaking on rocks"\n3. **Web**: "Modern minimal portfolio landing page for a creative designer"\n\n¿Quieres que optimice alguno de estos para ti?';
        promptType = 'general';
        enhanced = '';
      } else if (lower.includes('video') || lower.includes('pelicula') || lower.includes('animacion') || lower.includes('motion') || lower.includes('movimiento') || lower.includes('dron') || lower.includes('drone')) {
        promptType = 'video';
        enhanced = `Cinematic video sequence: ${trimmed}, camera tracking pan left, slow motion, volumetric fog, high fidelity, 8k resolution, cinematic color grade.`;
        reply = `He optimizado tu idea para un **Video de IA**. Aquí tienes una propuesta enriquecida:`;
      } else if (lower.includes('web') || lower.includes('landing') || lower.includes('html') || lower.includes('sitio') || lower.includes('pagina') || lower.includes('saas') || lower.includes('interfaz') || lower.includes('ui') || lower.includes('componente')) {
        promptType = 'web';
        enhanced = `Modern responsive landing page for ${trimmed}, glassmorphism design, clean layout components, dark mode aesthetic, vibrant modern gradients, sleek icons.`;
        reply = `He optimizado tu idea para un **Prototipo Web**. Diseñé la siguiente propuesta de estructura:`;
      } else if (lower.includes('imagen') || lower.includes('foto') || lower.includes('dibujo') || lower.includes('ilustracion')) {
        promptType = 'image';
        enhanced = `A high-end cinematic photo of ${trimmed}, volumetric rays, dramatic lighting, shot on 85mm lens, f/1.4 aperture, hyperrealistic textures, highly aesthetic composition.`;
        reply = `He optimizado tu idea para una **Imagen de IA**. Agregué detalles fotográficos e iluminación:`;
      } else {
        reply = `Entendido. ¿Deseas que te ayude a crear un prompt detallado para Imagen, Video o Web sobre tu idea "${trimmed}"? Dime qué tipo de generación prefieres.`;
        promptType = 'general';
        enhanced = '';
      }
      success = true;
    }

    if (!success) {
      toast({
        variant: 'destructive',
        title: 'Chat Request Failed',
        description: errorMsg || 'Unable to get response from chosen AI provider.',
      });
      setChatIsTyping(false);
      return;
    }

    const assistantMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'assistant',
      text: reply,
      suggestedPrompt: enhanced || undefined,
      promptType,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, assistantMsg]);
    
    if (enhanced) {
      setSuggestedPrompts(prev => [
        {
          id: Date.now().toString(),
          text: enhanced,
          type: promptType,
          timestamp: new Date()
        },
        ...prev
      ]);
    }
    setChatIsTyping(false);
  };

  const handleLoadSuggestedPrompt = (promptText: string, type: 'image' | 'video' | 'web' | 'general') => {
    const cleanPrompt = stripTags(promptText);
    setBasePrompt(cleanPrompt);
    setEditingText(promptText);
    const targetTab = type === 'video' ? 'ai-video' : type === 'web' ? 'ai-web' : 'ai-image';
    setActiveTab(targetTab);
    toast({
      title: 'Prompt Loaded',
      description: `Refined prompt has been loaded into the ${type === 'web' ? 'Web Landing' : type === 'video' ? 'AI Video' : 'AI Image'} editor tab.`,
    });
  };

  // Copy Web HTML code to clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(outputWebHTML);
    setCopiedCode(true);
    toast({
      title: 'Copied!',
      description: 'Source code copied to your clipboard.',
    });
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Submit Generation
  const handleGenerationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Only block if using a real (non-mock) provider and no key is set
    const usingMock = (
      (activeTab === 'ai-image' && imageProvider === 'mock') ||
      (activeTab === 'ai-video' && videoProvider === 'mock') ||
      (activeTab === 'ai-web' && webProvider === 'mock') ||
      activeTab === 'pure-text'
    );
    if (!usingMock && !openAIKey && !anthropicKey && !vertexKey && !runwayKey && !veoKey && !replicateKey) {
      toast({
        variant: 'destructive',
        title: 'API Key Required',
        description: 'Please enter an API Key for the selected provider before generating.',
      });
      return;
    }

    if (activeTab === 'pure-text') {
      return;
    }

    if (!editingText.trim()) {
      toast({
        variant: 'destructive',
        title: 'Prompt Required',
        description: 'Provide an input prompt before generating.',
      });
      return;
    }

    // Validate provider keys before starting generation
    if (activeTab === 'ai-image') {
      if (imageProvider === 'openai' && !openAIKey) {
        toast({
          variant: 'destructive',
          title: 'OpenAI Key Required',
          description: 'Please set your OpenAI Key in the API Credentials accordion below.',
        });
        return;
      }
      if (imageProvider === 'fal' && !replicateKey) {
        toast({
          variant: 'destructive',
          title: 'Fal.ai Key Required',
          description: 'Please set your Fal.ai/Replicate Key in the API Credentials accordion below.',
        });
        return;
      }
      if (imageProvider === 'google' && !vertexKey) {
        toast({
          variant: 'destructive',
          title: 'Google Vertex Key Required',
          description: 'Please set your Google Vertex/Gemini Key in the API Credentials accordion below.',
        });
        return;
      }
    } else if (activeTab === 'ai-video') {
      if (videoProvider === 'runway' && !runwayKey) {
        toast({
          variant: 'destructive',
          title: 'Runway Key Required',
          description: 'Please set your Runway API Key in the API Credentials accordion below.',
        });
        return;
      }
      if (videoProvider === 'veo' && !veoKey) {
        toast({
          variant: 'destructive',
          title: 'Google Veo Key Required',
          description: 'Please set your Google Veo API Key in the API Credentials accordion below.',
        });
        return;
      }
    } else if (activeTab === 'ai-web') {
      if (webProvider === 'anthropic' && !anthropicKey) {
        toast({
          variant: 'destructive',
          title: 'Anthropic Key Required',
          description: 'Please set your Anthropic API Key in the API Credentials accordion below.',
        });
        return;
      }
      if (webProvider === 'openai' && !openAIKey) {
        toast({
          variant: 'destructive',
          title: 'OpenAI Key Required',
          description: 'Please set your OpenAI API Key in the API Credentials accordion below.',
        });
        return;
      }
      if (webProvider === 'google' && !vertexKey) {
        toast({
          variant: 'destructive',
          title: 'Google Gemini Key Required',
          description: 'Please set your Google Vertex/Gemini Key in the API Credentials accordion below.',
        });
        return;
      }
    }

    // Cost definition: Image = 1.0, Video = 3.0, Web = 2.0 credits
    const creditCost = activeTab === 'ai-video' ? 3.0 : activeTab === 'ai-web' ? 2.0 : 1.0;
    if (credits < creditCost) {
      toast({
        variant: 'destructive',
        title: 'Credits Exhausted',
        description: `This action requires ${creditCost.toFixed(1)} credits, but you only have ${credits.toFixed(1)}. Please reset your credits or configure custom keys.`,
      });
      return;
    }

    // Intercept client actions for mock flows (Video/Web)
    if (activeTab === 'ai-video') {
      // Validate key requirements for production models
      if (videoProvider === 'runway' && !runwayKey) {
        toast({ variant: 'destructive', title: 'Runway Key Required', description: 'Enter your Runway API Key in Advanced Design Settings to generate video.' });
        return;
      }
      if (videoProvider === 'veo' && !veoKey) {
        toast({ variant: 'destructive', title: 'Google Veo Key Required', description: 'Enter your Google Veo API Key in Advanced Design Settings to generate video.' });
        return;
      }

      setLocalGenerating(true);
      setGenProgress(10);

      // Assemble full prompt
      let finalPrompt = editingText;
      if (videoCamera) finalPrompt += `, camera motion: ${videoCamera}`;
      if (videoStyle) finalPrompt += `, style: ${videoStyle}`;

      let apiUsed = '';
      let videoOutputUrl = '';
      let apiError = '';

      if (videoProvider === 'runway' && runwayKey) {
        apiUsed = 'Runway Gen-3';
        setGenStatus('Initiating Runway Gen-3 task...');
        try {
          const data = await proxyRunwayStart(runwayKey, finalPrompt, parseInt(videoDuration) || 4);
          if (data && 'error' in data && data.error) {
            apiError = data.error;
          } else {
            const taskId = data.id;

            let completed = false;
            let attempts = 0;
            setGenStatus('Runway task queued. Polling video status...');
            
            while (!completed && attempts < 10) {
              attempts++;
              setGenProgress(20 + attempts * 7);
              await new Promise(resolve => setTimeout(resolve, 3000));
              
              try {
                const pollData = await proxyRunwayPoll(runwayKey, taskId);
                if (pollData && 'error' in pollData && pollData.error) {
                  throw new Error(pollData.error);
                } else if (pollData.status === 'SUCCEEDED') {
                  videoOutputUrl = pollData.output?.[0] || '';
                  completed = true;
                } else if (pollData.status === 'FAILED') {
                  throw new Error(pollData.error || 'Runway task failed');
                }
              } catch (pollErr: any) {
                // Ignore polling network errors and just try again on next loop
                console.warn('Runway poll error:', pollErr);
              }
            }
            if (!videoOutputUrl) {
              throw new Error('Timeout waiting for video generation.');
            }
          }
        } catch (err: any) {
          console.error('Runway error:', err);
          apiError = err.message || 'CORS restriction or network issue';
        }
      } else if (videoProvider === 'veo' && veoKey) {
        apiUsed = 'Google Veo';
        setGenStatus('Initiating Google Veo task...');
        try {
          const data = await proxyVeoVideo(veoKey, finalPrompt, parseInt(videoDuration) || 4, googleVeoModel);
          if (data && 'error' in data && data.error) {
            apiError = data.error;
          } else {
            videoOutputUrl = data.videoUri || data.generatedVideos?.[0]?.video?.videoBytes || '';
            if (videoOutputUrl && !videoOutputUrl.startsWith('http') && !videoOutputUrl.startsWith('data:')) {
              videoOutputUrl = `data:video/mp4;base64,${videoOutputUrl}`;
            }
          }
        } catch (err: any) {
          console.error('Google Veo error:', err);
          apiError = err.message || 'CORS restriction or network issue';
        }
      }

      if (videoProvider !== 'mock') {
        if (apiError || !videoOutputUrl) {
          toast({
            variant: 'destructive',
            title: `${apiUsed || 'Video'} Generation Failed`,
            description: apiError || 'Failed to obtain video output from provider.',
          });
          setLocalGenerating(false);
          return;
        }

        setOutputVideoUrl(videoOutputUrl);
        setCredits(prev => Math.max(0, prev - creditCost));
        setLocalGenerating(false);
        toast({
          title: 'Video Created!',
          description: `Successfully generated via ${apiUsed}. Deducted ${creditCost.toFixed(1)} credits.`,
        });
      } else {
        // Mock Sandbox mode execution
        setGenStatus('Synthesizing frames...');
        const interval = setInterval(() => {
          setGenProgress((prev) => {
            if (prev >= 90) {
              clearInterval(interval);
              return 90;
            }
            return prev + 20;
          });
        }, 400);

        setTimeout(() => {
          clearInterval(interval);
          setGenProgress(100);
          const randomVideo = sampleVideos[Math.floor(Math.random() * sampleVideos.length)];
          setOutputVideoUrl(randomVideo || '');
          setCredits(prev => Math.max(0, prev - creditCost));
          setLocalGenerating(false);
          toast({
            title: 'Video Created!',
            description: `AI Video rendered with selected physics assets (Sandbox). Deducted ${creditCost.toFixed(1)} credits.`,
          });
        }, 2000);
      }

      return;
    }

    if (activeTab === 'ai-web') {
      // Validate key requirements for production models
      if (webProvider === 'anthropic' && !anthropicKey) {
        toast({ variant: 'destructive', title: 'Anthropic Key Required', description: 'Enter your Anthropic API Key in Advanced Design Settings to generate code.' });
        return;
      }
      if (webProvider === 'openai' && !openAIKey) {
        toast({ variant: 'destructive', title: 'OpenAI Key Required', description: 'Enter your OpenAI API Key in Advanced Design Settings to generate code.' });
        return;
      }
      if (webProvider === 'google' && !vertexKey) {
        toast({ variant: 'destructive', title: 'Google Gemini Key Required', description: 'Enter your Google Gemini API Key in Advanced Design Settings to generate code.' });
        return;
      }

      setLocalGenerating(true);
      setGenProgress(10);

      // System instruction guidelines to produce beautiful code
      const systemInstruction = `You are a premium web developer and designer. 
Generate a fully responsive, visually stunning single-file HTML landing page utilizing Tailwind CSS.
Integrate modern design trends: smooth CSS gradients, custom Google fonts (Inter/Outfit), clean layout, card components, buttons with hover effects, micro-animations, and interactive navigation elements.
DO NOT include surrounding markdown explanation, ONLY return the full code block. Your response must begin with \`\`\`html and end with \`\`\`.
Requirements:
- Target Layout: ${webComponent === 'hero' ? 'Hero Header Section' : webComponent === 'pricing' ? 'Pricing plans grid' : webComponent === 'features' ? 'Features outline grid' : 'Complete Full Page Landing Layout'}
- Framework style: ${webFramework === 'nextjs' ? 'Next.js structure emulated' : webFramework === 'react' ? 'React component structure emulated' : 'HTML5 Bundle'}
- Theme: ${webTheme}
- Accent palette: ${webColor}
- Prompt: ${editingText}`;

      let apiUsed = '';
      let generatedHTML = '';
      let apiError = '';

      if (webProvider === 'anthropic' && anthropicKey) {
        apiUsed = 'Anthropic Claude-3.5-Sonnet';
        setGenStatus('Calling Anthropic API...');
        try {
          const data = await proxyAnthropicChat(
            anthropicKey,
            'You generate full, clean single-page HTML mockups using Tailwind CSS inside standard code blocks.',
            systemInstruction,
            anthropicModel
          );
          if (data && 'error' in data && data.error) {
            apiError = data.error;
          } else {
            generatedHTML = data.content?.[0]?.text || '';
          }
        } catch (err: any) {
          console.error('Anthropic API Error:', err);
          apiError = err.message || 'CORS or key validation error';
        }
      } else if (webProvider === 'openai' && openAIKey) {
        apiUsed = 'OpenAI GPT-4o';
        setGenStatus('Calling OpenAI Chat Completion...');
        try {
          const data = await proxyOpenAIChat(
            openAIKey,
            'You generate responsive HTML documents with inline styles and Tailwind CSS. Reply ONLY with the HTML block.',
            systemInstruction,
            openAIChatModel
          );
          if (data && 'error' in data && data.error) {
            apiError = data.error;
          } else {
            generatedHTML = data.choices?.[0]?.message?.content || '';
          }
        } catch (err: any) {
          console.error('OpenAI Web Generation Error:', err);
          apiError = err.message || 'CORS or key validation error';
        }
      } else if (webProvider === 'google' && vertexKey) {
        apiUsed = `Google ${googleWebModel}`;
        setGenStatus('Calling Google Gemini API...');
        try {
          const data = await proxyGemini(vertexKey, systemInstruction, googleWebModel);
          if (data && 'error' in data && data.error) {
            apiError = data.error;
          } else {
            generatedHTML = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          }
        } catch (err: any) {
          console.error('Gemini Web Generation Error:', err);
          apiError = err.message || 'CORS or key validation error';
        }
      }

      if (webProvider !== 'mock') {
        if (apiError || !generatedHTML) {
          toast({
            variant: 'destructive',
            title: `${apiUsed || 'Web'} Generation Failed`,
            description: apiError || 'Failed to generate code from provider.',
          });
          setLocalGenerating(false);
          return;
        }

        let cleanHTML = generatedHTML.trim();
        if (cleanHTML.startsWith('```html')) {
          cleanHTML = cleanHTML.substring(7);
        } else if (cleanHTML.startsWith('```')) {
          cleanHTML = cleanHTML.substring(3);
        }
        if (cleanHTML.endsWith('```')) {
          cleanHTML = cleanHTML.substring(0, cleanHTML.length - 3);
        }
        cleanHTML = cleanHTML.trim();

        setOutputWebHTML(cleanHTML);
        setCredits(prev => Math.max(0, prev - creditCost));
        setLocalGenerating(false);
        toast({
          title: 'Code Generated!',
          description: `Landing page fully rendered via ${apiUsed}. Deducted ${creditCost.toFixed(1)} credits.`,
        });
      } else {
        // Mock Sandbox mode execution
        setGenStatus('Applying Tailwind layouts & margins...');
        setGenProgress(40);
        
        setTimeout(() => {
          setGenStatus('Beautifying colors & micro-interactions...');
          setGenProgress(75);
          
          setTimeout(() => {
            setGenProgress(100);
            const htmlContent = generateMockLandingHTML(
              editingText,
              webFramework === 'nextjs' ? 'Next.js' : webFramework === 'react' ? 'React' : 'HTML5',
              webTheme,
              webComponent,
              webColor
            );
            setOutputWebHTML(htmlContent);
            setLocalGenerating(false);
            setCredits(prev => Math.max(0, prev - creditCost));
            toast({
              title: 'Code Generated!',
              description: `Landing markup rendered successfully (Sandbox). Deducted ${creditCost.toFixed(1)} credits.`,
            });
          }, 1000);
        }, 1000);
      }

      return;
    }

    // --- AI Image Generation flow with Live APIs ---
    // Validate key requirements for production models
    if (imageProvider === 'openai' && !openAIKey) {
      toast({ variant: 'destructive', title: 'OpenAI Key Required', description: 'Enter your OpenAI API Key in Advanced Design Settings to generate image.' });
      return;
    }
    if (imageProvider === 'fal' && !replicateKey) {
      toast({ variant: 'destructive', title: 'Fal.ai Key Required', description: 'Enter your Fal.ai API Key in Advanced Design Settings to generate image.' });
      return;
    }
    if (imageProvider === 'google' && !vertexKey) {
      toast({ variant: 'destructive', title: 'Google Gemini Key Required', description: 'Enter your Google Gemini API Key in Advanced Design Settings to generate image.' });
      return;
    }

    let apiUsed = 'Sura/Starlight XL';
    let imageOutputUrl = '';
    let apiError = '';

    setLocalGenerating(true);
    setGenProgress(10);

    // Compile final prompt with tags
    let finalPrompt = editingText;
    if (imageStyle) finalPrompt += `, ${imageStyle} style`;
    if (imageLighting) finalPrompt += `, ${imageLighting} lighting`;
    if (imageCamera) finalPrompt += `, ${imageCamera} shot`;

    if (imageProvider === 'openai' && openAIKey) {
      apiUsed = 'OpenAI DALL-E 3';
      try {
        setGenStatus('Calling OpenAI DALL-E 3...');
        setGenProgress(30);
        
        const data = await proxyOpenAIImage(openAIKey, finalPrompt, openAIImageModel);
        if (data && 'error' in data && data.error) {
          apiError = data.error;
        } else {
          setGenProgress(70);
          imageOutputUrl = data.data?.[0]?.url || '';
          setGenProgress(100);
        }
      } catch (err: any) {
        apiError = err.message || 'Error contacting OpenAI';
      }
    } else if (imageProvider === 'fal' && replicateKey) {
      apiUsed = 'Fal.ai Flux Schnell';
      try {
        setGenStatus('Calling Fal.ai Flux...');
        setGenProgress(30);
        
        const response = await fetch(`https://fal.run/${falModel}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': replicateKey.startsWith('Key ') || replicateKey.startsWith('Bearer ') ? replicateKey : `Key ${replicateKey}`
          },
          body: JSON.stringify({
            prompt: finalPrompt,
            image_size: 'square_hd',
            sync_mode: true
          })
        });
        setGenProgress(70);
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.detail || `HTTP ${response.status}`);
        }
        const data = await response.json();
        imageOutputUrl = data.images?.[0]?.url || '';
        setGenProgress(100);
      } catch (err: any) {
        apiError = err.message || 'Error contacting Fal.ai';
      }
    } else if (imageProvider === 'google' && vertexKey) {
      // Use Gemini text model to generate a detailed image description
      const geminiModel = googleWebModel || 'gemini-1.5-flash';
      apiUsed = `Google Gemini (${geminiModel})`;
      try {
        setGenStatus(`Calling ${geminiModel}...`);
        setGenProgress(30);
        const data = await proxyGemini(
          vertexKey,
          `You are an expert image generation AI. Given the following image prompt, describe in vivid detail what the generated image should look like, including composition, lighting, colors, mood, and style.\n\nPrompt: ${finalPrompt}`,
          geminiModel
        );
        if (data && 'error' in data && data.error) {
          apiError = data.error;
        } else {
          setGenProgress(70);
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            imageOutputUrl = `data:text/gemini,${encodeURIComponent(text)}`;
          } else {
            throw new Error('No content returned from Gemini');
          }
          setGenProgress(100);
        }
      } catch (err: any) {
        apiError = err.message || 'Error contacting Gemini API';
      }
    }

    if (imageProvider !== 'mock') {
      if (apiError || !imageOutputUrl) {
        toast({
          variant: 'destructive',
          title: `${apiUsed} Generation Failed`,
          description: apiError || 'Failed to obtain image output from provider.',
        });
        setLocalGenerating(false);
        return;
      }

      setOutputImageUrl(imageOutputUrl);
      setCredits(prev => Math.max(0, prev - creditCost));
      setLocalGenerating(false);
      toast({
        title: 'Image Created!',
        description: `Finished rendering via ${apiUsed}. Deducted ${creditCost.toFixed(1)} credits.`,
      });
    } else {
      // Mock Sandbox / Sura fallback mode
      setGenStatus('Running Sura fallback...');
      startTransition(async () => {
        const formData = new FormData();
        formData.append('prompt', finalPrompt);
        
        const result = await handleImageGeneration({ message: '', imageUrl: '' }, formData);
        setGenProgress(100);
        if (result.imageUrl) {
          setOutputImageUrl(result.imageUrl);
          setCredits(prev => Math.max(0, prev - creditCost));
          toast({
            title: 'Image Created!',
            description: `Finished rendering fallback Sura/Starlight outputs (Sandbox). Deducted ${creditCost.toFixed(1)} credits.`,
          });
        } else {
          toast({
            variant: 'destructive',
            title: 'Generation Failed',
            description: result.message || 'Error creating assets.',
          });
        }
        setLocalGenerating(false);
      });
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 py-8 md:py-12">
        <div className="container max-w-6xl px-4">
          
          {/* Header Area */}
          <div className="flex flex-col items-center text-center mb-8 space-y-3">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl font-headline text-balance bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
              Creative Prompt Studio Editor
            </h1>
            <p className="max-w-[700px] text-muted-foreground text-sm sm:text-base leading-relaxed">
              Design, test, and render your AI outputs. Automatically parses inputs from catalog links and custom copy-pasted parameters.
            </p>
          </div>

          {/* Smart Clipboard Info Dialog */}
          {importedMetadata && (
            <div className="mb-6 p-4 rounded-xl border bg-gradient-to-r from-purple-500/5 via-violet-500/5 to-indigo-500/5 dark:from-purple-500/10 dark:via-violet-500/10 dark:to-indigo-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                  {importedMetadata.type === 'video' ? (
                    <Clapperboard className="h-5 w-5" />
                  ) : importedMetadata.type === 'web' ? (
                    <Globe className="h-5 w-5" />
                  ) : (
                    <ImageIcon className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-foreground">
                      Imported {importedMetadata.type === 'video' ? 'AI Video' : importedMetadata.type === 'web' ? 'Web Landing' : 'AI Image'} Prompt
                    </span>
                    <Badge variant="secondary" className="text-[10px] py-0 px-2 font-semibold">
                      Parsed Automatically
                    </Badge>
                  </div>
                  {importedMetadata.title && (
                    <p className="text-xs font-semibold text-muted-foreground mt-0.5">
                      Title: {importedMetadata.title}
                    </p>
                  )}
                  {importedMetadata.tags && importedMetadata.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {importedMetadata.tags.slice(0, 6).map((tag) => (
                        <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <Button variant="outline" size="sm" className="text-xs h-8" onClick={handleClearAll}>
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Clear Prompt
                </Button>
              </div>
            </div>
          )}

          {/* Two-Column Editor Layout */}
          <form onSubmit={handleGenerationSubmit}>
            <div className="grid lg:grid-cols-12 gap-8">
              
              {/* Left Side: Options Column */}
              <div className="lg:col-span-7 space-y-6">
                <Card className="shadow-lg border bg-card text-card-foreground overflow-hidden">
                  <CardContent className="p-0">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      
                      {/* Subtype tabs */}
                      <TabsList className="flex w-full rounded-none border-b h-auto min-h-14 bg-muted/30 p-0 flex-wrap sm:flex-nowrap">
                        <TabsTrigger value="pure-text" className="flex-1 data-[state=active]:bg-background rounded-none sm:border-r border-b sm:border-b-0 text-[10px] sm:text-xs md:text-sm font-semibold gap-1 h-14 min-w-[50%] sm:min-w-0">
                          <MessageSquare className="h-4 w-4 text-pink-500" /> Chat
                        </TabsTrigger>
                        <TabsTrigger value="ai-image" className="flex-1 data-[state=active]:bg-background rounded-none sm:border-r border-b sm:border-b-0 text-[10px] sm:text-xs md:text-sm font-semibold gap-1 h-14 min-w-[50%] sm:min-w-0">
                          <ImageIcon className="h-4 w-4 text-sky-500" /> AI Image
                        </TabsTrigger>
                        <TabsTrigger value="ai-video" className="flex-1 data-[state=active]:bg-background rounded-none sm:border-r text-[10px] sm:text-xs md:text-sm font-semibold gap-1 h-14 min-w-[50%] sm:min-w-0">
                          <Clapperboard className="h-4 w-4 text-violet-500" /> AI Video
                        </TabsTrigger>
                        <TabsTrigger value="ai-web" className="flex-1 data-[state=active]:bg-background rounded-none text-[10px] sm:text-xs md:text-sm font-semibold gap-1 h-14 min-w-[50%] sm:min-w-0">
                          <Globe className="h-4 w-4 text-emerald-500" /> Web Landing
                        </TabsTrigger>
                      </TabsList>

                      <div className="p-4 sm:p-6 space-y-4">
                        {activeTab === 'pure-text' ? (
                          /* CHAT INTERFACE */
                          <div className="space-y-4 flex flex-col h-[520px]">
                            <div className="flex items-center justify-between border-b pb-2">
                              <div className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-pink-500" />
                                <span className="font-bold text-sm text-foreground">AI Prompt Assistant Chat</span>
                              </div>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                className="text-[10px] h-7 px-2 hover:bg-muted text-muted-foreground font-semibold"
                                onClick={() => {
                                  setChatMessages([
                                    {
                                      id: 'welcome',
                                      sender: 'assistant',
                                      text: '¡Hola! Escribe cualquier idea, tema o requerimiento de prompt y te ayudaré a expandirlo y optimizarlo. Además, podrás enviarlo directamente a las herramientas avanzadas de generación.',
                                      timestamp: new Date()
                                    }
                                  ]);
                                  setSuggestedPrompts([]);
                                }}
                              >
                                Clear Chat
                              </Button>
                            </div>

                            {/* Active API Provider / Model and API Key inside Chat Tab */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl border bg-muted/30">
                              <div className="space-y-1">
                                <Label className="text-[10px] font-bold text-pink-500 flex items-center gap-1.5">
                                  <KeyRound className="h-3.5 w-3.5" />
                                  Active API Provider / Model
                                </Label>
                                <Select
                                  value={chatProvider === 'mock' ? 'mock' : `${chatProvider === 'openai' ? 'openai-chat' : chatProvider}:${chatProvider === 'openai' ? openAIChatModel : chatProvider === 'anthropic' ? anthropicModel : googleWebModel}`}
                                  onValueChange={(val) => {
                                    if (val === 'mock') {
                                      setChatProvider('mock');
                                      return;
                                    }
                                    const [p, ...rest] = val.split(':'); const m = rest.join(':');
                                    if (p === 'openai-chat') {
                                      setChatProvider('openai');
                                      setOpenAIChatModel(m);
                                    }
                                    else if (p === 'anthropic') {
                                      setChatProvider('anthropic');
                                      setAnthropicModel(m);
                                    }
                                    else if (p === 'google') {
                                      setChatProvider('google');
                                      setGoogleWebModel(m);
                                    }
                                  }}
                                >
                                  <SelectTrigger className="text-xs h-8 bg-background font-semibold border-pink-500/30">
                                    <SelectValue placeholder="✨ Mock Sandbox (Free)" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="mock" className="text-xs font-semibold">✨ Mock Sandbox (Free)</SelectItem>
                                    <SelectItem value="openai-chat:gpt-4o" className="text-xs">🟢 OpenAI / gpt-4o</SelectItem>
                                    <SelectItem value="openai-chat:gpt-4o-mini" className="text-xs">🟢 OpenAI / gpt-4o-mini</SelectItem>
                                    <SelectItem value="openai-chat:gpt-4-turbo" className="text-xs">🟢 OpenAI / gpt-4-turbo</SelectItem>
                                    <SelectItem value="anthropic:claude-3-5-sonnet-20240620" className="text-xs">🔴 Anthropic / claude-3-5-sonnet-20240620</SelectItem>
                                    <SelectItem value="anthropic:claude-3-opus-20240229" className="text-xs">🔴 Anthropic / claude-3-opus-20240229</SelectItem>
                                    <SelectItem value="anthropic:claude-3-haiku-20240307" className="text-xs">🔴 Anthropic / claude-3-haiku-20240307</SelectItem>
                                    <SelectItem value="google:gemini-1.5-flash" className="text-xs">🔵 Google / gemini-1.5-flash</SelectItem>
                                    <SelectItem value="google:gemini-1.5-pro" className="text-xs">🔵 Google / gemini-1.5-pro</SelectItem>
                                    <SelectItem value="google:gemini-2.0-flash" className="text-xs">🔵 Google / gemini-2.0-flash</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-1">
                                {(() => {
                                  if (chatProvider === 'openai') return (
                                    <>
                                      <div className="flex items-center justify-between">
                                        <Label className="text-[10px] font-bold flex items-center gap-1 text-pink-500"><KeyRound className="h-3 w-3" />OpenAI API Key</Label>
                                        {openAIKey ? <span className="text-[9px] font-bold text-emerald-500">Active</span> : <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-[9px] text-blue-500 hover:underline">Get Key →</a>}
                                      </div>
                                      <Input type="password" placeholder="sk-proj-..." value={openAIKey} onChange={(e) => setOpenAIKey(e.target.value)} className="text-xs bg-background h-8 rounded-lg" />
                                    </>
                                  );
                                  if (chatProvider === 'anthropic') return (
                                    <>
                                      <div className="flex items-center justify-between">
                                        <Label className="text-[10px] font-bold flex items-center gap-1 text-pink-500"><KeyRound className="h-3 w-3" />Anthropic API Key</Label>
                                        {anthropicKey ? <span className="text-[9px] font-bold text-emerald-500">Active</span> : <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" className="text-[9px] text-blue-500 hover:underline">Get Key →</a>}
                                      </div>
                                      <Input type="password" placeholder="sk-ant-..." value={anthropicKey} onChange={(e) => setAnthropicKey(e.target.value)} className="text-xs bg-background h-8 rounded-lg" />
                                    </>
                                  );
                                  if (chatProvider === 'google') return (
                                    <>
                                      <div className="flex items-center justify-between">
                                        <Label className="text-[10px] font-bold flex items-center gap-1 text-pink-500"><KeyRound className="h-3 w-3" />Google Gemini API Key</Label>
                                        {vertexKey ? <span className="text-[9px] font-bold text-emerald-500">Active</span> : <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-[9px] text-blue-500 hover:underline">Get Key →</a>}
                                      </div>
                                      <Input type="password" placeholder="AI Studio Key..." value={vertexKey} onChange={(e) => setVertexKey(e.target.value)} className="text-xs bg-background h-8 rounded-lg" />
                                    </>
                                  );
                                  return (
                                    <>
                                      <Label className="text-[10px] font-bold text-muted-foreground">API Key</Label>
                                      <Input type="password" placeholder="No API key required for Sandbox" disabled className="text-xs bg-background h-8 rounded-lg opacity-60" />
                                    </>
                                  );
                                })()}
                              </div>
                            </div>

                            {/* Chat Message Scrollbox */}
                            <div className="flex-grow overflow-y-auto space-y-4 p-4 rounded-xl border bg-muted/10 max-h-[300px] min-h-[220px] select-text">
                              {chatMessages.map((msg) => (
                                <div key={msg.id} className="space-y-1">
                                  <div className={`flex items-start ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`p-3 rounded-2xl max-w-[85%] text-sm ${
                                      msg.sender === 'user' 
                                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-sm font-semibold' 
                                        : 'bg-muted/80 text-foreground border rounded-tl-none shadow-sm'
                                    }`}>
                                      <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                                      
                                      {msg.suggestedPrompt && (
                                        <div className="mt-3 p-3 rounded-lg bg-card text-card-foreground border border-border space-y-2 text-xs text-left">
                                          <p className="text-muted-foreground font-sans font-bold text-[10px] uppercase tracking-wider">Suggested Prompt:</p>
                                          <div className="whitespace-pre-wrap select-all font-mono leading-relaxed bg-muted/40 p-2 rounded border">{msg.suggestedPrompt}</div>
                                          <div className="flex flex-wrap gap-2 pt-1">
                                            <Button 
                                              type="button"
                                              size="sm"
                                              variant="secondary"
                                              className="h-7 text-[10px] font-semibold gap-1"
                                              onClick={() => {
                                                navigator.clipboard.writeText(msg.suggestedPrompt || '');
                                                toast({ title: 'Prompt Copied!' });
                                              }}
                                            >
                                              <Copy className="h-3 w-3" /> Copy
                                            </Button>
                                            <Button 
                                              type="button"
                                              size="sm"
                                              variant="default"
                                              className="h-7 text-[10px] font-semibold gap-1 bg-pink-600 hover:bg-pink-700 text-white"
                                              onClick={() => handleLoadSuggestedPrompt(msg.suggestedPrompt || '', msg.promptType || 'general')}
                                            >
                                              <Wand2 className="h-3 w-3" /> Load in Editor
                                            </Button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <span className={`text-[10px] text-muted-foreground block ${msg.sender === 'user' ? 'text-right mr-1' : 'text-left ml-1'}`}>
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              ))}

                              {chatIsTyping && (
                                <div className="flex items-center justify-start gap-1 p-3 rounded-2xl rounded-tl-none max-w-[80px] bg-muted/80 border">
                                  <span className="w-1.5 h-1.5 bg-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                  <span className="w-1.5 h-1.5 bg-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                  <span className="w-1.5 h-1.5 bg-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                              )}
                            </div>

                            {/* Chat input box */}
                            <div className="flex gap-2 items-end">
                              <Textarea
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="Refine, improve, or write a prompt..."
                                className="min-h-[50px] max-h-[80px] flex-1 text-sm bg-background resize-none"
                              />
                              <Button 
                                type="button" 
                                onClick={handleSendChatMessage} 
                                size="icon" 
                                className="h-10 w-10 shrink-0 bg-pink-600 hover:bg-pink-700 text-white rounded-xl shadow-sm"
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* Text Prompt input */}
                            <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-bold text-foreground">
                              {activeTab === 'ai-image' ? 'Image Description' : activeTab === 'ai-video' ? 'Video Narrative & Motion' : 'Web Page Requirements'}
                            </Label>
                            <span className="text-xs text-muted-foreground">{editingText.length} characters</span>
                          </div>
                          <div className="relative">
                            <Textarea
                              name="prompt"
                              value={editingText}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEditingText(val);
                                setBasePrompt(stripTags(val));
                              }}
                              className="min-h-[140px] text-base p-4 pr-10 focus-visible:ring-1 bg-background resize-y leading-relaxed"
                              placeholder={
                                activeTab === 'ai-image' ? "Describe the image you want to create (e.g., 'A futuristic astronaut exploring digital artifacts on Mars...')" :
                                activeTab === 'ai-video' ? "Describe the dynamic motion scene (e.g., 'Drone shot flying over tropical stream cascades in slow-motion...')" :
                                "Define the landing page sections and purpose (e.g., 'Modern clean SaaS portfolio for a photographer showcasing abstract images...')"
                              }
                            />
                            {editingText && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingText('');
                                  setBasePrompt('');
                                }}
                                className="absolute top-3 right-3 text-muted-foreground hover:text-foreground p-1 rounded-md transition"
                                title="Clear text"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Interactive presets for instant styling options */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-xs font-semibold h-9"
                              onClick={handlePasteClipboard}
                            >
                              <ClipboardPaste className="mr-1.5 h-3.5 w-3.5" />
                              Import Clipboard
                            </Button>
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              className="text-xs font-semibold h-9 gap-1.5"
                              onClick={handleEnhancePrompt}
                            >
                              <Wand2 className="h-3.5 w-3.5 text-purple-500 animate-pulse" />
                              Enhance Prompt
                            </Button>
                          </div>

                        </div>

                        {/* Options Accordions specific to each tab */}
                        <Accordion type="single" collapsible defaultValue="options" className="w-full pt-4">
                          <AccordionItem value="options" className="border-t border-b-0">
                            <AccordionTrigger className="hover:no-underline py-3">
                              <span className="flex items-center gap-2 text-sm font-extrabold text-foreground">
                                <Settings2 className="h-4 w-4 text-primary" />
                                Advanced Design Settings
                              </span>
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 pb-4 space-y-5">
                              
                              {/* --- IMAGE CONFIGURATIONS --- */}
                              {activeTab === 'ai-image' && (
                                <div className="space-y-4">
                                  {/* Provider Select — always full width */}
                                  <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-pink-500 flex items-center gap-1.5">
                                      <KeyRound className="h-3.5 w-3.5" />
                                      Active API Provider / Model
                                    </Label>
                                    <Select
                                      value={imageProvider === 'mock' ? 'mock' : `${imageProvider}:${imageProvider === 'openai' ? openAIImageModel : imageProvider === 'fal' ? falModel : googleWebModel}`}
                                      onValueChange={(val) => {
                                        if (val === 'mock') { setImageProvider('mock'); return; }
                                        const [p, ...rest] = val.split(':'); const m = rest.join(':');
                                        setImageProvider(p as any);
                                        if (p === 'openai') setOpenAIImageModel(m);
                                        else if (p === 'fal') setFalModel(m);
                                        else if (p === 'google') setGoogleWebModel(m);
                                      }}
                                    >
                                      <SelectTrigger className="text-xs h-9 bg-background font-semibold border-pink-500/30">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="mock" className="text-xs font-semibold">✨ Mock Sandbox (Free)</SelectItem>
                                        <SelectItem value="openai:dall-e-3" className="text-xs">🟢 OpenAI / dall-e-3</SelectItem>
                                        <SelectItem value="openai:dall-e-2" className="text-xs">🟢 OpenAI / dall-e-2</SelectItem>
                                        <SelectItem value="fal:fal-ai/flux/schnell" className="text-xs">🔥 Fal.ai / fal-ai/flux/schnell</SelectItem>
                                        <SelectItem value="fal:fal-ai/flux/dev" className="text-xs">🔥 Fal.ai / fal-ai/flux/dev</SelectItem>
                                        <SelectItem value="fal:fal-ai/flux-pro" className="text-xs">🔥 Fal.ai / fal-ai/flux-pro</SelectItem>
                                        <SelectItem value="google:gemini-1.5-flash" className="text-xs">🔵 Google / gemini-1.5-flash</SelectItem>
                                        <SelectItem value="google:gemini-1.5-pro" className="text-xs">🔵 Google / gemini-1.5-pro</SelectItem>
                                        <SelectItem value="google:gemini-2.0-flash" className="text-xs">🔵 Google / gemini-2.0-flash</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  {/* API Key card — always visible */}
                                  <div className="w-full rounded-lg border bg-muted/30 p-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                      <Label className="text-xs font-bold flex items-center gap-1.5">
                                        <KeyRound className="h-3 w-3 text-pink-500" />
                                        {imageProvider === 'mock' && 'API Key'}
                                        {imageProvider === 'openai' && 'OpenAI API Key'}
                                        {imageProvider === 'fal' && 'Fal.ai API Key'}
                                        {imageProvider === 'google' && 'Google Gemini API Key'}
                                      </Label>
                                      {imageProvider === 'mock' && <span className="text-[10px] text-muted-foreground">Not required for Mock</span>}
                                      {imageProvider === 'openai' && (openAIKey ? <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">✓ Active</span> : <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline font-medium">Get API Key →</a>)}
                                      {imageProvider === 'fal' && (replicateKey ? <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">✓ Active</span> : <a href="https://fal.ai/dashboard/api-keys" target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline font-medium">Get API Key →</a>)}
                                      {imageProvider === 'google' && (vertexKey ? <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">✓ Active</span> : <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline font-medium">Get API Key →</a>)}
                                    </div>
                                    {imageProvider === 'mock' && (
                                      <p className="text-[11px] text-muted-foreground">Select a provider above to enter your API key.</p>
                                    )}
                                    {imageProvider === 'openai' && <Input type="password" placeholder="sk-proj-..." value={openAIKey} onChange={(e) => setOpenAIKey(e.target.value)} className="text-xs bg-background h-9 rounded-lg w-full" />}
                                    {imageProvider === 'fal' && <Input type="password" placeholder="Key..." value={replicateKey} onChange={(e) => setReplicateKey(e.target.value)} className="text-xs bg-background h-9 rounded-lg w-full" />}
                                    {imageProvider === 'google' && <Input type="password" placeholder="Google AI Studio key..." value={vertexKey} onChange={(e) => setVertexKey(e.target.value)} className="text-xs bg-background h-9 rounded-lg w-full" />}
                                  </div>

                                  {/* Settings fields in 2-col grid */}
                                  <div className="grid sm:grid-cols-2 gap-4">
                                    <Label className="text-xs font-semibold">Creative Preset</Label>
                                    <Select value={imageStyle} onValueChange={setImageStyle}>
                                      <SelectTrigger className="text-xs h-9 bg-background">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="cinematic" className="text-xs">🎬 Cinematic (Realism)</SelectItem>
                                        <SelectItem value="anime" className="text-xs">🎭 Anime Style</SelectItem>
                                        <SelectItem value="surreal" className="text-xs">🌌 Surreal Art</SelectItem>
                                        <SelectItem value="watercolor" className="text-xs">🖌️ Watercolor Painting</SelectItem>
                                        <SelectItem value="photography" className="text-xs">📸 Photography Portrait</SelectItem>
                                        <SelectItem value="sketch" className="text-xs">✏️ Sketch & Line Art</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Aspect Ratio</Label>
                                    <Select value={imageRatio} onValueChange={setImageRatio}>
                                      <SelectTrigger className="text-xs h-9 bg-background">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="1-1" className="text-xs">1:1 Square</SelectItem>
                                        <SelectItem value="16-9" className="text-xs">16:9 Landscape</SelectItem>
                                        <SelectItem value="9-16" className="text-xs">9:16 Portrait</SelectItem>
                                        <SelectItem value="4-3" className="text-xs">4:3 Desktop</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Lighting Dynamics</Label>
                                    <Select value={imageLighting} onValueChange={setImageLighting}>
                                      <SelectTrigger className="text-xs h-9 bg-background">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="volumetric" className="text-xs">Volumetric Rays</SelectItem>
                                        <SelectItem value="studio" className="text-xs">Studio Soft Lighting</SelectItem>
                                        <SelectItem value="neon" className="text-xs">Cyberpunk Neon</SelectItem>
                                        <SelectItem value="sunset" className="text-xs">Sunset Golden Hour</SelectItem>
                                        <SelectItem value="moody" className="text-xs">Moody & Shadowy</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Camera Shot Angle</Label>
                                    <Select value={imageCamera} onValueChange={setImageCamera}>
                                      <SelectTrigger className="text-xs h-9 bg-background">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="eye-level" className="text-xs">Eye-level Normal</SelectItem>
                                        <SelectItem value="close-up" className="text-xs">Extreme Close-up</SelectItem>
                                        <SelectItem value="wide" className="text-xs">Wide Landscape Shot</SelectItem>
                                        <SelectItem value="aerial" className="text-xs">Aerial Drone View</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Output Quality</Label>
                                    <div className="flex gap-2">
                                      <Select value={imageRes} onValueChange={setImageRes}>
                                        <SelectTrigger className="text-xs h-9 bg-background flex-1">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="1k" className="text-xs">1K Resolution</SelectItem>
                                          <SelectItem value="2k" className="text-xs">2K Ultra HD</SelectItem>
                                          <SelectItem value="4k" className="text-xs">4K Print Quality</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <Select value={imageFormat} onValueChange={setImageFormat}>
                                        <SelectTrigger className="text-xs h-9 bg-background w-[80px]">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="png" className="text-xs">PNG</SelectItem>
                                          <SelectItem value="jpeg" className="text-xs">JPEG</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <Label className="text-xs font-semibold">Guidance (CFG Scale): {imageCFG}</Label>
                                      <Label className="text-xs font-semibold">Steps: {imageSteps}</Label>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <Slider
                                        value={[imageCFG]}
                                        min={1}
                                        max={20}
                                        step={0.5}
                                        onValueChange={(val) => setImageCFG(val[0] || 7.5)}
                                        className="py-2"
                                      />
                                      <Slider
                                        value={[imageSteps]}
                                        min={10}
                                        max={150}
                                        step={5}
                                        onValueChange={(val) => setImageSteps(val[0] || 30)}
                                        className="py-2"
                                      />
                                    </div>
                                  </div>

                                  {/* Negative Prompt — always full width */}
                                  <div className="w-full space-y-1.5">
                                    <Label className="text-xs font-semibold">Negative Prompt</Label>
                                    <Input
                                      value={imageNegative}
                                      onChange={(e) => setImageNegative(e.target.value)}
                                      placeholder="What to exclude from generation..."
                                      className="text-xs bg-background w-full"
                                    />
                                  </div>
                                </div>
                              )}

                              {/* --- VIDEO CONFIGURATIONS --- */}
                              {activeTab === 'ai-video' && (
                                <div className="grid sm:grid-cols-2 gap-4">
                                  <div className="col-span-2 space-y-1.5">
                                    <Label className="text-xs font-bold text-pink-500 flex items-center gap-1.5">
                                      <KeyRound className="h-3.5 w-3.5" />
                                      Active API Provider / Model
                                    </Label>
                                    <Select
                                      value={videoProvider === 'mock' ? 'mock' : videoProvider === 'runway' ? 'runway' : videoProvider === 'veo' ? `veo:${googleVeoModel}` : videoProvider === 'anthropic' ? `anthropic:${anthropicModel}` : videoProvider === 'fal' ? `fal:${falModel}` : `google:${googleWebModel}`}
                                      onValueChange={(val) => {
                                        if (val === 'mock') { setVideoProvider('mock'); return; }
                                        if (val === 'runway') { setVideoProvider('runway'); return; }
                                        const [p, ...rest] = val.split(':'); const m = rest.join(':');
                                        setVideoProvider(p as any);
                                        if (p === 'veo') setGoogleVeoModel(m);
                                        else if (p === 'anthropic') setAnthropicModel(m);
                                        else if (p === 'fal') setFalModel(m);
                                        else if (p === 'google') setGoogleWebModel(m);
                                      }}
                                    >
                                      <SelectTrigger className="text-xs h-9 bg-background font-semibold border-pink-500/30">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="mock" className="text-xs font-semibold">✨ Mock Sandbox (Free)</SelectItem>
                                        <SelectItem value="runway" className="text-xs">🟣 Runway / Gen-3 Alpha</SelectItem>
                                        <SelectItem value="veo:veo-2.0-generate-001" className="text-xs">🔵 Google Veo / veo-2.0-generate-001</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  {/* API Key card — always visible */}
                                  <div className="col-span-2 w-full rounded-lg border bg-muted/30 p-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                      <Label className="text-xs font-bold flex items-center gap-1.5">
                                        <KeyRound className="h-3 w-3 text-pink-500" />
                                        {videoProvider === 'mock' && 'API Key'}
                                        {videoProvider === 'runway' && 'Runway API Key'}
                                        {videoProvider === 'veo' && 'Google Veo API Key'}
                                        {videoProvider === 'anthropic' && 'Anthropic API Key'}
                                        {videoProvider === 'fal' && 'Fal.ai API Key'}
                                        {videoProvider === 'google' && 'Google Gemini API Key'}
                                      </Label>
                                      {videoProvider === 'mock' && <span className="text-[10px] text-muted-foreground">Not required for Mock</span>}
                                      {videoProvider === 'runway' && (runwayKey ? <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">✓ Active</span> : <a href="https://developer.runwayml.com/" target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline font-medium">Get API Key →</a>)}
                                      {videoProvider === 'veo' && (veoKey ? <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">✓ Active</span> : <a href="https://console.cloud.google.com/vertex-ai" target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline font-medium">Get API Key →</a>)}
                                      {videoProvider === 'anthropic' && (anthropicKey ? <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">✓ Active</span> : <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline font-medium">Get API Key →</a>)}
                                      {videoProvider === 'fal' && (replicateKey ? <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">✓ Active</span> : <a href="https://fal.ai/dashboard/api-keys" target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline font-medium">Get API Key →</a>)}
                                      {videoProvider === 'google' && (vertexKey ? <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">✓ Active</span> : <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline font-medium">Get API Key →</a>)}
                                    </div>
                                    {videoProvider === 'mock' && (
                                      <p className="text-[11px] text-muted-foreground">Select a provider above to enter your API key.</p>
                                    )}
                                    {videoProvider === 'runway' && <Input type="password" placeholder="runway-key-..." value={runwayKey} onChange={(e) => setRunwayKey(e.target.value)} className="text-xs bg-background h-9 rounded-lg w-full" />}
                                    {videoProvider === 'veo' && <Input type="password" placeholder="Google Cloud / Vertex Veo Key..." value={veoKey} onChange={(e) => setVeoKey(e.target.value)} className="text-xs bg-background h-9 rounded-lg w-full" />}
                                    {videoProvider === 'anthropic' && <Input type="password" placeholder="sk-ant-..." value={anthropicKey} onChange={(e) => setAnthropicKey(e.target.value)} className="text-xs bg-background h-9 rounded-lg w-full" />}
                                    {videoProvider === 'fal' && <Input type="password" placeholder="Key..." value={replicateKey} onChange={(e) => setReplicateKey(e.target.value)} className="text-xs bg-background h-9 rounded-lg w-full" />}
                                    {videoProvider === 'google' && <Input type="password" placeholder="Google AI Studio key..." value={vertexKey} onChange={(e) => setVertexKey(e.target.value)} className="text-xs bg-background h-9 rounded-lg w-full" />}
                                  </div>

                                  <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Motion Dynamics</Label>
                                    <Select value={videoMotion} onValueChange={setVideoMotion}>
                                      <SelectTrigger className="text-xs h-9 bg-background">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="low" className="text-xs">Low (Static Objects/Wind)</SelectItem>
                                        <SelectItem value="medium" className="text-xs">Medium (Cinematic Smooth)</SelectItem>
                                        <SelectItem value="high" className="text-xs">High (Action & Speed)</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Aspect Ratio / Orientation</Label>
                                    <Select value={videoAspect} onValueChange={setVideoAspect}>
                                      <SelectTrigger className="text-xs h-9 bg-background">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="16-9" className="text-xs">📺 16:9 — Horizontal / Landscape</SelectItem>
                                        <SelectItem value="9-16" className="text-xs">📱 9:16 — Vertical / Portrait</SelectItem>
                                        <SelectItem value="1-1" className="text-xs">■ 1:1 — Square</SelectItem>
                                        <SelectItem value="4-3" className="text-xs">💻 4:3 — Classic / Desktop</SelectItem>
                                        <SelectItem value="21-9" className="text-xs">🎬 21:9 — Ultra-Wide / Cinematic</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Camera Direction Vector</Label>
                                    <Select value={videoCamera} onValueChange={setVideoCamera}>
                                      <SelectTrigger className="text-xs h-9 bg-background">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="none" className="text-xs">None (Fixed Camera)</SelectItem>
                                        <SelectItem value="zoom-in" className="text-xs">🔍 Zoom In Slowly</SelectItem>
                                        <SelectItem value="zoom-out" className="text-xs">🔍 Zoom Out Slowly</SelectItem>
                                        <SelectItem value="pan-left" className="text-xs">◀ Pan Left</SelectItem>
                                        <SelectItem value="pan-right" className="text-xs">▶ Pan Right</SelectItem>
                                        <SelectItem value="orbit" className="text-xs">🔄 Orbit / Rotation</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Style Influence</Label>
                                    <Select value={videoStyle} onValueChange={setVideoStyle}>
                                      <SelectTrigger className="text-xs h-9 bg-background">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="photorealistic" className="text-xs">Photorealistic Cinematic</SelectItem>
                                        <SelectItem value="3d-animation" className="text-xs">3D Pixar/Render</SelectItem>
                                        <SelectItem value="anime-movie" className="text-xs">Ghibli Anime Movie</SelectItem>
                                        <SelectItem value="surreal" className="text-xs">Liquid Abstract</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Duration & Capture</Label>
                                    <Select value={videoDuration} onValueChange={setVideoDuration}>
                                      <SelectTrigger className="text-xs h-9 bg-background">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="4" className="text-xs">4 Seconds (Fast)</SelectItem>
                                        <SelectItem value="8" className="text-xs">8 Seconds (Standard)</SelectItem>
                                        <SelectItem value="16" className="text-xs">16 Seconds (Pro)</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">FPS & Frame Rate</Label>
                                    <Select value={videoFPS.toString()} onValueChange={(val) => setVideoFPS(parseInt(val))}>
                                      <SelectTrigger className="text-xs h-9 bg-background">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="24" className="text-xs">24 FPS Cinematic</SelectItem>
                                        <SelectItem value="30" className="text-xs">30 FPS Standard</SelectItem>
                                        <SelectItem value="60" className="text-xs">60 FPS Ultra-Smooth</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="col-span-2 flex items-center justify-between p-2.5 rounded-lg border bg-background mt-2">
                                    <div className="space-y-0.5">
                                      <Label className="text-xs font-bold">Flow Interpolation</Label>
                                      <p className="text-[10px] text-muted-foreground">Interpolates frames for super-smooth motion kinetics.</p>
                                    </div>
                                    <Switch checked={videoInterpolation} onCheckedChange={setVideoInterpolation} />
                                  </div>
                                </div>
                              )}

                              {/* --- WEB DESIGN CONFIGURATIONS --- */}
                              {activeTab === 'ai-web' && (
                                <div className="grid sm:grid-cols-2 gap-4">
                                  <div className="col-span-2 space-y-1.5">
                                    <Label className="text-xs font-bold text-pink-500 flex items-center gap-1.5">
                                      <KeyRound className="h-3.5 w-3.5" />
                                      Active API Provider / Model
                                    </Label>
                                    <Select
                                      value={webProvider === 'mock' ? 'mock' : `${webProvider}:${webProvider === 'openai' ? openAIChatModel : webProvider === 'anthropic' ? anthropicModel : googleWebModel}`}
                                      onValueChange={(val) => {
                                        if (val === 'mock') { setWebProvider('mock'); return; }
                                        const [p, ...rest] = val.split(':'); const m = rest.join(':');
                                        setWebProvider(p as any);
                                        if (p === 'openai') setOpenAIChatModel(m);
                                        else if (p === 'anthropic') setAnthropicModel(m);
                                        else if (p === 'google') setGoogleWebModel(m);
                                      }}
                                    >
                                      <SelectTrigger className="text-xs h-9 bg-background font-semibold border-pink-500/30">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="mock" className="text-xs font-semibold">✨ Mock Sandbox (Free)</SelectItem>
                                        <SelectItem value="openai:gpt-4o" className="text-xs">🟢 OpenAI / gpt-4o</SelectItem>
                                        <SelectItem value="openai:gpt-4o-mini" className="text-xs">🟢 OpenAI / gpt-4o-mini</SelectItem>
                                        <SelectItem value="openai:gpt-4-turbo" className="text-xs">🟢 OpenAI / gpt-4-turbo</SelectItem>
                                        <SelectItem value="anthropic:claude-3-5-sonnet-20240620" className="text-xs">🔴 Anthropic / claude-3-5-sonnet-20240620</SelectItem>
                                        <SelectItem value="anthropic:claude-3-opus-20240229" className="text-xs">🔴 Anthropic / claude-3-opus-20240229</SelectItem>
                                        <SelectItem value="anthropic:claude-3-haiku-20240307" className="text-xs">🔴 Anthropic / claude-3-haiku-20240307</SelectItem>
                                        <SelectItem value="google:gemini-1.5-flash" className="text-xs">🔵 Google / gemini-1.5-flash</SelectItem>
                                        <SelectItem value="google:gemini-1.5-pro" className="text-xs">🔵 Google / gemini-1.5-pro</SelectItem>
                                        <SelectItem value="google:gemini-2.0-flash" className="text-xs">🔵 Google / gemini-2.0-flash</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  {/* API Key card — always visible */}
                                  <div className="col-span-2 w-full rounded-lg border bg-muted/30 p-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                      <Label className="text-xs font-bold flex items-center gap-1.5">
                                        <KeyRound className="h-3 w-3 text-pink-500" />
                                        {webProvider === 'mock' && 'API Key'}
                                        {webProvider === 'anthropic' && 'Anthropic API Key'}
                                        {webProvider === 'openai' && 'OpenAI API Key'}
                                        {webProvider === 'google' && 'Google Gemini API Key'}
                                      </Label>
                                      {webProvider === 'mock' && <span className="text-[10px] text-muted-foreground">Not required for Mock</span>}
                                      {webProvider === 'anthropic' && (anthropicKey ? <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">✓ Active</span> : <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline font-medium">Get API Key →</a>)}
                                      {webProvider === 'openai' && (openAIKey ? <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">✓ Active</span> : <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline font-medium">Get API Key →</a>)}
                                      {webProvider === 'google' && (vertexKey ? <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">✓ Active</span> : <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline font-medium">Get API Key →</a>)}
                                    </div>
                                    {webProvider === 'mock' && (
                                      <p className="text-[11px] text-muted-foreground">Select a provider above to enter your API key.</p>
                                    )}
                                    {webProvider === 'anthropic' && <Input type="password" placeholder="sk-ant-..." value={anthropicKey} onChange={(e) => setAnthropicKey(e.target.value)} className="text-xs bg-background h-9 rounded-lg w-full" />}
                                    {webProvider === 'openai' && <Input type="password" placeholder="sk-proj-..." value={openAIKey} onChange={(e) => setOpenAIKey(e.target.value)} className="text-xs bg-background h-9 rounded-lg w-full" />}
                                    {webProvider === 'google' && <Input type="password" placeholder="Google AI Studio key..." value={vertexKey} onChange={(e) => setVertexKey(e.target.value)} className="text-xs bg-background h-9 rounded-lg w-full" />}
                                  </div>

                                  <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Aesthetic Theme</Label>
                                    <Select value={webTheme} onValueChange={setWebTheme}>
                                      <SelectTrigger className="text-xs h-9 bg-background">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="glassmorphism" className="text-xs">✨ Premium Glassmorphism</SelectItem>
                                        <SelectItem value="dark" className="text-xs">🌑 Sleek Dark Mode</SelectItem>
                                        <SelectItem value="light" className="text-xs">☀️ Clean Light Mode</SelectItem>
                                        <SelectItem value="neon" className="text-xs">👾 Cyberpunk Retro Neon</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Accent Palette</Label>
                                    <Select value={webColor} onValueChange={setWebColor}>
                                      <SelectTrigger className="text-xs h-9 bg-background">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="indigo" className="text-xs">🔵 Royal Indigo / Purple</SelectItem>
                                        <SelectItem value="emerald" className="text-xs">🟢 Tech Emerald / Green</SelectItem>
                                        <SelectItem value="rose" className="text-xs">🔴 Vivid Rose / Crimson</SelectItem>
                                        <SelectItem value="amber" className="text-xs">🟡 Warm Amber / Gold</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Target Section Layout</Label>
                                    <Select value={webComponent} onValueChange={setWebComponent}>
                                      <SelectTrigger className="text-xs h-9 bg-background">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="hero" className="text-xs">Hero Header Container</SelectItem>
                                        <SelectItem value="pricing" className="text-xs">Features & Pricing Grid</SelectItem>
                                        <SelectItem value="features" className="text-xs">Modern Service Outline</SelectItem>
                                        <SelectItem value="full-page" className="text-xs">Full Page Layout Structure</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              )}

                              {/* --- CHAT / PURE TEXT MODEL SELECTOR --- */}
                              {activeTab === 'pure-text' && (
                                <div className="space-y-3">
                                  <div className="col-span-2 space-y-1.5">
                                    <Label className="text-xs font-bold text-pink-500 flex items-center gap-1.5">
                                      <KeyRound className="h-3.5 w-3.5" />
                                      Active API Provider / Model
                                    </Label>
                                    <Select
                                      value={chatProvider === 'mock' ? 'mock' : `${chatProvider === 'openai' ? 'openai-chat' : chatProvider}:${chatProvider === 'openai' ? openAIChatModel : chatProvider === 'anthropic' ? anthropicModel : googleWebModel}`}
                                      onValueChange={(val) => {
                                        if (val === 'mock') {
                                          setChatProvider('mock');
                                          return;
                                        }
                                        const [p, ...rest] = val.split(':'); const m = rest.join(':');
                                        if (p === 'openai-chat') {
                                          setChatProvider('openai');
                                          setOpenAIChatModel(m);
                                        }
                                        else if (p === 'anthropic') {
                                          setChatProvider('anthropic');
                                          setAnthropicModel(m);
                                        }
                                        else if (p === 'google') {
                                          setChatProvider('google');
                                          setGoogleWebModel(m);
                                        }
                                      }}
                                    >
                                      <SelectTrigger className="text-xs h-9 bg-background font-semibold border-pink-500/30">
                                        <SelectValue placeholder="✨ Mock Sandbox (Free)" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="mock" className="text-xs font-semibold">✨ Mock Sandbox (Free)</SelectItem>
                                        <SelectItem value="openai-chat:gpt-4o" className="text-xs">🟢 OpenAI / gpt-4o</SelectItem>
                                        <SelectItem value="openai-chat:gpt-4o-mini" className="text-xs">🟢 OpenAI / gpt-4o-mini</SelectItem>
                                        <SelectItem value="openai-chat:gpt-4-turbo" className="text-xs">🟢 OpenAI / gpt-4-turbo</SelectItem>
                                        <SelectItem value="anthropic:claude-3-5-sonnet-20240620" className="text-xs">🔴 Anthropic / claude-3-5-sonnet-20240620</SelectItem>
                                        <SelectItem value="anthropic:claude-3-opus-20240229" className="text-xs">🔴 Anthropic / claude-3-opus-20240229</SelectItem>
                                        <SelectItem value="anthropic:claude-3-haiku-20240307" className="text-xs">🔴 Anthropic / claude-3-haiku-20240307</SelectItem>
                                        <SelectItem value="google:gemini-1.5-flash" className="text-xs">🔵 Google / gemini-1.5-flash</SelectItem>
                                        <SelectItem value="google:gemini-1.5-pro" className="text-xs">🔵 Google / gemini-1.5-pro</SelectItem>
                                        <SelectItem value="google:gemini-2.0-flash" className="text-xs">🔵 Google / gemini-2.0-flash</SelectItem>
                                      </SelectContent>
                                    </Select>

                                    {/* Single contextual API key card — matches the selected provider */}
                                    {(() => {
                                      if (chatProvider === 'openai') return (
                                        <div className="mt-3 rounded-lg border bg-muted/30 p-3 space-y-2">
                                          <div className="flex items-center justify-between">
                                            <Label className="text-xs font-bold flex items-center gap-1.5"><KeyRound className="h-3 w-3 text-pink-500" />OpenAI API Key</Label>
                                            {openAIKey ? <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">✓ Active</span> : <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline font-medium">Get API Key →</a>}
                                          </div>
                                          <Input type="password" placeholder="sk-proj-..." value={openAIKey} onChange={(e) => setOpenAIKey(e.target.value)} className="text-xs bg-background h-9 rounded-lg" />
                                        </div>
                                      );
                                      if (chatProvider === 'anthropic') return (
                                        <div className="mt-3 rounded-lg border bg-muted/30 p-3 space-y-2">
                                          <div className="flex items-center justify-between">
                                            <Label className="text-xs font-bold flex items-center gap-1.5"><KeyRound className="h-3 w-3 text-pink-500" />Anthropic API Key</Label>
                                            {anthropicKey ? <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">✓ Active</span> : <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline font-medium">Get API Key →</a>}
                                          </div>
                                          <Input type="password" placeholder="sk-ant-..." value={anthropicKey} onChange={(e) => setAnthropicKey(e.target.value)} className="text-xs bg-background h-9 rounded-lg" />
                                        </div>
                                      );
                                      if (chatProvider === 'google') return (
                                        <div className="mt-3 rounded-lg border bg-muted/30 p-3 space-y-2">
                                          <div className="flex items-center justify-between">
                                            <Label className="text-xs font-bold flex items-center gap-1.5"><KeyRound className="h-3 w-3 text-pink-500" />Google Gemini API Key</Label>
                                            {vertexKey ? <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">✓ Active</span> : <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline font-medium">Get API Key →</a>}
                                          </div>
                                          <Input type="password" placeholder="Google AI Studio key..." value={vertexKey} onChange={(e) => setVertexKey(e.target.value)} className="text-xs bg-background h-9 rounded-lg" />
                                        </div>
                                      );
                                      return null;
                                    })()}
                                  </div>
                                </div>
                              )}


                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>

                        {/* Trigger button */}
                        {(() => {
                          const getButtonConfig = () => {
                            if (activeTab === 'ai-video') {
                              return {
                                gradient: '!bg-gradient-to-r !from-violet-600 !to-fuchsia-600 hover:!from-violet-700 hover:!to-fuchsia-700 dark:!from-violet-500 dark:!to-fuchsia-500 dark:hover:!from-violet-600 dark:hover:!to-fuchsia-600',
                                shadow: '!shadow-lg !shadow-violet-500/20 hover:!shadow-violet-500/40 dark:!shadow-violet-500/15 dark:hover:!shadow-violet-500/35',
                                icon: <Clapperboard className="h-4 w-4 !text-white animate-pulse" />,
                                text: 'Generate AI Video',
                                border: '!border !border-violet-500/20 dark:!border-violet-400/30',
                                ring: 'hover:!ring-2 hover:!ring-offset-2 hover:!ring-offset-background hover:!ring-violet-500/50 dark:hover:!ring-violet-400/50'
                              };
                            }
                            if (activeTab === 'ai-web') {
                              return {
                                gradient: '!bg-gradient-to-r !from-purple-600 !to-violet-600 hover:!from-purple-700 hover:!to-violet-700 dark:!from-emerald-400 dark:!to-teal-500 dark:hover:!from-emerald-500 dark:hover:!to-teal-600',
                                shadow: '!shadow-lg !shadow-purple-500/20 hover:!shadow-purple-500/40 dark:!shadow-emerald-500/15 dark:hover:!shadow-emerald-500/35',
                                icon: <Globe className="h-4 w-4 !text-white animate-pulse" />,
                                text: 'Generate Landing Code',
                                border: '!border !border-purple-500/20 dark:!border-emerald-400/30',
                                ring: 'hover:!ring-2 hover:!ring-offset-2 hover:!ring-offset-background hover:!ring-purple-500/50 dark:hover:!ring-emerald-400/50'
                              };
                            }
                            // Default to Image
                            return {
                              gradient: '!bg-gradient-to-r !from-indigo-600 !to-purple-600 hover:!from-indigo-700 hover:!to-purple-700 dark:!from-sky-400 dark:!to-indigo-500 dark:hover:!from-sky-500 dark:hover:!to-indigo-600',
                              shadow: '!shadow-lg !shadow-indigo-500/20 hover:!shadow-indigo-500/40 dark:!shadow-sky-500/15 dark:hover:!shadow-sky-500/35',
                              icon: <Sparkles className="h-4 w-4 !text-white animate-pulse" />,
                              text: 'Generate AI Image',
                              border: '!border !border-indigo-500/20 dark:!border-sky-400/30',
                              ring: 'hover:!ring-2 hover:!ring-offset-2 hover:!ring-offset-background hover:!ring-indigo-500/50 dark:hover:!ring-sky-400/50'
                            };
                          };

                          const btn = getButtonConfig();

                          return (
                            <div className="pt-2">
                              <Button 
                                type="submit" 
                                disabled={true} 
                                className={`relative group overflow-hidden w-full h-12 ${btn.gradient} !text-white font-extrabold gap-2.5 text-sm rounded-xl transition-all duration-300 ease-out hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center ${btn.shadow} ${btn.border} ${btn.ring}`}
                              >
                                {/* Inner glow overlay on hover */}
                                <div className="absolute inset-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                
                                {isPending || localGenerating ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin !text-white" />
                                    <span className="!text-white z-10">{localGenerating ? genStatus : 'Synthesizing output...'}</span>
                                  </>
                                ) : (
                                  <>
                                    <span className="z-10 flex items-center gap-2.5">
                                      {btn.icon}
                                      <span className="!text-white tracking-wide font-extrabold">{btn.text}</span>
                                    </span>
                                  </>
                                )}
                              </Button>
                            </div>
                          );
                        })()}
                      </>
                    )}
                      </div>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>

              {/* Right Side: Preview Column */}
              <div className="lg:col-span-5 flex flex-col h-full">
                <Card className="shadow-lg border bg-card text-card-foreground flex flex-col flex-1 min-h-[480px] lg:min-h-0 overflow-hidden">
                  
                  {/* Preview Headers */}
                  <div className="border-b bg-muted/20 px-4 py-3 flex items-center justify-between">
                    <span className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
                      {activeTab === 'pure-text' ? (
                        <>
                          <Sparkles className="h-4 w-4 text-pink-500" /> AI Workspace Toolbox
                        </>
                      ) : (
                        <>
                          <Tv className="h-4 w-4 text-primary" /> Live Render Preview
                        </>
                      )}
                    </span>
                    {activeTab === 'ai-web' && outputWebHTML && (
                      <div className="flex bg-muted p-0.5 rounded-lg border">
                        <Button 
                          type="button" 
                          variant={outputWebTab === 'preview' ? 'secondary' : 'ghost'} 
                          size="sm" 
                          className="h-7 text-[10px] py-0 px-2.5 rounded-md font-semibold"
                          onClick={() => setOutputWebTab('preview')}
                        >
                          <Eye className="h-3 w-3 mr-1" /> Preview
                        </Button>
                        <Button 
                          type="button" 
                          variant={outputWebTab === 'code' ? 'secondary' : 'ghost'} 
                          size="sm" 
                          className="h-7 text-[10px] py-0 px-2.5 rounded-md font-semibold"
                          onClick={() => setOutputWebTab('code')}
                        >
                          <Code className="h-3 w-3 mr-1" /> HTML Code
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Render Container */}
                  <div className="p-4 flex-1 flex flex-col justify-center bg-muted/30 relative">
                    
                    {/* Generative Loading Screen */}
                    {(isPending || localGenerating) && (
                      <div className="absolute inset-0 bg-background/95 flex flex-col items-center justify-center p-6 z-10 text-center space-y-4">
                        <div className="relative flex items-center justify-center">
                          <Loader2 className="h-12 w-12 text-indigo-500 animate-spin" />
                          <Sparkles className="h-5 w-5 text-purple-400 absolute animate-pulse" />
                        </div>
                        <div className="space-y-1.5 max-w-[280px]">
                          <p className="font-bold text-sm text-foreground">
                            {localGenerating ? 'Running Physics Engine' : 'Rendering Image Canvas'}
                          </p>
                          <p className="text-xs text-muted-foreground animate-pulse">
                            {localGenerating ? genStatus : 'Calculating lighting vectors...'}
                          </p>
                        </div>
                        <div className="w-full max-w-[200px] h-1.5 bg-muted rounded-full overflow-hidden border">
                          <div 
                            className="bg-indigo-600 h-full transition-all duration-300 rounded-full" 
                            style={{ width: `${localGenerating ? genProgress : 50}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* --- IMAGE RESULT PREVIEW --- */}
                    {activeTab === 'ai-image' && (
                      <div className="w-full h-full flex flex-col justify-center items-center">
                        {outputImageUrl ? (
                          outputImageUrl.startsWith('data:text/gemini,') ? (
                            // Gemini text-model result: show description card
                            <div className="relative w-full rounded-xl border bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-5 shadow-inner space-y-3">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="p-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500">
                                  <Sparkles className="h-4 w-4" />
                                </div>
                                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Google Gemini · Visual Description</span>
                                <span className="ml-auto text-[10px] text-muted-foreground italic">Imagen requires Vertex AI — showing Gemini description</span>
                              </div>
                              <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                                {decodeURIComponent(outputImageUrl.replace('data:text/gemini,', ''))}
                              </p>
                            </div>
                          ) : (
                            <div className="relative w-full aspect-square max-h-[380px] rounded-xl overflow-hidden shadow-inner border bg-background">
                              <OptimizedImage
                                src={outputImageUrl}
                                alt="Generated Image output"
                                fill
                                className="object-contain"
                              />
                            </div>
                          )
                        ) : (
                          <div className="text-center p-6 space-y-3">
                            <div className="p-4 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-500 inline-block">
                              <ImageIcon className="h-8 w-8" />
                            </div>
                            <h3 className="font-bold text-sm text-foreground">Empty Image Canvas</h3>
                            <p className="text-xs text-muted-foreground max-w-[250px] mx-auto">
                              Configure settings and press generate to render your photorealistic AI asset.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* --- VIDEO RESULT PREVIEW --- */}
                    {activeTab === 'ai-video' && (
                      <div className="w-full h-full flex flex-col justify-center items-center">
                        {outputVideoUrl ? (
                          <div className="w-full aspect-[16/9] rounded-xl overflow-hidden shadow-lg border bg-black relative">
                            <video 
                              src={outputVideoUrl} 
                              controls 
                              autoPlay 
                              loop 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-3 left-3 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold text-white border border-white/10 flex items-center gap-1">
                              <Play className="h-2.5 w-2.5 fill-white text-white" />
                              {videoFPS} FPS · {videoDuration}s
                            </div>
                          </div>
                        ) : (
                          <div className="text-center p-6 space-y-3">
                            <div className="p-4 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-500 inline-block">
                              <Clapperboard className="h-8 w-8" />
                            </div>
                            <h3 className="font-bold text-sm text-foreground">Ready for Video Generation</h3>
                            <p className="text-xs text-muted-foreground max-w-[250px] mx-auto">
                              Choose a camera direction vector and synthesize cinematic motion loops.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* --- WEB LANDING PREVIEW / CODE --- */}
                    {activeTab === 'ai-web' && (
                      <div className="w-full h-full flex-grow flex flex-col justify-center">
                        {outputWebHTML ? (
                          outputWebTab === 'preview' ? (
                            <div className="w-full flex-grow min-h-[380px] rounded-xl overflow-hidden border bg-background shadow-md">
                              <iframe
                                srcDoc={outputWebHTML}
                                title="Tailwind Live Preview"
                                className="w-full h-full min-h-[380px] border-0"
                              />
                            </div>
                          ) : (
                            <div className="w-full flex-grow min-h-[380px] flex flex-col rounded-xl overflow-hidden border bg-slate-950 text-slate-300 font-mono text-[11px] leading-relaxed relative shadow-md">
                              <div className="flex justify-between items-center bg-slate-900 border-b border-slate-800 px-4 py-2 text-slate-400">
                                <span>output_component.html</span>
                                <Button 
                                  type="button" 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-7 text-[10px] text-slate-400 hover:text-white font-semibold"
                                  onClick={handleCopyCode}
                                >
                                  {copiedCode ? (
                                    <>
                                      <Check className="h-3 w-3 mr-1 text-green-400" /> Copied
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3 w-3 mr-1" /> Copy Code
                                    </>
                                  )}
                                </Button>
                              </div>
                              <pre className="p-4 overflow-auto flex-1 select-all select-text max-h-[340px]">
                                <code>{outputWebHTML}</code>
                              </pre>
                            </div>
                          )
                        ) : (
                          <div className="text-center p-6 space-y-3">
                            <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 inline-block">
                              <Globe className="h-8 w-8" />
                            </div>
                            <h3 className="font-bold text-sm text-foreground">Interactive Web Prototyping</h3>
                            <p className="text-xs text-muted-foreground max-w-[250px] mx-auto">
                              Define structures and render responsive Tailwind code blocks on demand.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* --- PURE TEXT / CHAT WORKSPACE TOOLBOX --- */}
                    {activeTab === 'pure-text' && (
                      <div className="w-full h-full flex flex-col justify-start flex-grow">
                        <div className="border-b pb-3 mb-4">
                          <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                            <Sparkles className="h-4 w-4 text-pink-500" />
                            Refined Prompt Log
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            All enhanced prompt suggestions from your chat conversation will be logged here for quick access.
                          </p>
                        </div>

                        {suggestedPrompts.length > 0 ? (
                          <div className="space-y-4 overflow-y-auto max-h-[380px] pr-1 select-text">
                            {suggestedPrompts.map((item) => (
                              <Card key={item.id} className="p-4 border bg-background/50 hover:bg-background/80 transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                  <Badge 
                                    variant="secondary" 
                                    className={`text-[9px] uppercase tracking-wider ${
                                      item.type === 'image' ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20' :
                                      item.type === 'video' ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20' :
                                      item.type === 'web' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
                                      'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
                                    }`}
                                  >
                                    {item.type === 'image' ? 'AI Image' : item.type === 'video' ? 'AI Video' : item.type === 'web' ? 'Web Landing' : 'General'}
                                  </Badge>
                                  <span className="text-[10px] text-muted-foreground">
                                    {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="text-xs font-mono bg-muted/40 p-2.5 rounded border border-muted select-all whitespace-pre-wrap leading-relaxed mb-3">
                                  {item.text}
                                </p>
                                <div className="flex gap-2">
                                  <Button 
                                    type="button"
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8 text-[11px] font-semibold flex-1 gap-1"
                                    onClick={() => {
                                      navigator.clipboard.writeText(item.text);
                                      toast({ title: 'Prompt Copied!' });
                                    }}
                                  >
                                    <Copy className="h-3 w-3" /> Copy
                                  </Button>
                                  <Button 
                                    type="button"
                                    variant="default" 
                                    size="sm" 
                                    className="h-8 text-[11px] font-semibold flex-1 gap-1 bg-pink-600 hover:bg-pink-700 text-white border-0"
                                    onClick={() => handleLoadSuggestedPrompt(item.text, item.type)}
                                  >
                                    <Wand2 className="h-3 w-3" /> Use Prompt
                                  </Button>
                                </div>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col justify-center items-center py-12 text-center space-y-3">
                            <div className="p-4 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-500 inline-block animate-pulse">
                              <MessageSquare className="h-8 w-8" />
                            </div>
                            <h4 className="font-bold text-sm text-foreground">No Prompts Refined Yet</h4>
                            <p className="text-xs text-muted-foreground max-w-[240px]">
                              Send a message to the AI Assistant describing your idea to generate refined prompt cards here.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                </Card>
              </div>

            </div>
          </form>

        </div>
      </main>
      <Footer />
    </div>
  );
}
