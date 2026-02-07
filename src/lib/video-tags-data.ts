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
  count: 11,
  description: 'Overall visual aesthetic and style approaches',
  icon: 'Palette',
  tags: [
    { name: 'Cinematic', count: 840 },
    { name: 'Surreal Realism', count: 259 },
    { name: 'Magical Realism', count: 245 },
    { name: 'Documentary Style', count: 232 },
    { name: 'Photorealistic', count: 149 },
    { name: 'Ultra Realistic Cgi', count: 123 },
    { name: 'Hyper Realistic', count: 97 },
    { name: 'Minimalist Aesthetic', count: 48 },
    { name: 'Macro Close Up', count: 2 },
    { name: 'Time Lapse', count: 1 },
    { name: 'Sci Fi Chamber', count: 1 },
  ],
};

const brandsAndProducts: TagCategory = {
    name: 'Brands & Products',
    count: 14,
    description: 'Specific brands, companies, and product types',
    icon: 'Store',
    tags: [
        { name: 'Tesla', count: 21 },
        { name: 'Apple', count: 13 },
        { name: 'Coca Cola', count: 12 },
        { name: 'Ikea', count: 9 },
        { name: 'Nike', count: 8 },
        { name: 'Lego', count: 6 },
        { name: 'Adidas', count: 5 },
        { name: 'Bmw', count: 3 },
        { name: 'Rolex', count: 2 },
        { name: 'Starbucks', count: 2 },
        { name: 'Dior', count: 2 },
        { name: 'Samsung', count: 2 },
        { name: 'Google', count: 1 },
        { name: 'Pepsi', count: 1 },
    ]
};

const effectsAndTechniques: TagCategory = {
  name: 'Effects & Techniques',
  count: 12,
  description: 'Special effects, camera techniques, and production methods',
  icon: 'Wand2',
  tags: [
    { name: 'Slow Motion', count: 568 },
    { name: 'Macro Close Up', count: 219 },
    { name: 'Smooth Transitions', count: 161 },
    { name: 'Particle Effects', count: 44 },
    { name: 'Dolly Zoom', count: 38 },
    { name: 'Morphing Effects', count: 17 },
    { name: 'Time Lapse', count: 15 },
    { name: 'Photorealistic', count: 3 },
    { name: 'Hyper Realistic', count: 3 },
    { name: 'Cinematic', count: 1 },
    { name: 'Light Rays', count: 1 },
    { name: 'Ultra Realistic Cgi', count: 1 },
  ],
};

const subjects: TagCategory = {
  name: 'Subjects',
  count: 10,
  description: 'Main subjects and objects featured in videos',
  icon: 'Tag',
  tags: [
    { name: 'Human Face', count: 203 },
    { name: 'Humanoid Figure', count: 96 },
    { name: 'Logo Symbol', count: 15 },
    { name: 'Adult Character', count: 6 },
    { name: 'Bottle Object', count: 6 },
    { name: 'Watch Product', count: 6 },
    { name: 'Perfume Bottle', count: 3 },
    { name: 'Donut Food', count: 2 },
    { name: 'Iphone', count: 1 },
    { name: 'Apple Watch', count: 1 },
  ],
};

const settings: TagCategory = {
  name: 'Settings',
  count: 11,
  description: 'Environments and backgrounds where videos take place',
  icon: 'Settings',
  tags: [
    { name: 'Urban Landscape', count: 343 },
    { name: 'Interior Space', count: 254 },
    { name: 'Nature Outdoor', count: 185 },
    { name: 'Abstract Void', count: 149 },
    { name: 'Void Black', count: 59 },
    { name: 'White Studio', count: 43 },
    { name: 'Canyon Natural', count: 40 },
    { name: 'Sci Fi Chamber', count: 19 },
    { name: 'Minimalist Studio', count: 1 },
    { name: 'Marble Hall', count: 1 },
    { name: 'Infinite Space', count: 1 },
  ],
};

export const videoTagsData: TagCategory[] = [
  visualStyles,
  brandsAndProducts,
  effectsAndTechniques,
  subjects,
  settings,
];
