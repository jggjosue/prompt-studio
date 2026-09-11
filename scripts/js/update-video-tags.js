const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/app/video-tags/video-tags-client.tsx');
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
              title: "Cinematic",
              description: "High quality 4k rendering",
              date: "Featured",
              className: "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0"
            },
            {
              icon: <Banana className="size-4 text-blue-300" />,
              title: "Animation",
              description: "Smooth 3D animations",
              date: "Popular",
              className: "[grid-area:stack] translate-x-12 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0"
            },
            {
              icon: <Settings className="size-4 text-blue-300" />,
              title: "VFX",
              description: "Stunning visual effects",
              date: "Trending",
              className: "[grid-area:stack] translate-x-24 translate-y-20 hover:translate-y-10"
            }
          ]} />
        </div>
`;

  content = content.replace(
    '<div className="flex flex-col items-center space-y-4 text-center mb-12">',
    displayCardsSection + '\n      <div className="flex flex-col items-center space-y-4 text-center mb-12">'
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  //console.log('Updated video-tags-client.tsx');
} else {
  //console.log('Already updated video-tags-client.tsx');
}
