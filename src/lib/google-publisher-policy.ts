export type PolicySeverity = 'high' | 'medium';

export type PolicyCategory =
  | 'illegal_content'
  | 'intellectual_property'
  | 'dangerous_or_derogatory'
  | 'deceptive_practices'
  | 'sexual_content'
  | 'fraud_enabling'
  | 'malware_unwanted_software'
  | 'hidden_text_keyword_stuffing';

export interface PolicyViolation {
  category: PolicyCategory;
  severity: PolicySeverity;
  message: string;
  matchedTerm?: string;
}

export interface PolicyEvaluation {
  isCompliant: boolean;
  violations: PolicyViolation[];
}

type Rule = {
  category: PolicyCategory;
  severity: PolicySeverity;
  message: string;
  patterns: RegExp[];
};

const RULES: Rule[] = [
  {
    category: 'sexual_content',
    severity: 'high',
    message: 'Posible contenido sexual explícito o de explotación.',
    patterns: [/porn|pornography|hentai|rape|incest|bestiality|necrophilia/i],
  },
  {
    category: 'dangerous_or_derogatory',
    severity: 'high',
    message: 'Posible contenido de odio, violencia, acoso o autolesiones.',
    patterns: [/kill|murder|terrorist|suicide|self-harm|anorexia/i, /acoso|hostigamiento|intimidacion/i],
  },
  {
    category: 'fraud_enabling',
    severity: 'high',
    message: 'Posible facilitación de fraude, suplantación o espionaje.',
    patterns: [/fake passport|fake diploma|counterfeit id|phishing|credential theft|spyware|keylogger/i],
  },
  {
    category: 'deceptive_practices',
    severity: 'medium',
    message: 'Posibles prácticas engañosas o afirmaciones no fiables.',
    patterns: [/guaranteed money|quick money|miracle cure|anti-vaccine|climate hoax|misinformation/i],
  },
  {
    category: 'malware_unwanted_software',
    severity: 'high',
    message: 'Posible distribución de malware o software no deseado.',
    patterns: [/ransomware|trojan|rootkit|malware|virus|botnet/i],
  },
  {
    category: 'illegal_content',
    severity: 'high',
    message: 'Posible contenido ilegal o que promueve actividad ilegal.',
    patterns: [/how to make a bomb|illegal drugs|human trafficking|weapon trafficking/i],
  },
  {
    category: 'intellectual_property',
    severity: 'medium',
    message: 'Posible riesgo de abuso de propiedad intelectual.',
    patterns: [/sell counterfeit|fake brand|pirated software|cracked software/i],
  },
  {
    category: 'hidden_text_keyword_stuffing',
    severity: 'medium',
    message: 'Posible exceso de palabras clave o señales de texto oculto.',
    patterns: [
      /keyword stuffing|hidden text|texto oculto|doorway pages?|p[aá]ginas puerta/i,
      /buy now cheap|best price best price|free free free/i,
    ],
  },
];

function normalizeText(input: string) {
  return input.toLowerCase();
}

function detectKeywordStuffingSignals(text: string): PolicyViolation[] {
  const violations: PolicyViolation[] = [];
  const words = text
    .replace(/[^a-z0-9áéíóúñü\s]/gi, ' ')
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return violations;

  const freq = new Map<string, number>();
  for (const word of words) {
    if (word.length < 4) continue;
    freq.set(word, (freq.get(word) || 0) + 1);
  }

  const top = [...freq.entries()].sort((a, b) => b[1] - a[1])[0];
  if (top) {
    const [term, count] = top;
    const ratio = count / words.length;
    // conservative heuristic for repeated term abuse
    if (count >= 10 && ratio > 0.08) {
      violations.push({
        category: 'hidden_text_keyword_stuffing',
        severity: 'medium',
        message: 'Posible keyword stuffing por repetición excesiva de términos.',
        matchedTerm: `${term} (${count})`,
      });
    }
  }

  return violations;
}

export function evaluatePublisherPolicy(input: {
  title?: string;
  description?: string;
  tags?: string[];
}): PolicyEvaluation {
  const joined = [input.title || '', input.description || '', (input.tags || []).join(' ')].join(' ');
  const text = normalizeText(joined);

  const violations: PolicyViolation[] = [];

  for (const rule of RULES) {
    for (const pattern of rule.patterns) {
      const match = text.match(pattern);
      if (match) {
        violations.push({
          category: rule.category,
          severity: rule.severity,
          message: rule.message,
          matchedTerm: match[0],
        });
        break;
      }
    }
  }

  violations.push(...detectKeywordStuffingSignals(text));

  return {
    isCompliant: violations.length === 0,
    violations,
  };
}
