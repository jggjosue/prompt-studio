export type VerifiedProductReview = {
  author: string;
  comment: string;
  rating: number;
  verifiedPurchase: true;
};

export type ProductCustomization = {
  alt: string;
  imageUrl: string;
  projectName: string;
};

export type ProductSocialProof = {
  downloads?: number;
  projectsCreated?: number;
  rating?: number;
  ratingCount?: number;
  customizations?: ProductCustomization[];
  reviews?: VerifiedProductReview[];
};

// Registro editorial: solo se agregan métricas consolidadas y contenido con
// autorización del comprador. Mantener vacío es preferible a mostrar datos de ejemplo.
const PRODUCT_SOCIAL_PROOF: Record<string, ProductSocialProof> = {};

export function getProductSocialProof(slug: string): ProductSocialProof | null {
  const proof = PRODUCT_SOCIAL_PROOF[slug];
  if (!proof) return null;

  const downloads = proof.downloads && proof.downloads > 0 ? proof.downloads : undefined;
  const projectsCreated = proof.projectsCreated && proof.projectsCreated > 0
    ? proof.projectsCreated
    : undefined;
  const hasRating = Boolean(
    proof.rating && proof.rating > 0 && proof.rating <= 5 && proof.ratingCount && proof.ratingCount > 0
  );
  const customizations = (proof.customizations ?? []).filter(
    item => item.imageUrl.trim() && item.projectName.trim()
  );
  const reviews = (proof.reviews ?? []).filter(
    review => review.verifiedPurchase === true && review.comment.trim() && review.rating > 0 && review.rating <= 5
  );

  if (!downloads && !projectsCreated && !hasRating && customizations.length === 0 && reviews.length === 0) {
    return null;
  }

  return {
    downloads,
    projectsCreated,
    rating: hasRating ? proof.rating : undefined,
    ratingCount: hasRating ? proof.ratingCount : undefined,
    customizations,
    reviews,
  };
}
