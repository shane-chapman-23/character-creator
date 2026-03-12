HTMLCanvasElement.prototype.getContext = ((contextId: string) => {
  if (contextId !== "2d") return null;
  return {
    save: () => {},
    restore: () => {},
    setTransform: () => {},
    translate: () => {},
    scale: () => {},
    imageSmoothingEnabled: false,
    clearRect: () => {},
    drawImage: () => {},
    globalCompositeOperation: "source-over",
    fillStyle: "",
    fillRect: () => {},
  } as unknown as CanvasRenderingContext2D;
}) as unknown as HTMLCanvasElement["getContext"];
