import fs from "fs";
import path from "path";
import type { GalleryChapter, GalleryChapterId, GalleryImage } from "./galleryTypes";

const chapterCopy: Record<GalleryChapterId, Omit<GalleryChapter, "id" | "images">> = {
  proposal: {
    title: "Proposal",
    eyebrow: "JULIA & ZACH",
    supportingLine: "The beginning",
    body:
      "A quiet moment, a question, and the beginning of everything that would lead us to Maryhill. These are a few favorite photos from the day forever became something we could start planning.",
    emptyMessage: "This chapter is coming soon.",
  },
  engagement: {
    title: "Engagement",
    eyebrow: "JULIA & ZACH",
    supportingLine: "The season before Maryhill",
    body:
      "A season of walks, celebrations, planning, and small moments before the wedding weekend. These are a few glimpses from the road to Maryhill.",
    emptyMessage: "This chapter is coming soon.",
  },
};

const galleryDirectory = path.join(process.cwd(), "public", "gallery");
const galleryFilePattern = /^(proposal|engagement)-(\d+)\.(jpg|jpeg|png|webp)$/i;

export function getGalleryChapters(): GalleryChapter[] {
  const imagesByChapter: Record<GalleryChapterId, GalleryImage[]> = {
    proposal: [],
    engagement: [],
  };

  if (!fs.existsSync(galleryDirectory)) {
    return buildChapters(imagesByChapter);
  }

  const files = fs.readdirSync(galleryDirectory);

  for (const file of files) {
    const match = file.match(galleryFilePattern);
    if (!match) continue;

    const chapterId = match[1].toLowerCase() as GalleryChapterId;
    const imageIndex = Number(match[2]);

    imagesByChapter[chapterId].push({
      src: `/gallery/${file}`,
      alt: `${chapterCopy[chapterId].title} photo ${imageIndex}`,
      index: imageIndex,
    });
  }

  for (const chapterImages of Object.values(imagesByChapter)) {
    chapterImages.sort((a, b) => a.index - b.index);
  }

  return buildChapters(imagesByChapter);
}

function buildChapters(imagesByChapter: Record<GalleryChapterId, GalleryImage[]>): GalleryChapter[] {
  return (["proposal", "engagement"] as GalleryChapterId[]).map((id) => ({
    id,
    ...chapterCopy[id],
    images: imagesByChapter[id],
  }));
}
