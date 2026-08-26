import Image from "next/image";

export default function BannerImage() {
  return (
    <div className="hidden md:block w-full py-16">
      <Image
        src="/assets/image-full.webp"
        alt="Banner"
        width={1920}
        height={1080}
        sizes="100vw"
        className="w-full h-auto object-cover"
      />
    </div>
  );
}