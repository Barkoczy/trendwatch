export interface Video {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: { [key: string]: { url: string } };
    channelId: string;
    channelTitle: string;
    publishedAt: string;
    channelThumbnail: string;
  };
  contentDetails: {
    duration: string;
  };
  statistics: {
    viewCount: string;
    likeCount: string;
    commentCount: string;
  };
}
