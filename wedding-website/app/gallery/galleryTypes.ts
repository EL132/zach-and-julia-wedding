export type GalleryChapterId = "proposal" | "engagement";

export type GalleryImage = {
  src: string;
  alt: string;
  index: number;
};

export type GalleryChapter = {
  id: GalleryChapterId;
  title: string;
  eyebrow: string;
  supportingLine: string;
  body: string;
  emptyMessage: string;
  images: GalleryImage[];
};
