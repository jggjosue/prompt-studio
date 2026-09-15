'use client';

import { motion } from 'framer-motion';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';

import { generationProviders } from '@/lib/generation/provider-adapters';
import { calculateModelCreditCost, validateCreditCost } from '@/lib/generation-pricing';
import { useMembershipAccess } from '@/hooks/use-membership-access';
import { useGenerationEditor } from '@/hooks/use-generation-editor';
import { GenerationErrorNotice, GenerationProgress } from '@/components/generation/generation-feedback';
import { GenerationCostDisclosure } from '@/components/generation/generation-cost-disclosure';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Trash2,
  Play,
  Tv,
  MessageSquare,
  KeyRound,
  Plus,
  SlidersHorizontal,
  Menu,
  Search,
  Zap,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ShoppingCart
} from 'lucide-react';
import { OptimizedImage } from '@/components/optimized-image';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition, useRef, Suspense } from 'react';
import { CREDIT_PACKS, formatCreditPackPrice } from '@/lib/credit-packs';
import { useBrandKitContext } from '@/hooks/use-brand-kit-context';

const WebRequirementsBuilder = dynamic(() => import('@/components/web-requirements-builder').then(module => module.WebRequirementsBuilder), { ssr: false });
const WebCodeAuditor = dynamic(() => import('@/components/web-code-auditor').then(module => module.WebCodeAuditor), { ssr: false });

const proxyOpenAIImage = generationProviders.openai.image;
const proxyGemini = generationProviders.google.generate;
const proxyPremiumGeminiWeb = generationProviders.google.premiumWeb;
const proxyVeoVideo = generationProviders.google.video;
const proxyRunwayStart = generationProviders.runway.start;
const proxyRunwayPoll = generationProviders.runway.poll;

// Sample video placeholders to simulate dynamic generation

// Helper to generate custom landing page HTML templates for Web previews

export default function GenerateWebsClient() {
  const { hasPaidPlan } = useMembershipAccess();
  const { brandPromptContext, brandKitName } = useBrandKitContext();
  const isSpanish = true;
  const [, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const searchParams = useSearchParams();
  const initialPromptQuery = searchParams.get('prompt') || '';

  // States
  const [, setRawPromptInput] = useState(initialPromptQuery);
  const [editingText, setEditingText] = useState('');
  const [activeTab, setActiveTab] = useState('ai-web');
  const [isPreviewCollapsed, setIsPreviewCollapsed] = useState(false);
  const [isEditorCollapsed, setIsEditorCollapsed] = useState(false);
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(true);
  const [historySearch, setHistorySearch] = useState('');
  const [activeHistoryId, setActiveHistoryId] = useState('landing');
  const [promptHistory, setPromptHistory] = useState([
    { id: 'landing', title: 'Modern Landing Page', prompt: 'Create a modern landing page' },
    { id: 'portfolio', title: 'Creative Portfolio', prompt: 'Create a premium creative portfolio' },
    { id: 'saas', title: 'SaaS Product Website', prompt: 'Create a SaaS product website' },
    { id: 'store', title: 'E-commerce Store', prompt: 'Create a modern e-commerce storefront' },
    { id: 'agency', title: 'Digital Agency', prompt: 'Create a digital agency website' },
  ]);

  // API Key States
  const [openAIKey, setOpenAIKey] = useState('');
  const [replicateKey, setReplicateKey] = useState('');
  const [vertexKey, setVertexKey] = useState('');
  const [runwayKey, setRunwayKey] = useState('');
  const [veoKey, setVeoKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [credits, setCredits] = useState(12.0);
  const [creditsSpent, setCreditsSpent] = useState(0);
  const [showTopupSection, setShowTopupSection] = useState(false);

  // Model States
  const [openAIChatModel, setOpenAIChatModel] = useState('gpt-4o');
  const [openAIImageModel, setOpenAIImageModel] = useState('dall-e-3');
  const [anthropicModel, setAnthropicModel] = useState('claude-3-5-sonnet-20240620');
  const [googleWebModel, setGoogleWebModel] = useState('gemini-2.5-flash');
  const [deepSeekModel, setDeepSeekModel] = useState('deepseek-coder');
  const [googleVeoModel, setGoogleVeoModel] = useState('veo-2.0-generate-001');
  const [falModel, setFalModel] = useState('fal-ai/flux/schnell');

  // Preferred API Provider States
  const [imageProvider, setImageProvider] = useState<'openai' | 'fal' | 'google'>('openai');
  const [videoProvider, setVideoProvider] = useState<'runway' | 'veo' | 'anthropic' | 'fal' | 'google'>('runway');
  const [webProvider, setWebProvider] = useState<'anthropic' | 'openai' | 'google' | 'deepseek'>('google');
  const [chatProvider, setChatProvider] = useState<'openai' | 'anthropic' | 'google'>('openai');

  // Sync state with storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Migrate existing keys from localStorage to sessionStorage for security
      const keysToMigrate = ['ps_openai_key', 'ps_replicate_key', 'ps_vertex_key', 'ps_runway_key', 'ps_veo_key', 'ps_anthropic_key'];
      keysToMigrate.forEach(k => {
        const val = localStorage.getItem(k);
        if (val) {
          sessionStorage.setItem(k, val);
          localStorage.removeItem(k);
        }
      });

      setOpenAIKey(sessionStorage.getItem('ps_openai_key') || '');
      setReplicateKey(sessionStorage.getItem('ps_replicate_key') || '');
      setVertexKey(sessionStorage.getItem('ps_vertex_key') || '');
      setRunwayKey(sessionStorage.getItem('ps_runway_key') || '');
      setVeoKey(sessionStorage.getItem('ps_veo_key') || '');
      setAnthropicKey(sessionStorage.getItem('ps_anthropic_key') || '');
      setImageProvider((localStorage.getItem('ps_image_provider') as any) || 'openai');
      setVideoProvider((localStorage.getItem('ps_video_provider') as any) || 'runway');
      // La generación web Premium usa exclusivamente Gemini administrado por
      // Prompt Studio; no se restauran proveedores BYOK antiguos.
      setWebProvider('google');
      setChatProvider((localStorage.getItem('ps_chat_provider') as any) || 'openai');
      const savedCredits = localStorage.getItem('ps_credits');
      if (savedCredits !== null) {
        setCredits(parseFloat(savedCredits));
      }
      const savedCreditsSpent = localStorage.getItem('ps_credits_spent');
      if (savedCreditsSpent !== null) setCreditsSpent(parseFloat(savedCreditsSpent) || 0);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('ps_openai_key', openAIKey);
    }
  }, [openAIKey]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('ps_replicate_key', replicateKey);
    }
  }, [replicateKey]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('ps_vertex_key', vertexKey);
    }
  }, [vertexKey]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('ps_runway_key', runwayKey);
    }
  }, [runwayKey]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('ps_veo_key', veoKey);
    }
  }, [veoKey]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('ps_anthropic_key', anthropicKey);
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
      localStorage.setItem('ps_credits_spent', creditsSpent.toString());
    }
  }, [credits, creditsSpent]);

  // Chat States

  const [suggestedPrompts] = useState<{
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
  const [videoMotion, setVideoMotion] = useState('medium');
  const [videoCamera, setVideoCamera] = useState('none');
  const [videoDuration, setVideoDuration] = useState('8');
  const [videoFPS, setVideoFPS] = useState(30);
  const [videoInterpolation, setVideoInterpolation] = useState(true);
  const [videoStyle, setVideoStyle] = useState('photorealistic');
  const [videoAspect, setVideoAspect] = useState('16-9');

  // Advanced Option States - Web Landing
  const [webFramework] = useState('nextjs');
  const [webTheme, setWebTheme] = useState('glassmorphism');
  const [webComponent, setWebComponent] = useState('hero');
  const [webColor, setWebColor] = useState('blue');

  // Mock Generation UI flows
  const [isPending] = useTransition();
  const {
    localGenerating, setLocalGenerating, genProgress, setGenProgress, genStatus, setGenStatus,
    generationError, setGenerationError, failGeneration, outputImageUrl, setOutputImageUrl, outputVideoUrl, setOutputVideoUrl,
    outputWebHTML, setOutputWebHTML, outputWebTab, setOutputWebTab, copiedCode, setCopiedCode,
  } = useGenerationEditor();

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
      /,\s*blue color/i, /,\s*emerald color/i, /,\s*rose color/i, /,\s*amber color/i,
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
      } catch (_e) {
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
          title: isSpanish ? '¡Importación Exitosa!' : 'Import Successful!',
          description: isSpanish ? 'Contenido cargado y configuración detectada automáticamente.' : 'Loaded content and auto-detected settings.',
        });
      }
    } catch (_err) {
      toast({
        variant: 'destructive',
        title: isSpanish ? 'Acceso al portapapeles bloqueado' : 'Clipboard Access Blocked',
        description: isSpanish ? 'Por favor pega tu prompt directamente en el área de texto.' : 'Please paste your prompt directly into the input area.',
      });
    }
  };

  // Enhance prompt with detailed tokens based on settings
  const handleEnhancePrompt = () => {
    if (!editingText.trim()) {
      toast({
        variant: 'destructive',
        title: isSpanish ? 'Prompt vacío' : 'Empty prompt',
        description: isSpanish ? 'Escribe o pega un prompt primero para mejorarlo.' : 'Type or paste a prompt first to enhance it.',
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
      title: isSpanish ? '¡Prompt Optimizado!' : 'Prompt Optimized!',
      description: isSpanish ? 'Se agregaron detalles ricos de estilo y directivas.' : 'Appended rich style tokens and directives.',
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
      title: isSpanish ? 'Limpiado' : 'Cleared',
      description: isSpanish ? 'Estados del editor reiniciados.' : 'Reset editing states.',
    });
  };

  const handleLoadSuggestedPrompt = (promptText: string, type: 'image' | 'video' | 'web' | 'general') => {
    const cleanPrompt = stripTags(promptText);
    setBasePrompt(cleanPrompt);
    setEditingText(promptText);
    const targetTab = type === 'video' ? 'ai-video' : type === 'web' ? 'ai-web' : 'ai-image';
    setActiveTab(targetTab);
    toast({
      title: isSpanish ? 'Prompt cargado' : 'Prompt Loaded',
      description: isSpanish ? `El prompt optimizado se cargó en la pestaña de editor de ${type === 'web' ? 'Web' : type === 'video' ? 'Video IA' : 'Imagen IA'}.` : `Refined prompt has been loaded into the ${type === 'web' ? 'Web Landing' : type === 'video' ? 'AI Video' : 'AI Image'} editor tab.`,
    });
  };

  // Copy Web HTML code to clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(outputWebHTML);
    setCopiedCode(true);
    toast({
      title: isSpanish ? '¡Copiado!' : 'Copied!',
      description: isSpanish ? 'Código fuente copiado al portapapeles.' : 'Source code copied to your clipboard.',
    });
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Submit Generation
  const handleGenerationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGenerationError(null);

    if (activeTab === 'pure-text') {
      return;
    }

    if (!editingText.trim()) {
      toast({
        variant: 'destructive',
        title: isSpanish ? 'Prompt requerido' : 'Prompt Required',
        description: isSpanish ? 'Proporciona un prompt antes de generar.' : 'Provide an input prompt before generating.',
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
      if (imageProvider === 'google' && !vertexKey && !hasPaidPlan && credits <= 0) {
        toast({
          variant: 'destructive',
          title: 'Google Vertex Key Required',
          description: 'Please set your Google Vertex/Gemini Key in the API Credentials accordion below or upgrade to Premium.',
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
    }

    // Dynamic cost calculation per selected model and generation tab
    const currentProvider = activeTab === 'ai-video' ? videoProvider : activeTab === 'ai-web' ? webProvider : activeTab === 'ai-image' ? imageProvider : chatProvider;
    const currentModel = activeTab === 'ai-video' ? googleVeoModel : activeTab === 'ai-web' ? (webProvider === 'openai' ? openAIChatModel : webProvider === 'anthropic' ? anthropicModel : webProvider === 'deepseek' ? deepSeekModel : googleWebModel) : activeTab === 'ai-image' ? (imageProvider === 'openai' ? openAIImageModel : imageProvider === 'fal' ? falModel : googleWebModel) : googleWebModel;

    const rawCost = calculateModelCreditCost(activeTab, currentProvider, currentModel);
    const creditCost = validateCreditCost(rawCost);

    if (creditCost <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Credit Cost',
        description: 'The credit cost must be a positive number.',
      });
      return;
    }

    if (credits < creditCost) {
      toast({
        variant: 'destructive',
        title: 'Créditos insuficientes',
        description: 'Tu saldo no alcanza para completar esta generación. Compra más créditos para continuar.',
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
      let finalPrompt = editingText + brandPromptContext;
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
            videoOutputUrl = data.videoUri || '';
            if (videoOutputUrl && !videoOutputUrl.startsWith('http') && !videoOutputUrl.startsWith('data:')) {
              videoOutputUrl = `data:video/mp4;base64,${videoOutputUrl}`;
            }
          }
        } catch (err: any) {
          console.error('Google Veo error:', err);
          apiError = err.message || 'CORS restriction or network issue';
        }
      }

      if (apiError || !videoOutputUrl) {
        failGeneration(`${apiUsed || 'Video'} Generation Failed`, apiError || 'Failed to obtain video output from provider.');
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
      setCreditsSpent(prev => prev + creditCost);
      setLocalGenerating(false);
      toast({
        title: 'Video Created!',
        description: `Successfully generated via ${apiUsed}.`,
      });

      return;
    }

    if (activeTab === 'ai-web') {
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

      if (webProvider === 'google') {
        apiUsed = `Google ${googleWebModel}`;
        setGenStatus('Calling Google Gemini API...');
        try {
          const data = await proxyPremiumGeminiWeb(systemInstruction, googleWebModel);
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

      if (apiError || !generatedHTML) {
        failGeneration(`${apiUsed || 'Web'} Generation Failed`, apiError || 'Failed to generate code from provider.');
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
      const historyTitle = editingText.trim().split(/[.!?\n]/)[0].slice(0, 34) || 'Untitled Website';
      const historyId = `${Date.now()}`;
      setPromptHistory((items) => [
        { id: historyId, title: historyTitle, prompt: editingText },
        ...items.filter((item) => item.prompt !== editingText),
      ]);
      setActiveHistoryId(historyId);
      setCredits(prev => Math.max(0, prev - creditCost));
      setCreditsSpent(prev => prev + creditCost);
      setLocalGenerating(false);
      toast({
        title: 'Code Generated!',
        description: `Landing page fully rendered via ${apiUsed}.`,
      });
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
    if (imageProvider === 'google' && !vertexKey && !hasPaidPlan && credits <= 0) {
      toast({ variant: 'destructive', title: 'Google Gemini Key Required', description: 'Enter your Google Gemini API Key in Advanced Design Settings to generate image.' });
      return;
    }

    let apiUsed = 'Sura/Starlight XL';
    let imageOutputUrl = '';
    let apiError = '';

    setLocalGenerating(true);
    setGenProgress(10);

    // Compile final prompt with tags
    let finalPrompt = editingText + brandPromptContext;
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
    } else if (imageProvider === 'google') {
      // Use Gemini text model to generate a detailed image description
      const geminiModel = googleWebModel || 'gemini-2.5-flash';
      apiUsed = `Google Gemini (${geminiModel})`;
      try {
        setGenStatus(`Calling ${geminiModel}...`);
        setGenProgress(30);
        const data = await proxyGemini(
          vertexKey || '',
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

    if (apiError || !imageOutputUrl) {
      failGeneration(`${apiUsed || 'Image'} Generation Failed`, apiError || 'Failed to obtain image output from provider.');
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
    setCreditsSpent(prev => prev + creditCost);
    setLocalGenerating(false);
    toast({
      title: 'Image Created!',
      description: `Finished rendering via ${apiUsed}.`,
    });

  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Suspense fallback={<div className="w-full h-16 border-b" />}>
        <Header />
        {brandKitName && <div className="border-b bg-primary/5 px-4 py-2 text-center text-xs font-medium text-primary">Brand Kit aplicado: {brandKitName}</div>}
      </Suspense>
      <aside className={`fixed bottom-0 left-0 top-36 z-30 w-60 flex-col border-r border-t bg-card p-4 shadow-xl ${isHistoryCollapsed ? 'hidden' : 'hidden xl:flex'
        }`}>
        <div className="mb-3 flex justify-end">
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-blue-500" onClick={() => setIsHistoryCollapsed(true)} aria-label="Minimize website history">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
        <Button type="button" variant="secondary" className="h-10 w-full gap-2 font-bold" onClick={() => {
          setRawPromptInput(''); setEditingText(''); setBasePrompt(''); setOutputWebHTML(''); setActiveHistoryId('');
        }}>
          <Plus className="h-4 w-4" /> Nuevo chat
        </Button>
        <div className="relative mt-3">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input value={historySearch} onChange={(event) => setHistorySearch(event.target.value)} placeholder="Buscar chats..." className="h-9 pl-8 text-xs" />
        </div>
        <p className="mb-2 mt-4 px-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">Historial reciente</p>
        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto">
          {promptHistory.filter((item) => item.title.toLowerCase().includes(historySearch.toLowerCase())).map((item) => (
            <button key={item.id} type="button" onClick={() => {
              setActiveHistoryId(item.id); setRawPromptInput(item.prompt); setEditingText(item.prompt); setBasePrompt(stripTags(item.prompt));
            }} className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs font-semibold transition-colors ${activeHistoryId === item.id ? 'bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/30' : 'text-foreground/80 hover:bg-muted'
              }`}>
              <MessageSquare className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{item.title}</span>
            </button>
          ))}
        </div>
      </aside>
      {(isHistoryCollapsed || isEditorCollapsed || isPreviewCollapsed) && (
        <div className="fixed right-4 top-36 z-50 hidden w-14 flex-col overflow-hidden rounded-xl border bg-card/95 p-1.5 shadow-2xl backdrop-blur-xl xl:flex">
          {isHistoryCollapsed && <Button type="button" variant="ghost" size="icon" disabled className="h-11 w-full rounded-lg text-muted-foreground opacity-50 cursor-not-allowed pointer-events-none" title="Historial (Próximamente)"><MessageSquare className="h-4 w-4" /></Button>}
          {isEditorCollapsed && <Button type="button" variant="ghost" size="icon" className="h-11 w-full" onClick={() => setIsEditorCollapsed(false)} title="Expand Web Landing"><Globe className="h-4 w-4" /></Button>}
          {isPreviewCollapsed && <Button type="button" variant="ghost" size="icon" className="h-11 w-full" onClick={() => setIsPreviewCollapsed(false)} title="Expand preview"><Tv className="h-4 w-4" /></Button>}
        </div>
      )}
      <main className="flex-1 py-6 md:py-10">
        <div className={`container max-w-6xl px-4 transition-transform duration-300 ${isHistoryCollapsed ? '' : 'xl:translate-x-28'}`}>

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
            <div className="mb-6 p-4 rounded-xl border bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-sky-500/5 dark:from-blue-500/10 dark:via-cyan-500/10 dark:to-sky-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 shrink-0">
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
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <form onSubmit={handleGenerationSubmit}>
              <div className={`relative grid lg:grid-cols-12 gap-8 transition-all duration-300 ${isPreviewCollapsed || isEditorCollapsed ? 'lg:gap-0' : ''}`}>

                {/* Left Side: Options Column */}
                <div className={`${isEditorCollapsed ? 'hidden' : isPreviewCollapsed ? 'lg:col-span-12' : 'lg:col-span-7'} space-y-6 transition-all duration-300`}>
                  <Card className="shadow-lg border bg-card text-card-foreground overflow-hidden">
                    <CardContent className="p-0">
                      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

                        {/* Subtype tabs */}
                        <TabsList className="relative flex w-full rounded-none border-b h-auto min-h-14 bg-muted/30 p-0 flex-wrap sm:flex-nowrap">

                          <TabsTrigger value="ai-web" className="flex-1 data-[state=active]:bg-background rounded-none text-[10px] sm:text-xs md:text-sm font-semibold gap-1 h-14 min-w-[50%] sm:min-w-0">
                            <Globe className="h-4 w-4 text-emerald-500" /> Web Landing
                          </TabsTrigger>

                          {/* Credits indicator in header */}
                          <div className="flex items-center gap-2 pr-12 pl-2">
                            <button
                              type="button"
                              onClick={() => setShowTopupSection((prev) => !prev)}
                              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold border transition-colors ${
                                credits <= 0
                                  ? 'border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                  : credits <= 3
                                    ? 'border-amber-500/50 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                                    : 'border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                              }`}
                              title={credits <= 0 ? 'Sin créditos. Haz clic para recargar.' : `${credits.toFixed(1)} créditos disponibles. Clic para recargar.`}
                            >
                              <Zap className="size-3 text-amber-400" />
                              <span>{credits.toFixed(1)} cr</span>
                              {credits <= 0 && (
                                <span className="text-[10px] text-red-400 underline ml-0.5">Recargar</span>
                              )}
                            </button>
                          </div>

                          <Button type="button" variant="ghost" size="icon" className="absolute right-3 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground hover:text-blue-500" onClick={() => setIsEditorCollapsed(true)} aria-label="Minimize Web Landing">
                            <Menu className="h-4 w-4" />
                          </Button>
                        </TabsList>

                        <div className="p-4 sm:p-6 space-y-4">

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

                          {activeTab === 'ai-web' && (
                            <>
                              <WebRequirementsBuilder
                                onApply={(prompt) => {
                                  setBasePrompt(prompt);
                                  setEditingText(compilePrompt(prompt, 'ai-web'));
                                }}
                              />
                              <WebCodeAuditor
                                onUseFixPrompt={(prompt) => {
                                  setBasePrompt(prompt);
                                  setEditingText(prompt);
                                }}
                              />
                            </>
                          )}

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
                                <Wand2 className="h-3.5 w-3.5 text-blue-500 animate-pulse" />
                                Enhance Prompt
                              </Button>
                            </div>

                          </div>

                          {/* Options Accordions specific to each tab */}
                          <Accordion type="single" collapsible defaultValue="options" className="w-full mt-4">
                            <AccordionItem value="options" className="border border-blue-500/50 rounded-lg overflow-hidden bg-transparent">
                              <AccordionTrigger className="px-4 py-3 bg-[#0a0a0a]/50 hover:bg-[#1a1a1a]/80 transition-colors [&[data-state=open]]:border-b [&[data-state=open]]:border-blue-500/50 text-zinc-100 hover:no-underline">
                                <div className="flex items-center gap-2 text-sm font-bold">
                                  <SlidersHorizontal className="h-4 w-4 text-blue-500" />
                                  Advanced Design Settings
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="p-4 bg-[#161616] space-y-5 border-t-0">

                                {/* --- IMAGE CONFIGURATIONS --- */}
                                {activeTab === 'ai-image' && (
                                  <div className="space-y-4">
                                    {/* Provider Select — always full width */}
                                    <div className="space-y-1.5">
                                      <Label className="text-xs font-bold text-blue-500 flex items-center gap-1.5">
                                        <KeyRound className="h-3.5 w-3.5" />
                                        Modelo Gemini
                                      </Label>
                                      <Select
                                        value={imageProvider === 'google' ? 'google' : `${imageProvider}:${imageProvider === 'openai' ? openAIImageModel : imageProvider === 'fal' ? falModel : googleWebModel}`}
                                        onValueChange={(val) => {
                                          if (val === 'google') { setImageProvider('google'); return; }
                                          const [p, ...rest] = val.split(':'); const m = rest.join(':');
                                          setImageProvider(p as any);
                                          if (p === 'openai') setOpenAIImageModel(m);
                                          else if (p === 'fal') setFalModel(m);
                                          else if (p === 'google') setGoogleWebModel(m);
                                          else if (p === 'deepseek') setDeepSeekModel(m);
                                        }}
                                      >
                                        <SelectTrigger className="text-xs h-9 bg-background font-semibold border-blue-500/30">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>

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
                                          <KeyRound className="h-3 w-3 text-blue-500" />
                                          {imageProvider === 'openai' && 'OpenAI API Key'}
                                          {imageProvider === 'fal' && 'Fal.ai API Key'}
                                          {imageProvider === 'google' && 'Google Gemini API Key'}
                                        </Label>
                                        {imageProvider === 'openai' && (openAIKey ? <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">✓ Active</span> : <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline font-medium">Get API Key →</a>)}
                                        {imageProvider === 'fal' && (replicateKey ? <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">✓ Active</span> : <a href="https://fal.ai/dashboard/api-keys" target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline font-medium">Get API Key →</a>)}
                                        {imageProvider === 'google' && (vertexKey ? <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">✓ Active</span> : <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline font-medium">Get API Key →</a>)}
                                      </div>
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
                                      <Label className="text-xs font-bold text-blue-500 flex items-center gap-1.5">
                                        <KeyRound className="h-3.5 w-3.5" />
                                        Active API Provider / Model
                                      </Label>
                                      <Select
                                        value={videoProvider === 'google' ? 'google' : videoProvider === 'runway' ? 'runway' : videoProvider === 'veo' ? `veo:${googleVeoModel}` : videoProvider === 'anthropic' ? `anthropic:${anthropicModel}` : videoProvider === 'fal' ? `fal:${falModel}` : `google:${googleWebModel}`}
                                        onValueChange={(val) => {
                                          if (val === 'google') { setVideoProvider('google'); return; }
                                          if (val === 'runway') { setVideoProvider('runway'); return; }
                                          const [p, ...rest] = val.split(':'); const m = rest.join(':');
                                          setVideoProvider(p as any);
                                          if (p === 'veo') setGoogleVeoModel(m);
                                          else if (p === 'anthropic') setAnthropicModel(m);
                                          else if (p === 'fal') setFalModel(m);
                                          else if (p === 'google') setGoogleWebModel(m);
                                          else if (p === 'deepseek') setDeepSeekModel(m);
                                        }}
                                      >
                                        <SelectTrigger className="text-xs h-9 bg-background font-semibold border-blue-500/30">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>

                                          <SelectItem value="runway" className="text-xs">🟣 Runway / Gen-3 Alpha</SelectItem>
                                          <SelectItem value="veo:veo-2.0-generate-001" className="text-xs">🔵 Google Veo / veo-2.0-generate-001</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    {/* API Key card — always visible */}
                                    <div className="col-span-2 w-full rounded-lg border bg-muted/30 p-3 space-y-2">
                                      <div className="flex items-center justify-between">
                                        <Label className="text-xs font-bold flex items-center gap-1.5">
                                          <KeyRound className="h-3 w-3 text-blue-500" />
                                          {videoProvider === 'runway' && 'Runway API Key'}
                                          {videoProvider === 'veo' && 'Google Veo API Key'}
                                          {videoProvider === 'anthropic' && 'Anthropic API Key'}
                                          {videoProvider === 'fal' && 'Fal.ai API Key'}
                                          {videoProvider === 'google' && 'Google Gemini API Key'}
                                        </Label>
                                        {videoProvider === 'runway' && (runwayKey ? <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">✓ Active</span> : <a href="https://developer.runwayml.com/" target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline font-medium">Get API Key →</a>)}
                                        {videoProvider === 'veo' && (veoKey ? <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">✓ Active</span> : <a href="https://console.cloud.google.com/vertex-ai" target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline font-medium">Get API Key →</a>)}
                                        {videoProvider === 'anthropic' && (anthropicKey ? <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">✓ Active</span> : <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline font-medium">Get API Key →</a>)}
                                        {videoProvider === 'fal' && (replicateKey ? <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">✓ Active</span> : <a href="https://fal.ai/dashboard/api-keys" target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline font-medium">Get API Key →</a>)}
                                        {videoProvider === 'google' && (vertexKey ? <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">✓ Active</span> : <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline font-medium">Get API Key →</a>)}
                                      </div>
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
                                      <Label className="text-xs font-bold text-blue-500 flex items-center gap-1.5">
                                        <KeyRound className="h-3.5 w-3.5" />
                                        Active API Provider / Model
                                      </Label>
                                      <Select
                                        value={googleWebModel}
                                        onValueChange={setGoogleWebModel}
                                      >
                                        <SelectTrigger className="text-xs h-9 bg-background font-semibold border-blue-500/30">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="gemini-2.5-flash" className="text-xs">🔵 Gemini 2.5 Flash</SelectItem>
                                          <SelectItem value="gemini-2.5-pro" className="text-xs">🔵 Gemini 2.5 Pro</SelectItem>
                                          <SelectItem value="gemini-2.0-flash" className="text-xs">🔵 Gemini 2.0 Flash</SelectItem>
                                        </SelectContent>
                                      </Select>

                                      {/* ── Gemini Premium Model Picker ── only visible when google is selected */}
                                      {webProvider === 'google' && (() => {
                                        const GEMINI_MODELS = [
                                          { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', badge: 'Más potente', cost: 4, description: 'Máxima calidad y razonamiento. Ideal para proyectos complejos.' },
                                          { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', badge: 'Recomendado', cost: 2, description: 'Balance perfecto entre velocidad y calidad.' },
                                          { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', badge: 'Rápido', cost: 2, description: 'Generación ultrarrápida con buena calidad.' },
                                        ] as const;
                                        const selectedCost = calculateModelCreditCost('ai-web', 'google', googleWebModel);
                                        const remaining = Math.max(0, credits - selectedCost);
                                        const canAfford = credits >= selectedCost;
                                        return (
                                          <div className="mt-2 space-y-2">
                                            {/* Header */}
                                            <div className="flex items-center justify-between">
                                              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">
                                                🔵 Seleccionar modelo Gemini
                                              </span>
                                              <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[9px] font-bold text-amber-400 border border-amber-500/30">
                                                👑 Premium
                                              </span>
                                            </div>

                                            {/* Model cards grid */}
                                            <div className="relative grid gap-1.5">
                                              {GEMINI_MODELS.map((model) => {
                                                const isSelected = googleWebModel === model.id;
                                                const modelCost = calculateModelCreditCost('ai-web', 'google', model.id);
                                                const modelRemaining = Math.max(0, credits - modelCost);
                                                const modelAffordable = credits >= modelCost;
                                                return (
                                                  <button
                                                    key={model.id}
                                                    type="button"
                                                    onClick={() => setGoogleWebModel(model.id)}
                                                    className={[
                                                      'relative w-full rounded-xl border px-3 py-2.5 text-left transition-all duration-200',
                                                      isSelected
                                                        ? 'border-blue-500/60 bg-blue-500/10 shadow-[0_0_0_1px_rgba(59,130,246,0.3)]'
                                                        : 'border-border/40 bg-muted/20 hover:border-blue-500/30 hover:bg-muted/40',
                                                      'cursor-pointer',
                                                    ].join(' ')}
                                                  >
                                                    <div className="flex items-start justify-between gap-2">
                                                      <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-1.5">
                                                          <span className={`text-[11px] font-bold ${isSelected ? 'text-blue-400' : 'text-foreground'}`}>
                                                            {model.label}
                                                          </span>
                                                          <span className={`rounded-full px-1.5 py-px text-[8px] font-black uppercase tracking-wide ${model.badge === 'Más potente' ? 'bg-violet-500/20 text-violet-400' :
                                                              model.badge === 'Recomendado' ? 'bg-blue-500/20 text-blue-400' :
                                                                'bg-emerald-500/20 text-emerald-400'
                                                            }`}>
                                                            {model.badge}
                                                          </span>
                                                        </div>
                                                        <p className="mt-0.5 text-[10px] text-muted-foreground leading-snug">{model.description}</p>
                                                      </div>
                                                      {/* Cost pill */}
                                                      <div className="hidden">
                                                        <span className={`rounded-lg px-2 py-1 text-[10px] font-black ${modelAffordable
                                                            ? 'bg-blue-500/15 text-blue-400'
                                                            : 'bg-red-500/15 text-red-400'
                                                          }`}>
                                                          {modelCost} cr
                                                        </span>
                                                        {isSelected && (
                                                          <span className="text-[8px] text-muted-foreground">
                                                            →&nbsp;{modelRemaining.toFixed(1)} restantes
                                                          </span>
                                                        )}
                                                      </div>
                                                    </div>
                                                    {/* Selected indicator */}
                                                    {isSelected && (
                                                      <span className="absolute right-2 top-2 size-2 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.8)]" />
                                                    )}
                                                  </button>
                                                );
                                              })}

                                            </div>

                                            {/* ── Credit summary card ── */}
                                            <div className={`hidden rounded-xl border p-3.5 space-y-3 transition-all duration-300 ${
                                              canAfford
                                                ? 'border-blue-500/25 bg-blue-500/5'
                                                : 'border-red-500/40 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                                            }`}>
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5">
                                                  <Zap className={`size-3.5 ${canAfford ? 'text-blue-400' : 'text-red-400 animate-bounce'}`} />
                                                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Resumen de créditos</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                                    canAfford
                                                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                                      : 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                                                  }`}>
                                                    {credits <= 0 ? 'Sin créditos' : canAfford ? '✓ Suficientes' : '✗ Saldo insuficiente'}
                                                  </span>
                                                </div>
                                              </div>

                                              <div className="grid grid-cols-3 divide-x divide-border/40 text-center">
                                                <div className="px-2">
                                                  <p className="text-[9px] text-muted-foreground">Balance actual</p>
                                                  <p className={`text-base font-black ${credits <= 0 ? 'text-red-400' : 'text-foreground'}`}>
                                                    {credits.toFixed(1)}
                                                  </p>
                                                </div>
                                                <div className="px-2">
                                                  <p className="text-[9px] text-muted-foreground">Costo ({googleWebModel.replace('gemini-', '')})</p>
                                                  <p className={`text-base font-black ${canAfford ? 'text-blue-400' : 'text-red-400'}`}>
                                                    −{selectedCost.toFixed(1)}
                                                  </p>
                                                </div>
                                                <div className="px-2">
                                                  <p className="text-[9px] text-muted-foreground">Quedarán</p>
                                                  <p className={`text-base font-black ${canAfford ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    {remaining.toFixed(1)}
                                                  </p>
                                                </div>
                                              </div>

                                              {/* Credit consumption bar */}
                                              <div className="space-y-1">
                                                <div className="h-2 w-full overflow-hidden rounded-full bg-muted/50 p-0.5 border border-border/40">
                                                  <div
                                                    className={`h-full rounded-full transition-all duration-500 ${
                                                      credits <= 0
                                                        ? 'w-0 bg-red-500'
                                                        : canAfford
                                                          ? 'bg-gradient-to-r from-blue-500 to-emerald-400'
                                                          : 'bg-red-500 animate-pulse'
                                                    }`}
                                                    style={{ width: `${Math.max(0, Math.min(100, (remaining / Math.max(credits, 1)) * 100))}%` }}
                                                  />
                                                </div>
                                                <div className="flex justify-between text-[8px] text-muted-foreground px-0.5">
                                                  <span>0 cr</span>
                                                  <span>Consumo: {selectedCost.toFixed(1)} cr</span>
                                                  <span>{credits.toFixed(1)} cr</span>
                                                </div>
                                              </div>

                                              {/* ── ALERTA: Sin créditos o créditos insuficientes ── */}
                                              {(!canAfford || credits <= 0) && (
                                                <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 space-y-2">
                                                  <div className="flex items-start gap-2">
                                                    <AlertCircle className="size-4 text-red-400 shrink-0 mt-0.5" />
                                                    <div className="flex-1 min-w-0">
                                                      <p className="text-xs font-bold text-red-400">
                                                        {credits <= 0
                                                          ? '¡Te has quedado sin créditos!'
                                                          : `Necesitas ${selectedCost.toFixed(1)} créditos para generar con este modelo`}
                                                      </p>
                                                      <p className="text-[10px] text-muted-foreground mt-0.5">
                                                        {credits <= 0
                                                          ? 'Has consumido todos tus créditos. Compra un pack para seguir generando con los modelos Gemini.'
                                                          : `Tu saldo actual es de ${credits.toFixed(1)} créditos. Te faltan ${(selectedCost - credits).toFixed(1)} créditos.`}
                                                      </p>
                                                    </div>
                                                  </div>
                                                  <div className="flex items-center gap-2 pt-1">
                                                    <Button
                                                      type="button"
                                                      size="sm"
                                                      onClick={() => setShowTopupSection((prev) => !prev)}
                                                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold text-xs h-8 shadow-md shadow-blue-500/20"
                                                    >
                                                      <ShoppingCart className="size-3.5 mr-1.5" />
                                                      Comprar más créditos
                                                      {showTopupSection ? <ChevronUp className="size-3.5 ml-1" /> : <ChevronDown className="size-3.5 ml-1" />}
                                                    </Button>
                                                  </div>
                                                </div>
                                              )}

                                              {/* ── Botón para desplegar compra si sí tiene créditos ── */}
                                              {canAfford && credits > 0 && (
                                                <div className="flex items-center justify-between pt-1">
                                                  <span className="text-[9px] text-muted-foreground">
                                                    Modelo: <strong className="text-blue-400">{googleWebModel}</strong>
                                                  </span>
                                                  <button
                                                    type="button"
                                                    onClick={() => setShowTopupSection((prev) => !prev)}
                                                    className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors"
                                                  >
                                                    <ShoppingCart className="size-3" />
                                                    {showTopupSection ? 'Ocultar recargas' : 'Recargar créditos'}
                                                    {showTopupSection ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                                                  </button>
                                                </div>
                                              )}

                                              {/* ── SECCIÓN DESPLEGABLE: Packs de compra de créditos ── */}
                                              {showTopupSection && (
                                                <div className="mt-3 border-t border-border/40 pt-3 space-y-2.5">
                                                  <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 flex items-center gap-1">
                                                      ⚡ Packs de Recarga Inmediata
                                                    </span>
                                                    <Link
                                                      href="/prices"
                                                      className="text-[9px] text-muted-foreground hover:text-blue-400 underline transition-colors"
                                                    >
                                                      Ver en /prices →
                                                    </Link>
                                                  </div>
                                                  <div className="grid grid-cols-1 gap-2">
                                                    {CREDIT_PACKS.map((pack) => {
                                                      const price = formatCreditPackPrice(pack, 'es');
                                                      return (
                                                        <div
                                                          key={pack.id}
                                                          className={`relative flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                                                            pack.featured
                                                              ? 'border-blue-500/50 bg-blue-500/10 shadow-sm'
                                                              : 'border-border/40 bg-muted/20 hover:border-border'
                                                          }`}
                                                        >
                                                          <div className="flex-1 min-w-0 pr-2">
                                                            <div className="flex items-center gap-1.5">
                                                              <span className="text-xs font-black text-foreground">
                                                                {pack.credits} créditos
                                                              </span>
                                                              {pack.bonusCredits > 0 && (
                                                                <span className="rounded-full bg-emerald-500/20 px-1.5 py-px text-[8px] font-black text-emerald-400 border border-emerald-500/30">
                                                                  +{pack.bonusCredits} regalo
                                                                </span>
                                                              )}
                                                              {pack.featured && (
                                                                <span className="rounded-full bg-blue-500/20 px-1.5 py-px text-[8px] font-black text-blue-400 border border-blue-500/30">
                                                                  Popular
                                                                </span>
                                                              )}
                                                            </div>
                                                            <p className="text-[9px] text-muted-foreground line-clamp-1 mt-0.5">
                                                              {pack.description.es}
                                                            </p>
                                                          </div>
                                                          <div className="flex items-center gap-2 shrink-0">
                                                            <span className="text-xs font-black text-foreground">
                                                              {price}
                                                            </span>
                                                            <Button
                                                              asChild
                                                              size="sm"
                                                              className={`h-7 px-2.5 text-[10px] font-bold ${
                                                                pack.featured
                                                                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                                                  : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                                                              }`}
                                                            >
                                                              <Link href={`/dashboard/credits?pack=${pack.id}`}>
                                                                Comprar
                                                              </Link>
                                                            </Button>
                                                          </div>
                                                        </div>
                                                      );
                                                    })}
                                                  </div>
                                                  <p className="text-[8px] text-center text-muted-foreground">
                                                    Los créditos comprados no caducan y se suman a tu balance actual.
                                                  </p>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })()}
                                    </div>

                                    <div className="col-span-2 w-full rounded-lg border border-blue-500/25 bg-blue-500/5 p-3 space-y-1.5">
                                      <div className="flex items-center justify-between">
                                        <Label className="text-xs font-bold flex items-center gap-1.5">
                                          <KeyRound className="h-3 w-3 text-blue-500" />
                                          Gemini administrado por Prompt Studio
                                        </Label>
                                        <span className="rounded-full border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 text-[9px] font-bold text-amber-400">Premium</span>
                                      </div>
                                      <p className="text-[11px] text-muted-foreground">No necesitas agregar una API key. La generación web usa de forma segura la integración Gemini de Prompt Studio.</p>
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
                                          <SelectItem value="blue" className="text-xs">🔵 Royal Blue</SelectItem>
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
                                      <Label className="text-xs font-bold text-blue-500 flex items-center gap-1.5">
                                        <KeyRound className="h-3.5 w-3.5" />
                                        Active API Provider / Model
                                      </Label>
                                      <Select
                                        value={chatProvider === 'google' ? 'google' : `${chatProvider === 'openai' ? 'openai-chat' : chatProvider}:${chatProvider === 'openai' ? openAIChatModel : chatProvider === 'anthropic' ? anthropicModel : googleWebModel}`}
                                        onValueChange={(val) => {
                                          if (val === 'google') {
                                            setChatProvider('google');
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
                                        <SelectTrigger className="text-xs h-9 bg-background font-semibold border-blue-500/30">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>

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
                                              <Label className="text-xs font-bold flex items-center gap-1.5"><KeyRound className="h-3 w-3 text-blue-500" />OpenAI API Key</Label>
                                              {openAIKey ? <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">✓ Active</span> : <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline font-medium">Get API Key →</a>}
                                            </div>
                                            <Input type="password" placeholder="sk-proj-..." value={openAIKey} onChange={(e) => setOpenAIKey(e.target.value)} className="text-xs bg-background h-9 rounded-lg" />
                                          </div>
                                        );
                                        if (chatProvider === 'anthropic') return (
                                          <div className="mt-3 rounded-lg border bg-muted/30 p-3 space-y-2">
                                            <div className="flex items-center justify-between">
                                              <Label className="text-xs font-bold flex items-center gap-1.5"><KeyRound className="h-3 w-3 text-blue-500" />Anthropic API Key</Label>
                                              {anthropicKey ? <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">✓ Active</span> : <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline font-medium">Get API Key →</a>}
                                            </div>
                                            <Input type="password" placeholder="sk-ant-..." value={anthropicKey} onChange={(e) => setAnthropicKey(e.target.value)} className="text-xs bg-background h-9 rounded-lg" />
                                          </div>
                                        );
                                        if (chatProvider === 'google') return (
                                          <div className="mt-3 rounded-lg border bg-muted/30 p-3 space-y-2">
                                            <div className="flex items-center justify-between">
                                              <Label className="text-xs font-bold flex items-center gap-1.5"><KeyRound className="h-3 w-3 text-blue-500" />Google Gemini API Key</Label>
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

                          {activeTab === 'ai-web' ? (
                            <aside className={`rounded-xl border p-4 ${credits <= 0 ? 'border-red-500/40 bg-red-500/10' : 'border-blue-500/25 bg-blue-500/5'}`} aria-label="Resumen de créditos">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                  <strong className="text-sm">Tus créditos</strong>
                                  <p className="mt-1 text-[11px] text-muted-foreground">Consulta tu saldo y el consumo acumulado.</p>
                                </div>
                                {credits <= 0 && <span className="rounded-full border border-red-500/40 bg-red-500/15 px-2.5 py-1 text-[10px] font-bold text-red-400">Sin créditos</span>}
                              </div>
                              <div className="mt-4 grid grid-cols-2 divide-x divide-border/50 text-center">
                                <div className="px-3">
                                  <p className="text-[10px] text-muted-foreground">Créditos disponibles</p>
                                  <p className={`mt-1 text-xl font-black ${credits <= 0 ? 'text-red-400' : 'text-emerald-400'}`}>{credits.toFixed(1)}</p>
                                </div>
                                <div className="px-3">
                                  <p className="text-[10px] text-muted-foreground">Créditos gastados</p>
                                  <p className="mt-1 text-xl font-black text-foreground">{creditsSpent.toFixed(1)}</p>
                                </div>
                              </div>
                              {credits <= 0 && (
                                <div className="mt-4 rounded-lg border border-red-500/30 bg-background/40 p-3">
                                  <p className="text-xs font-bold text-red-400">Necesitas más créditos para continuar.</p>
                                  <Button asChild size="sm" className="mt-2 w-full bg-blue-600 text-white hover:bg-blue-700">
                                    <Link href="/dashboard/credits"><ShoppingCart className="mr-1.5 size-3.5" />Comprar más créditos</Link>
                                  </Button>
                                </div>
                              )}
                            </aside>
                          ) : (
                            <GenerationCostDisclosure kind={activeTab === 'ai-video' ? 'video' : activeTab === 'pure-text' ? 'project' : 'image'} provider={activeTab === 'ai-video' ? videoProvider : activeTab === 'pure-text' ? chatProvider : imageProvider} />
                          )}

                          {/* Trigger button */}
                          {(() => {
                            const getButtonConfig = () => {
                              if (activeTab === 'ai-video') {
                                return {
                                  gradient: '!bg-gradient-to-r !from-blue-600 !to-cyan-500 hover:!from-blue-700 hover:!to-cyan-600 dark:!from-blue-500 dark:!to-cyan-400 dark:hover:!from-blue-600 dark:hover:!to-cyan-500',
                                  shadow: '!shadow-lg !shadow-blue-500/20 hover:!shadow-blue-500/40 dark:!shadow-blue-500/15 dark:hover:!shadow-cyan-500/30',
                                  icon: <Clapperboard className="h-4 w-4 !text-white animate-pulse" />,
                                  text: isSpanish ? 'Generar Video IA' : 'Generate AI Video',
                                  border: '!border !border-blue-500/20 dark:!border-cyan-400/30',
                                  ring: 'hover:!ring-2 hover:!ring-offset-2 hover:!ring-offset-background hover:!ring-blue-500/50 dark:hover:!ring-cyan-400/50'
                                };
                              }
                              if (activeTab === 'ai-web') {
                                return {
                                  gradient: '!bg-gradient-to-r !from-blue-600 !to-cyan-500 hover:!from-blue-700 hover:!to-cyan-600 dark:!from-blue-500 dark:!to-cyan-400 dark:hover:!from-blue-600 dark:hover:!to-cyan-500',
                                  shadow: '!shadow-lg !shadow-blue-500/20 hover:!shadow-blue-500/40 dark:!shadow-emerald-500/15 dark:hover:!shadow-emerald-500/35',
                                  icon: <Globe className="h-4 w-4 !text-white animate-pulse" />,
                                  text: 'Generate Landing Code',
                                  border: '!border !border-blue-500/20 dark:!border-emerald-400/30',
                                  ring: 'hover:!ring-2 hover:!ring-offset-2 hover:!ring-offset-background hover:!ring-blue-500/50 dark:hover:!ring-emerald-400/50'
                                };
                              }
                              // Default to Image
                              return {
                                gradient: '!bg-gradient-to-r !from-blue-600 !to-blue-600 hover:!from-blue-700 hover:!to-blue-700 dark:!from-sky-400 dark:!to-blue-500 dark:hover:!from-sky-500 dark:hover:!to-blue-600',
                                shadow: '!shadow-lg !shadow-blue-500/20 hover:!shadow-blue-500/40 dark:!shadow-sky-500/15 dark:hover:!shadow-sky-500/35',
                                icon: <Sparkles className="h-4 w-4 !text-white animate-pulse" />,
                                text: isSpanish ? 'Generar Imagen IA' : 'Generate AI Image',
                                border: '!border !border-blue-500/20 dark:!border-sky-400/30',
                                ring: 'hover:!ring-2 hover:!ring-offset-2 hover:!ring-offset-background hover:!ring-blue-500/50 dark:hover:!ring-sky-400/50'
                              };
                            };

                            const btn = getButtonConfig();

                            return (
                              <div className="pt-2">
                                <Button
                                  type="submit"
                                  disabled={!editingText.trim() || isPending || localGenerating}
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

                        </div>
                      </Tabs>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Side: Preview Column */}
                <div className={`${isPreviewCollapsed ? 'hidden' : isEditorCollapsed ? 'lg:col-span-12' : 'lg:col-span-5'} flex flex-col h-full transition-all duration-300`}>
                  <Card className="shadow-lg border bg-card text-card-foreground flex flex-col flex-1 min-h-[480px] lg:min-h-0 overflow-hidden">

                    {/* Preview Headers */}
                    <div className="border-b bg-muted/20 px-4 py-3 flex items-center justify-between">
                      <span className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
                        {activeTab === 'pure-text' ? (
                          <>
                            <Sparkles className="h-4 w-4 text-blue-500" /> AI Workspace Toolbox
                          </>
                        ) : (
                          <>
                            <Tv className="h-4 w-4 text-blue-500" /> Live Render Preview
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
                      <Button type="button" variant="ghost" size="icon" className="ml-2 h-8 w-8 shrink-0 text-muted-foreground hover:text-blue-500" onClick={() => setIsPreviewCollapsed(true)} aria-label="Minimize Live Render Preview">
                        <Menu className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Render Container */}
                    <div className="p-4 flex-1 flex flex-col justify-center bg-muted/30 relative">

                      {/* Generative Loading Screen */}
                      <GenerationProgress active={localGenerating} pending={isPending} progress={genProgress} status={genStatus} />
                      <GenerationErrorNotice error={generationError} />

                      {/* --- IMAGE RESULT PREVIEW --- */}
                      {activeTab === 'ai-image' && (
                        <div className="w-full h-full flex flex-col justify-center items-center">
                          {outputImageUrl ? (
                            outputImageUrl.startsWith('data:text/gemini,') ? (
                              // Gemini text-model result: show description card
                              <div className="relative w-full rounded-xl border bg-gradient-to-br from-blue-50 to-blue-50 dark:from-blue-950/20 dark:to-blue-950/20 p-5 shadow-inner space-y-3">
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
                              <div className="p-4 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 inline-block">
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
                              <Sparkles className="h-4 w-4 text-blue-500" />
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
                                      className={`text-[9px] uppercase tracking-wider ${item.type === 'image' ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20' :
                                        item.type === 'video' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' :
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
                                      className="h-8 text-[11px] font-semibold flex-1 gap-1 bg-blue-600 hover:bg-blue-700 text-white border-0"
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
                              <div className="p-4 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 inline-block animate-pulse">
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
          </motion.div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
