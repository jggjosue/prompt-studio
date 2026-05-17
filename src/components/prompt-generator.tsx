'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Wand2 } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function PromptGenerator() {
  const t = useTranslations('promptGenerator');
  const tCommon = useTranslations('common');

  const prompt = {
    title: 'Creativity and development',
    description:
      'A beautiful, confident woman wearing a black suit sits elegantly on a luxurious white chair that highlights her slim, graceful figure. Her right hand rests gently beneath her chin, with her chin slightly raised in a pose of self-assurance. Her head tilts subtly to the right, eyes steady and looking forward with confidence. Her facial features glow under high-quality cinematic lighting, enhancing her natural beauty. The background is pure white, featuring a rare art painting and soft, cinematic illumination. Beside the chair stands a unique white table topped with a black coffee cup and a stylish lamp decor, creating a refined and elegant atmosphere. MODEL OR TOOL: Sura, mid-journey, and runway. TAGS: Anime, Cinematic, Realistic, Architecture, Cartoon, 3D Render, Vector, Sketch / Line Art, Watercolor, Oil Painting, Abstract, Surreal, Photography, Fashion, Portrait, Minimalist, Business, Corporate, Modern, Product / Poster, Logo, Concept art, Infographic, Cyberpunk, Sci-Fi, Fantasy, Grunge, Retro / Vintage, Dark / Moody, Vibrant / Colorful, Elegant, Flat Design, Neon, Glitch.',
    imageUrl:
      'https://scontent.ftpq1-1.fna.fbcdn.net/o1/v/t0/f2/m421/AQN14KI8ysoO16PGQycfLIoWVrWbbq-0hRkO2wl3xXKwG09j0HkWOsscwxMtIjGF5GKL4Z6HorG220x_VPw5Cw-1YjUdxwwb7_g920g4dPWlGd4cTeAh0-f67nZQ7wVLvLznlT9mzO-Qy-y8ysNFL9OkDrxI9g.jpeg?_nc_ht=scontent.ftpq1-1.fna.fbcdn.net&_nc_gid=LciIPuLPpBS3-OkdJCODlA&_nc_cat=102&_nc_oc=AdlxqZVe7i-wyYq22W1cNDtux8ahVo3dchwCB0E_phzZxUsfmdcboQAdVJU_csbDv7gTwwQS8KUasK7B2Ul_hTHU&ccb=9-4&oh=00_AftSm6k46a0yyuyeqO0kVDiP7H8GQ4I0GG6_KfIClqKzGg&oe=698606F9&_nc_sid=5b3566',
    imageHint: 'woman black suit on white chair',
    type: 'image',
    tags: [
      'Anime',
      'Cinematic',
      'Realistic',
      'Architecture',
      'Cartoon',
      '3D Render',
      'Vector',
      'Sketch / Line Art',
      'Watercolor',
      'Oil Painting',
      'Abstract',
      'Surreal',
      'Photography',
      'Fashion',
      'Portrait',
      'Minimalist',
      'Business',
      'Corporate',
      'Modern',
      'Product / Poster',
      'Logo',
      'Concept art',
      'Infographic',
      'Cyberpunk',
      'Sci-Fi',
      'Fantasy',
      'Grunge',
      'Retro / Vintage',
      'Dark / Moody',
      'Vibrant / Colorful',
      'Elegant',
      'Flat Design',
      'Neon',
      'Glitch',
    ],
  };
  return (
    <Card>
      <CardContent className="p-4 md:p-6">
        <div className="space-y-4">
          <div className="grid w-full gap-2">
            <Textarea
              name="keywords"
              placeholder={t('placeholder')}
              rows={15}
              className="text-base"
              defaultValue={JSON.stringify(prompt, null, 2)}
            />
          </div>
          <div className="flex flex-col md:flex-row gap-4 justify-end">
            <Button asChild className="w-full md:w-auto">
              <Link
                href="https://aistudio.google.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Wand2 className="mr-2 h-4 w-4" />
                {tCommon('generatePrompt')}
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
