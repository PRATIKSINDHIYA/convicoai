
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getCharactersByCategory } from '@/lib/characters';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const resolvedParams = await params;
  const { category } = resolvedParams;
  const characters = getCharactersByCategory(category);

  if (characters.length === 0) {
    notFound();
  }

  const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-blue-50 to-transparent -z-10"></div>
      <div className="mx-auto w-full max-w-7xl">
        <div className="text-center mb-12">
            <Link href="/dashboard" className="text-sm text-primary hover:underline mb-4 inline-flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Categories
            </Link>
            <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl md:text-6xl">
                Choose a Character
            </h1>
            <Badge variant="secondary" className="mt-4 text-lg font-semibold">{categoryTitle}</Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {characters.map((character) => (
            <Card key={character.id} className="group overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col border-2 bg-background">
              <CardHeader className="p-0">
                <div className="relative h-96 w-full">
                  <Image
                    src={character.image.imageUrl}
                    alt={character.image.description}
                    fill
                    className="object-cover object-top transition-transform duration-300"
                    data-ai-hint={character.image.imageHint}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-4 flex-grow flex flex-col justify-center items-center text-center">
                <CardTitle className="text-xl font-semibold text-foreground">
                  {character.name}
                </CardTitle>
                <CardDescription className="mt-1 text-sm text-muted-foreground">{character.description}</CardDescription>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Link href={`/chat/${character.id}`} passHref className="w-full">
                  <Button className="w-full">Chat Now</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
