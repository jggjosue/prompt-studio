export type TagCategory = {
  name: string;
  count: number;
  description: string;
  icon: string;
  tags: {
    name: string;
    count: number;
  }[];
};

const visualStyles: TagCategory = {
  name: 'Visual Styles',
  count: 19,
  description: 'Overall visual aesthetic and artistic styles',
  icon: 'Palette',
  tags: [
    { name: 'Cinematic', count: 1317 },
    { name: 'Photorealistic', count: 1076 },
    { name: 'Ultra Realistic', count: 650 },
    { name: 'High Fashion', count: 544 },
    { name: 'Luxury Aesthetic', count: 513 },
    { name: 'Editorial Style', count: 402 },
    { name: 'Documentary Style', count: 328 },
    { name: 'Surreal Realism', count: 296 },
    { name: 'Minimalist Aesthetic', count: 244 },
    { name: 'Hyper Realistic', count: 232 },
    { name: 'Fine Art', count: 164 },
    { name: 'Dramatic Lighting', count: 20 },
    { name: 'Golden Hour', count: 8 },
    { name: 'Soft Light', count: 5 },
    { name: 'Magical Realism', count: 5 },
    { name: 'Studio Lighting', count: 4 },
    { name: 'Natural Light', count: 2 },
    { name: 'Grid Layout', count: 1 },
    { name: 'Low Key', count: 1 },
  ],
};

const subjects: TagCategory = {
  name: 'Subjects',
  count: 11,
  description: 'Main subjects and objects featured in images',
  icon: 'Image',
  tags: [
    { name: 'Human Portrait', count: 4986 },
    { name: 'Fashion Model', count: 947 },
    { name: 'Product Showcase', count: 180 },
    { name: 'Food Photography', count: 160 },
    { name: 'Landscape Nature', count: 99 },
    { name: 'Still Life', count: 87 },
    { name: 'Architecture', count: 80 },
    { name: 'Wildlife', count: 57 },
    { name: 'Abstract Geometry', count: 40 },
    { name: 'Floral Portrait', count: 12 },
    { name: 'Triptych', count: 1 },
  ],
};

export const imageTagsData: TagCategory[] = [visualStyles, subjects];
