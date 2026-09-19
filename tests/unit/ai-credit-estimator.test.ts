import { estimateAICredits, type CreditEstimateInput, getAIModelConfig, AI_MODEL_CONFIG } from '../../src/lib/ai-credit-config';

describe('AI Credit Estimator', () => {
  it('calculates minimum credits for low-cost Gemini models', () => {
    const input: CreditEstimateInput = {
      provider: 'google',
      model: 'gemini-2.5-flash',
      kind: 'project',
      input: 'A simple prompt',
    };
    const estimate = estimateAICredits(input);
    expect(estimate.credits).toBeGreaterThanOrEqual(1);
    expect(estimate.estimatedApiCostUsd).toBeGreaterThanOrEqual(0);
  });

  it('calculates minimum credits for expensive Gemini models', () => {
    const input: CreditEstimateInput = {
      provider: 'google',
      model: 'gemini-2.5-pro',
      kind: 'project',
      input: 'A complex prompt for pro',
    };
    const estimate = estimateAICredits(input);
    expect(estimate.credits).toBeGreaterThanOrEqual(3);
  });

  it('calculates minimum credits for Claude models', () => {
    const input: CreditEstimateInput = {
      provider: 'anthropic',
      model: 'claude-3-5-sonnet-20240620',
      kind: 'project',
      input: 'A complex prompt for claude',
    };
    const estimate = estimateAICredits(input);
    expect(estimate.credits).toBeGreaterThanOrEqual(8);
  });

  it('calculates increased credits for large context', () => {
    const input: CreditEstimateInput = {
      provider: 'google',
      model: 'gemini-2.5-flash',
      kind: 'project',
      input: 'A'.repeat(100_000), // Huge prompt
    };
    const smallInput: CreditEstimateInput = {
      ...input,
      input: 'Small prompt',
    };
    const largeEstimate = estimateAICredits(input);
    const smallEstimate = estimateAICredits(smallInput);
    
    // The large context should result in equal or higher credit cost
    expect(largeEstimate.credits).toBeGreaterThanOrEqual(smallEstimate.credits);
    expect(largeEstimate.estimatedApiCostUsd).toBeGreaterThan(smallEstimate.estimatedApiCostUsd);
  });

  it('throws for unsupported models', () => {
    const input: CreditEstimateInput = {
      provider: 'openai',
      model: 'non-existent-model',
      kind: 'project',
      input: 'Test',
    };
    expect(() => estimateAICredits(input)).toThrow('MODEL_NOT_ALLOWED');
  });
});