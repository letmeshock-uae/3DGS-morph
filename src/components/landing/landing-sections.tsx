type LandingSectionsProps = {
  meshCount: number;
};

export default function LandingSections({ meshCount }: LandingSectionsProps) {
  const totalHeight = (meshCount + 1) * 100;

  return (
    <div
      className="pointer-events-none relative z-10"
      style={{ height: `${totalHeight}vh` }}
    />
  );
}
