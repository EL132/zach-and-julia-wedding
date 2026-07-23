import Image from "next/image";

type FishMarkProps = {
  className?: string;
};

export function FishMark({ className = "" }: FishMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={`relative block aspect-square overflow-hidden ${className}`}
    >
      <Image
        src="/fish-original.png"
        alt=""
        fill
        sizes="3rem"
        className="object-contain invert mix-blend-screen"
      />
    </span>
  );
}
