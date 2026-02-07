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
  ],
};

export const videoTagsData: TagCategory[] = [
  visualStyles,
  brandsAndProducts,
];
