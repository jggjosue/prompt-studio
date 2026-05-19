import type { ReadabilityBadgeReport } from '@/components/readability-badge';
import type { LandingReadabilityPublicSnapshot } from '@/lib/landing-readability-store';

export function snapshotToBadgeReport(
  snapshot: LandingReadabilityPublicSnapshot
): ReadabilityBadgeReport {
  return {
    overallScore: snapshot.overallScore,
    grade: snapshot.grade,
    readingEase: snapshot.readingEase,
    gradeLevel: snapshot.gradeLevel,
    avgWordsPerSentence: snapshot.avgWordsPerSentence,
    headingScore: snapshot.headingScore,
    wordCount: snapshot.wordCount,
    locale: snapshot.locale,
    tips: snapshot.tips,
  };
}
