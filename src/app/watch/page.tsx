import { redirect } from 'next/navigation';

interface PageProps {
  searchParams: { [key: string]: string | undefined };
}

export default function WatchPage({ searchParams }: PageProps) {
  const videoId = searchParams.v;

  if (videoId) {
    redirect(`/watch/${videoId}`);
  }

  redirect('/');
}
