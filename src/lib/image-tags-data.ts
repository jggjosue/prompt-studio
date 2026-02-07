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

const composition: TagCategory = {
  name: 'Composition',
  count: 24,
  description: 'Framing and composition techniques',
  icon: 'Frame',
  tags: [
    { name: 'Centered', count: 1287 },
    { name: 'Close Up', count: 929 },
    { name: 'Low Angle', count: 348 },
    { name: 'Wide Angle', count: 321 },
    { name: 'Symmetrical', count: 196 },
    { name: 'Grid Layout', count: 157 },
    { name: 'Macro Detail', count: 121 },
    { name: 'Overhead View', count: 118 },
    { name: 'Extreme Close Up', count: 87 },
    { name: 'Rule Of Thirds', count: 84 },
    { name: '3x3 Grid', count: 70 },
    { name: 'Triptych', count: 62 },
    { name: 'Cinematic', count: 28 },
    { name: 'Dramatic Lighting', count: 15 },
    { name: 'Editorial Style', count: 6 },
    { name: 'Natural Light', count: 4 },
    { name: 'Portrait Orientation', count: 4 },
    { name: 'Minimalist Aesthetic', count: 4 },
    { name: 'Silhouette', count: 4 },
    { name: 'Golden Hour', count: 4 },
  ],
};

const brandsAndProducts: TagCategory = {
  name: 'Brands & Products',
  count: 16,
  description: 'Specific brands, companies, and product types',
  icon: 'Store',
  tags: [
    { name: 'Nike', count: 42 },
    { name: 'Apple', count: 22 },
    { name: 'Adidas', count: 16 },
    { name: 'Dior', count: 14 },
    { name: 'Canon', count: 13 },
    { name: 'Chanel', count: 12 },
    { name: 'Coca Cola', count: 12 },
    { name: 'Bmw', count: 8 },
    { name: 'Starbucks', count: 8 },
    { name: 'Gucci', count: 8 },
    { name: 'Google', count: 7 },
    { name: 'Tesla', count: 6 },
    { name: 'Mercedes', count: 3 },
    { name: 'Pepsi', count: 3 },
    { name: 'Sony', count: 2 },
    { name: 'Microsoft', count: 1 },
  ],
};

const lighting: TagCategory = {
  name: 'Lighting',
  count: 17,
  description: 'Lighting styles and techniques',
  icon: 'Lightbulb',
  tags: [
    { name: 'Natural Light', count: 1912 },
    { name: 'Soft Light', count: 1249 },
    { name: 'Dramatic Lighting', count: 1017 },
    { name: 'Golden Hour', count: 488 },
    { name: 'Ambient Light', count: 466 },
    { name: 'Studio Lighting', count: 219 },
    { name: 'Diffused Light', count: 127 },
    { name: 'High Key', count: 83 },
    { name: 'Low Key', count: 82 },
    { name: 'Backlight', count: 34 },
    { name: 'Rim Light', count: 34 },
    { name: 'Cinematic', count: 17 },
    { name: 'Spotlight', count: 14 },
    { name: 'Front Light', count: 1 },
    { name: 'Side Light', count: 1 },
    { name: 'Macro Detail', count: 1 },
    { name: 'Overhead View', count: 1 },
  ],
};

export const imageTagsData: TagCategory[] = [
  visualStyles,
  subjects,
  composition,
  brandsAndProducts,
  lighting,
];
