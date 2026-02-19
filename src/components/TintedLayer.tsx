type Props = {
  src: string; // the *_bg.png (used as mask)
  colour: string; // hex like "#FFD86B"
  alt?: string;
  className?: string;
};

export default function TintedLayer({ src, colour, className }: Props) {
  return (
    <div
      className={className}
      style={{
        backgroundColor: colour,

        WebkitMaskImage: `url(${src})`,
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        WebkitMaskSize: "100% 100%",

        maskImage: `url(${src})`,
        maskRepeat: "no-repeat",
        maskPosition: "center",
        maskSize: "100% 100%",
      }}
    />
  );
}
