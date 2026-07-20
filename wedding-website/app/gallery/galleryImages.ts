import fs from "fs";
import path from "path";
import type { GalleryChapter, GalleryChapterId, GalleryImage } from "./galleryTypes";

const chapterCopy: Record<GalleryChapterId, Omit<GalleryChapter, "id" | "images">> = {
  proposal: {
    title: "Proposal",
    body:
      "Zach proposed to me at Glen Foerd Mansion right across from my childhood home. I was totally surprised, which is an incredible achievement by Zach and all the family and friends involved in the day. I was actually so surprised that I told Zach that the flower arrangement that my brother, Alex, and his girlfriend, Lauren, had secretly set up on the dock was for someone else and of course we couldn’t go see it! The day Zach proposed was filled with such joy that I felt like I was floating on clouds!",
    emptyMessage: "This chapter is coming soon.",
  },
  engagement: {
    title: "Engagement",
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
