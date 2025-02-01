import { redirect } from 'next/navigation';

type PageProps = {
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

export default async function WatchPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const videoId = params.v;

  if (videoId) {
    redirect(`/watch/${videoId}`);
  }

  redirect('/');
}
