const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/app/prompt/edit/prompt-editor-client.tsx');
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
              icon: <Wand2 className="size-4 text-blue-300" />,
              title: "Creative Prompts",
              description: "Generate amazing ideas",
              date: "Featured",
              className: "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2000&auto=format&fit=crop')] before:bg-cover before:bg-center before:bg-blend-overlay before:bg-background/80 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0"
            },
            {
              icon: <Settings className="size-4 text-blue-300" />,
              title: "System Prompts",
              description: "Configure your AI models",
              date: "Popular",
              className: "[grid-area:stack] translate-x-12 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-[url('https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2574&auto=format&fit=crop')] before:bg-cover before:bg-center before:bg-blend-overlay before:bg-background/80 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0"
            },
            {
              icon: <Sparkles className="size-4 text-blue-300" />,
              title: "Marketing",
              description: "Copywriting & SEO",
              date: "Trending",
              className: "[grid-area:stack] translate-x-24 translate-y-20 hover:translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-[url('https://images.unsplash.com/photo-1542435503-956c469947f6?q=80&w=2574&auto=format&fit=crop')] before:bg-cover before:bg-center before:bg-blend-overlay before:bg-background/80 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0"
            }
          ]} />
        </div>
`;

  content = content.replace(
    '<div className="container max-w-7xl">',
    '<div className="container max-w-7xl">\n' + displayCardsSection
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  //console.log('Updated prompt-editor-client.tsx');
} else {
  //console.log('Already updated prompt-editor-client.tsx');
}
