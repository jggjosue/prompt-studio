const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/app/video-tags/video-tags-client.tsx',
  'src/app/image-tags/image-tags-client.tsx',
  'src/app/prompt/edit/prompt-editor-client.tsx'
];

for (const file of filesToUpdate) {
  const filePath = path.join(process.cwd(), file);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if already has SidebarLayout
  if (content.includes('SidebarLayout')) continue;

  // Replace imports
  content = content.replace("import Header from '@/components/layout/header';", "");
  content = content.replace("import Footer from '@/components/layout/footer';", "");
  
  if (!content.includes("import { SidebarLayout }")) {
      content = "import { SidebarLayout } from '@/components/layout/sidebar-layout';\n" + content;
  }

  // Replace the layout structure
  // Find the export default function ...
  // Replace the return container
  content = content.replace(/<div className="flex min-h-screen w-full flex-col bg-background">\s*<Suspense[^>]*>\s*<Header \/>\s*<\/Suspense>/, '<SidebarLayout>');
  content = content.replace(/<div className="flex min-h-screen w-full flex-col bg-background">\s*<Header \/>/, '<SidebarLayout>');
  content = content.replace(/<Footer \/>\s*<\/div>/, '</SidebarLayout>');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated', file);
}
