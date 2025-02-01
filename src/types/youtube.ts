export interface Thumbnail {
  url: string;
  width: number;
  height: number;
}

export interface Thumbnails {
  default: Thumbnail;
  medium?: Thumbnail;
  high?: Thumbnail;
  standard?: Thumbnail;
  maxres?: Thumbnail;
}

export interface RegionRestriction {
  allowed?: string[];
  blocked?: string[];
}

export interface ContentDetails {
  duration?: string;
  dimension?: string;
  definition?: string;
  caption?: string;
  licensedContent?: boolean;
  regionRestriction?: RegionRestriction;
  projection?: string;
}

export interface Statistics {
  viewCount?: string;
  likeCount?: string;
  dislikeCount?: string;
  favoriteCount?: string;
  commentCount?: string;
}

export interface Channel {
  id: string;
  title: string;
  thumbnail: string;
}

export interface VideoSnippet {
  channelId: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnails: Thumbnails;
  tags?: string[];
  categoryId?: string;
  liveBroadcastContent?: string;
  defaultLanguage?: string;
  defaultAudioLanguage?: string;
}

export interface RawVideo {
  id: string | { videoId: string };
  snippet: VideoSnippet;
  contentDetails?: ContentDetails;
  statistics?: Statistics;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnails: Thumbnails;
  tags: string[];
  categoryId: string;
  liveBroadcastContent: string;
  defaultLanguage?: string;
  defaultAudioLanguage: string;
  channel: Channel;
  contentDetails: ContentDetails;
  statistics: Statistics;
}

export interface SearchParams {
  regionCode: string;
  maxResults: number;
  pageToken?: string;
  searchQuery?: string;
  order: string;
  safeSearch?: string;
  publishedAfter?: string;
  publishedBefore?: string;
}
