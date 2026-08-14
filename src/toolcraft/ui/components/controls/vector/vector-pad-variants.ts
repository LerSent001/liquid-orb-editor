import type { VectorPadVariant } from "./vector-control-types";

const whiteBalancePadBackgroundImage =
  "linear-gradient(90deg,color-mix(in oklab, #2f7cff 72%, transparent),color-mix(in oklab, var(--foreground) 8%, transparent) 50%,color-mix(in oklab, #ff9a22 78%, transparent)),linear-gradient(180deg,color-mix(in oklab, #d84f9a 68%, transparent),transparent 49%,color-mix(in oklab, #42ba62 72%, transparent)),radial-gradient(circle at 50% 50%,color-mix(in oklab, var(--foreground) 7%, transparent),color-mix(in oklab, var(--background) 14%, transparent) 62%)";

const colorBalancePadBackgroundImage =
  "linear-gradient(90deg,color-mix(in oklab, #1dbdd3 70%, transparent),color-mix(in oklab, var(--foreground) 7%, transparent) 50%,color-mix(in oklab, #ff4a45 74%, transparent)),linear-gradient(180deg,color-mix(in oklab, #f2d94c 66%, transparent),transparent 50%,color-mix(in oklab, #315cff 70%, transparent)),radial-gradient(circle at 50% 50%,color-mix(in oklab, var(--foreground) 7%, transparent),color-mix(in oklab, var(--background) 14%, transparent) 62%)";

const chromaOffsetPadBackgroundImage =
  "linear-gradient(90deg,color-mix(in oklab, #ff2f55 68%, transparent),transparent 38%,transparent 62%,color-mix(in oklab, #25c7ff 70%, transparent)),linear-gradient(180deg,color-mix(in oklab, #56ff72 54%, transparent),transparent 42%,transparent 58%,color-mix(in oklab, #7b5cff 62%, transparent)),radial-gradient(circle at 50% 50%,color-mix(in oklab, var(--foreground) 8%, transparent),color-mix(in oklab, var(--background) 14%, transparent) 62%)";

const toneBiasPadBackgroundImage =
  "linear-gradient(90deg,color-mix(in oklab, #3f56ff 60%, transparent),color-mix(in oklab, var(--foreground) 7%, transparent) 50%,color-mix(in oklab, #ffb23f 68%, transparent)),linear-gradient(180deg,color-mix(in oklab, #f05bb5 55%, transparent),transparent 50%,color-mix(in oklab, #1fbf9a 60%, transparent)),radial-gradient(circle at 50% 50%,color-mix(in oklab, var(--foreground) 7%, transparent),color-mix(in oklab, var(--background) 14%, transparent) 62%)";

export const vectorPadBackgroundImages: Partial<Record<VectorPadVariant, string>> = {
  chromaOffset: chromaOffsetPadBackgroundImage,
  colorBalance: colorBalancePadBackgroundImage,
  toneBias: toneBiasPadBackgroundImage,
  whiteBalance: whiteBalancePadBackgroundImage,
};
