import GalleryExperience from "./GalleryExperience";
import { getGalleryChapters } from "./galleryImages";

export default function GalleryPage() {
  const chapters = getGalleryChapters();

  return <GalleryExperience chapters={chapters} />;
}
