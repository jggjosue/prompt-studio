import {
  AI_OPERATION_CATALOG,
  AI_OPERATION_CODES,
  getAIOperation,
  getAIOperationCreditCost,
  getAIOperationsByCategory,
  getEnabledAIOperation,
  isAIOperationCode,
} from '@/lib/ai-operation-catalog';

describe('AI operation catalog', () => {
  it('contains unique stable operation codes', () => {
    expect(new Set(AI_OPERATION_CODES).size).toBe(AI_OPERATION_CODES.length);
    for (const code of AI_OPERATION_CODES) {
      expect(AI_OPERATION_CATALOG[code].code).toBe(code);
    }
  });

  it('keeps component preview free', () => {
    const preview = getAIOperation('COMPONENT_PREVIEW');
    expect(preview.creditCost).toBe(0);
    expect(preview.isFree).toBe(true);
  });

  it('uses the agreed initial image and video prices', () => {
    expect(getAIOperationCreditCost('IMAGE_LITE_1K')).toBe(15);
    expect(getAIOperationCreditCost('IMAGE_QUALITY_4K')).toBe(70);
    expect(getAIOperationCreditCost('VIDEO_LITE_720_8S')).toBe(180);
    expect(getAIOperationCreditCost('VIDEO_FAST_1080_8S')).toBe(430);
    expect(getAIOperationCreditCost('VIDEO_PREMIUM_8S')).toBe(1425);
  });

  it('rejects unknown or disabled operation identifiers', () => {
    expect(isAIOperationCode('TEXT_SHORT')).toBe(true);
    expect(isAIOperationCode('NOT_REAL')).toBe(false);
    expect(getEnabledAIOperation('NOT_REAL')).toBeNull();
  });

  it('returns enabled operations by category', () => {
    const images = getAIOperationsByCategory('image');
    expect(images).toHaveLength(4);
    expect(images.every((operation) => operation.category === 'image' && operation.enabled)).toBe(true);
  });

  it('marks project code audit as variable pricing with a 50-credit floor', () => {
    const projectAudit = getAIOperation('CODE_AUDIT_PROJECT');
    expect(projectAudit.variablePricing).toBe(true);
    expect(projectAudit.creditCost).toBe(50);
  });

  it('defaults billable operations to the 75 percent minimum margin target', () => {
    expect(getAIOperation('TEXT_SHORT').minimumMarginPercent).toBe(75);
    expect(getAIOperation('VIDEO_PREMIUM_8S').minimumMarginPercent).toBe(75);
  });
});
