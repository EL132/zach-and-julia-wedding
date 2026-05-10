import PageHeader from "@/app/components/PageHeader";
import Image from "next/image";

const galleryImages = [
  "/gallery/goober.jpg",
  "/gallery/IMG_1135.jpg",
  "/gallery/IMG_2712.jpg",
  "/gallery/IMG_2795.JPG",
  "/gallery/IMG_7069.jpg",
  "/gallery/IMG_7839.jpg",
  "/gallery/IMG_8580.jpg",
  "/gallery/IMG_8814.JPG",
];

export default function GalleryPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-8">
      <PageHeader title="Gallery" subtitle="A gentle preview of the wedding mood and memories." />
      <section className="mt-12">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {galleryImages.map((src, index) => (
            <div key={index} className="aspect-square overflow-hidden rounded-lg border border-[#E6D8C6] bg-[#EFE7D8]">
              <Image
                src={src}
                alt={`Wedding gallery image ${index + 1}`}
                width={400}
                height={400}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
