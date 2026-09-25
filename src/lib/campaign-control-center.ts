export type CampaignControlJob = {
  status: string;
  progress: number;
  creditCost: number;
  estimatedCostUsd: number;
  actualCostUsd: number | null;
  feedbackUseful: boolean | null;
};

export type CampaignControlInput = {
  brief: string;
  brandConfigured: boolean;
  promptCount: number;
  jobs: CampaignControlJob[];
  reviewStatus: 'draft' | 'review' | 'approved' | 'published';
  publicationCount: number;
};

export type CampaignStageStatus = 'complete' | 'active' | 'pending' | 'blocked';

export function campaignControlCenter(input: CampaignControlInput) {
  const terminal = input.jobs.filter(job => ['completed', 'failed'].includes(job.status));
  const completed = input.jobs.filter(job => job.status === 'completed');
  const failed = input.jobs.filter(job => job.status === 'failed');
  const evaluated = completed.filter(job => job.feedbackUseful !== null);
  const approved = input.reviewStatus === 'approved' || input.reviewStatus === 'published';
  const published = input.publicationCount > 0;
  const generationProgress = input.jobs.length
    ? Math.round(input.jobs.reduce((sum, job) => sum + Math.max(0, Math.min(100, job.progress)), 0) / input.jobs.length)
    : 0;
  const evaluationProgress = completed.length ? Math.round(evaluated.length / completed.length * 100) : 0;

  const stages = [
    { key: 'brief', label: 'Brief', progress: input.brief.trim().length >= 20 ? 100 : 0, status: input.brief.trim().length >= 20 ? 'complete' : 'active', pending: input.brief.trim().length >= 20 ? null : 'Completar el brief' },
    { key: 'brand', label: 'Brand Kit', progress: input.brandConfigured ? 100 : 0, status: input.brandConfigured ? 'complete' : 'active', pending: input.brandConfigured ? null : 'Aplicar identidad de marca' },
    { key: 'prompts', label: 'Prompts', progress: input.promptCount ? 100 : 0, status: input.promptCount ? 'complete' : 'pending', pending: input.promptCount ? null : 'Preparar prompts coordinados' },
    { key: 'generations', label: 'Generaciones', progress: generationProgress, status: failed.length ? 'blocked' : input.jobs.length && terminal.length === input.jobs.length ? 'complete' : terminal.length || generationProgress ? 'active' : 'pending', pending: failed.length ? `Reintentar ${failed.length} resultado${failed.length === 1 ? '' : 's'}` : completed.length === input.jobs.length && input.jobs.length ? null : `${input.jobs.length - terminal.length} generación${input.jobs.length - terminal.length === 1 ? '' : 'es'} pendiente${input.jobs.length - terminal.length === 1 ? '' : 's'}` },
    { key: 'evaluation', label: 'Evaluación', progress: evaluationProgress, status: completed.length && evaluated.length === completed.length && terminal.length === input.jobs.length ? 'complete' : evaluated.length ? 'active' : 'pending', pending: completed.length === evaluated.length && completed.length ? null : `Evaluar ${completed.length - evaluated.length} resultado${completed.length - evaluated.length === 1 ? '' : 's'}` },
    { key: 'approval', label: 'Aprobación', progress: approved ? 100 : input.reviewStatus === 'review' ? 50 : 0, status: approved ? 'complete' : input.reviewStatus === 'review' ? 'active' : 'pending', pending: approved ? null : input.reviewStatus === 'review' ? 'Resolver la revisión y aprobar resultados' : 'Enviar resultados a revisión' },
    { key: 'publication', label: 'Publicación', progress: published ? 100 : 0, status: published ? 'complete' : approved ? 'active' : 'pending', pending: published ? null : approved ? 'Publicar o exportar la salida aprobada' : 'Aprobar resultados antes de publicar' },
  ] as Array<{key:string;label:string;progress:number;status:CampaignStageStatus;pending:string|null}>;

  const firstIncomplete = stages.find(stage => stage.status !== 'complete');
  const actionByStage: Record<string, { label: string; href: string }> = {
    brief: { label: 'Completar brief', href: '#campaign-create' },
    brand: { label: 'Configurar Brand Kit', href: '/dashboard/brand-kits' },
    prompts: { label: 'Preparar prompts', href: '/dashboard/prompt-lab' },
    generations: { label: failed.length ? 'Reintentar fallidos' : 'Revisar generaciones', href: '#campaign-generations' },
    evaluation: { label: 'Evaluar resultados', href: '/dashboard/generations' },
    approval: { label: input.reviewStatus === 'review' ? 'Resolver revisión' : 'Enviar a revisión', href: '/dashboard/projects' },
    publication: { label: 'Publicar landing', href: '/dashboard/publications' },
  };

  return {
    stages,
    progress: Math.round(stages.reduce((sum, stage) => sum + stage.progress, 0) / stages.length),
    pending: stages.flatMap(stage => stage.pending ? [stage.pending] : []),
    nextAction: firstIncomplete ? { stage: firstIncomplete.key, ...actionByStage[firstIncomplete.key] } : { stage: 'complete', label: 'Campaña terminada', href: '#' },
    costs: {
      credits: input.jobs.reduce((sum, job) => sum + job.creditCost, 0),
      estimatedUsd: Math.round(input.jobs.reduce((sum, job) => sum + job.estimatedCostUsd, 0) * 100) / 100,
      actualUsd: completed.some(job => job.actualCostUsd !== null)
        ? Math.round(completed.reduce((sum, job) => sum + (job.actualCostUsd ?? 0), 0) * 100) / 100
        : null,
    },
  };
}
