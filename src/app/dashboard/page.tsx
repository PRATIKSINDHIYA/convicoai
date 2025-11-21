
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const categories = [
    { id: 'love', title: 'Love' },
    { id: 'friends', title: 'Friends' },
    { id: 'family', title: 'Family' },
    { id: 'business', title: 'Business' },
  ];

  const getImageForCategory = (id: string): ImagePlaceholder | undefined => {
    return PlaceHolderImages.find((img) => img.id === id);
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
       <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-blue-50 to-transparent -z-10"></div>
      <div className="mx-auto w-full max-w-7xl">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl md:text-6xl text-center mb-12">
          Choose a Category
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {categories.map((category) => {
            const image = getImageForCategory(category.id);
            return (
              <Link key={category.id} href={`/dashboard/${category.id}`} passHref>
                <Card className="group relative overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-96 border-2 border-transparent hover:border-primary bg-background">
                  {image && (
                    <>
                      <Image
                        src={image.imageUrl}
                        alt={image.description}
                        fill
                        className="object-cover object-center"
                        data-ai-hint={image.imageHint}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    </>
                  )}
                  <CardContent className="absolute inset-0 flex items-start justify-center p-6">
                    <CardTitle className="text-center text-2xl text-white font-semibold drop-shadow-md mt-4">
                      {category.title}
                    </CardTitle>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
