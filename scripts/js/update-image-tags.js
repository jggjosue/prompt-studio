const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/app/image-tags/image-tags-client.tsx');
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('import DisplayCards')) {
  // Add imports
  content = content.replace(
    "import { Card } from '@/components/ui/card';",
    "import { Card } from '@/components/ui/card';\nimport DisplayCards from '@/components/ui/display-cards';"
  );
  
  const displayCardsSection = `
        <div className="flex w-full items-center justify-center py-12">
          <DisplayCards cards={[
            {
              icon: <Palette className="size-4 text-blue-300" />,
              title: "Digital Art",
              description: "Creative concepts & styles",
              date: "Featured",
              className: "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] before:bg-cover before:bg-center before:bg-blend-overlay before:bg-background/80 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0"
            },
            {
              icon: <Tag className="size-4 text-blue-300" />,
              title: "Photography",
              description: "Realistic stock photography",
              date: "Popular",
              className: "[grid-area:stack] translate-x-12 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-[url('https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=2670&auto=format&fit=crop')] before:bg-cover before:bg-center before:bg-blend-overlay before:bg-background/80 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0"
            },
            {
              icon: <Wand2 className="size-4 text-blue-300" />,
              title: "Illustrations",
              description: "Vector graphics & designs",
              date: "Trending",
              className: "[grid-area:stack] translate-x-24 translate-y-20 hover:translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-[url('https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=2574&auto=format&fit=crop')] before:bg-cover before:bg-center before:bg-blend-overlay before:bg-background/80 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0"
            }
          ]} />
        </div>
`;

  content = content.replace(
    '<div className="flex flex-col items-center space-y-4 text-center mb-12">',
    displayCardsSection + '\n      <div className="flex flex-col items-center space-y-4 text-center mb-12">'
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  //console.log('Updated image-tags-client.tsx');
} else {
  //console.log('Already updated image-tags-client.tsx');
}
