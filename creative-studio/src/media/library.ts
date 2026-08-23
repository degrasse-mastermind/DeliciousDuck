export type VisualTreatment =
  | "photography"
  | "technical-illustration"
  | "editorial-illustration"
  | "mixed-media"
  | "deterministic-graphic";

export type ProvenanceClass =
  | "original-photography"
  | "approved-editorial-generated"
  | "stock-illustrative"
  | "technical-illustration"
  | "deterministic-graphic";

export type MediaApproval = "approved" | "specimen-reference" | "legacy-placeholder" | "capture-required" | "approval-required";

export interface ExternalArtworkContract {
  requiredBaseName: string;
  acceptedFormats: readonly ["PNG", "WebP", "SVG"];
  minimumRaster: {width: number; height: number; colorSpace: "sRGB"};
  optionalLayeredSource: string;
  sourceContentRule: "no-baked-factual-text";
  deterministicOverlays: true;
}

export interface SpecimenContract {
  specimenId: string;
  requiredSource: {path: string; width: number; height: number; format: "PNG"; colorSpace: "sRGB"};
  optionalLayeredSource: {path: string; format: "SVG"; viewBox: string; groupIds: readonly string[]};
  visibleSourceContent: readonly string[];
  forbiddenSourceContent: readonly string[];
  overlayGeometry: {
    coordinateSpace: {width: number; height: number};
    safeTextArea: {x: number; y: number; width: number; height: number};
    subjectBounds: {x: number; y: number; width: number; height: number};
    probeEntryAnchor: {x: number; y: number};
    targetAnchor: {x: number; y: number};
  };
}

const artworkContract = (requiredBaseName: string): ExternalArtworkContract => ({
  requiredBaseName,
  acceptedFormats: ["PNG", "WebP", "SVG"],
  minimumRaster: {width: 2400, height: 3000, colorSpace: "sRGB"},
  optionalLayeredSource: `${requiredBaseName}-layers.svg`,
  sourceContentRule: "no-baked-factual-text",
  deterministicOverlays: true,
});

export const mediaLibrary = {
  brandMark: {
    path: "assets/logo-duck.png",
    alt: "DeliciousDuck emblem",
    treatment: "editorial-illustration",
    approval: "approved",
    provenanceClass: "deterministic-graphic",
    source: "public/logo-duck.png",
    testingImplication: "none",
    usageRestriction: "branding only",
  },
  appetiteHeroPhoto: {
    path: "assets/hero-duck-breast.jpg",
    alt: "Sliced duck breast with rendered skin",
    treatment: "photography",
    approval: "approved",
    provenanceClass: "original-photography",
    source: "src/assets/hero-duck-breast.jpg",
    testingImplication: "approved food photograph; not safety proof",
    usageRestriction: "do not use colour or pinkness as safety evidence",
  },
  finishedRecipePhoto: {
    path: "assets/recipe-pan-seared.jpg",
    alt: "Pan-seared duck breast sliced with crisp skin",
    treatment: "photography",
    approval: "approved",
    provenanceClass: "stock-illustrative",
    source: "src/assets/recipe-pan-seared.jpg",
    testingImplication: "untested illustrative recipe photograph",
    usageRestriction: "must not imply DeliciousDuck captured or tested this cook",
  },
  panRenderingPhoto: {
    path: "assets/duck-breast-pan.jpg",
    alt: "Duck breast rendering skin-side down in a skillet",
    treatment: "editorial-illustration",
    approval: "legacy-placeholder",
    provenanceClass: "approved-editorial-generated",
    source: "src/assets/sketch/duck-breast-pan.jpg",
    testingImplication: "illustrative only",
    usageRestriction: "legacy sketch; prohibited in production V4",
  },
  renderedFatPhoto: {
    path: "assets/rendering-fat.jpg",
    alt: "Rendered duck fat and duck breast in a cooking pan",
    treatment: "editorial-illustration",
    approval: "legacy-placeholder",
    provenanceClass: "approved-editorial-generated",
    source: "src/assets/sketch/rendering-fat.jpg",
    testingImplication: "illustrative only",
    usageRestriction: "legacy sketch; prohibited in production V4",
  },
  scoringPhoto: {
    path: "assets/scoring.jpg",
    alt: "Duck breast skin being scored before cooking",
    treatment: "editorial-illustration",
    approval: "legacy-placeholder",
    provenanceClass: "approved-editorial-generated",
    source: "src/assets/sketch/scoring.jpg",
    testingImplication: "illustrative only",
    usageRestriction: "legacy sketch; prohibited in production V4",
  },
  slicedDonenessPhoto: {
    path: "assets/sliced-breast.jpg",
    alt: "Rested sliced duck breast showing its cooked centre",
    treatment: "editorial-illustration",
    approval: "legacy-placeholder",
    provenanceClass: "approved-editorial-generated",
    source: "src/assets/sketch/sliced-breast.jpg",
    testingImplication: "illustrative only",
    usageRestriction: "legacy sketch; prohibited in production V4",
  },
  thermometerPhoto: {
    path: "assets/thermometer.jpg",
    alt: "Instant-read kitchen thermometer used for duck breast temperature checks",
    treatment: "editorial-illustration",
    approval: "legacy-placeholder",
    provenanceClass: "approved-editorial-generated",
    source: "src/assets/sketch/thermometer.jpg",
    testingImplication: "illustrative only",
    usageRestriction: "legacy sketch; prohibited in production V4",
  },
  coldPanRenderProofPhoto: {
    path: "assets/recipe-pan-seared.jpg",
    alt: "Placeholder only: approved duck-breast photograph pending a real cold-pan rendering photograph",
    treatment: "photography",
    approval: "capture-required",
    provenanceClass: "stock-illustrative",
    source: "src/assets/recipe-pan-seared.jpg",
    testingImplication: "placeholder only",
    usageRestriction: "not allowed in production until real capture is approved",
  },
  crispSkinDiagnosticPhoto: {
    path: "assets/hero-duck-breast.jpg",
    alt: "Placeholder only: approved duck-breast photograph pending a diagnostic crisp-skin photograph",
    treatment: "photography",
    approval: "capture-required",
    provenanceClass: "stock-illustrative",
    source: "src/assets/hero-duck-breast.jpg",
    testingImplication: "placeholder only",
    usageRestriction: "not allowed in production until diagnostic capture is approved",
  },
  restSkinUpPhoto: {
    path: "assets/hero-duck-breast.jpg",
    alt: "Placeholder only: approved duck-breast photograph pending a skin-up resting photograph",
    treatment: "photography",
    approval: "capture-required",
    provenanceClass: "stock-illustrative",
    source: "src/assets/hero-duck-breast.jpg",
    testingImplication: "placeholder only",
    usageRestriction: "not allowed in production until skin-up resting capture is approved",
  },
  technicalProbePlacement: {
    path: "assets/technical-probe-placement-specimen-reference.png",
    alt: "Clean probe-placement specimen reference showing a horizontal probe entering the centre of a duck breast",
    treatment: "technical-illustration",
    approval: "approved",
    provenanceClass: "technical-illustration",
    source: "approved specimen reference",
    testingImplication: "explains placement; does not prove safety or testing",
    usageRestriction: "factual text must remain deterministic",
    specimen: {
      specimenId: "DD-ILL-technical-probe-placement-SPECIMEN-v01",
      requiredSource: {
        path: "media/illustrations/technical-probe-placement/DD-technical-probe-placement-source-2400x3000.png",
        width: 2400,
        height: 3000,
        format: "PNG",
        colorSpace: "sRGB",
      },
      optionalLayeredSource: {
        path: "media/illustrations/technical-probe-placement/DD-technical-probe-placement-layers.svg",
        format: "SVG",
        viewBox: "0 0 2400 3000",
        groupIds: ["breast", "probe", "probe-path-registration", "target-registration"],
      },
      visibleSourceContent: ["breast", "probe"],
      forbiddenSourceContent: ["typography", "logo", "temperatures", "measurements", "labels", "callouts", "arrows", "explanatory copy"],
      overlayGeometry: {
        coordinateSpace: {width: 2400, height: 3000},
        safeTextArea: {x: 0, y: 0, width: 1008, height: 1800},
        subjectBounds: {x: 1008, y: 600, width: 1392, height: 1800},
        probeEntryAnchor: {x: 2256, y: 1680},
        targetAnchor: {x: 1776, y: 1680},
      },
    } satisfies SpecimenContract,
  },
  scoringDepthAnatomy: {
    path: "assets/DD-scoring-depth-anatomy-source-2400x3000.png",
    alt: "Approved scoring-depth illustration showing shallow cuts through duck skin and fat without cutting the meat",
    treatment: "technical-illustration",
    approval: "approved",
    provenanceClass: "technical-illustration",
    source: "approved 2400x3000 scoring-depth raster",
    testingImplication: "explains anatomy; does not prove a tested result",
    usageRestriction: "factual text must remain deterministic",
    externalContract: artworkContract("DD-scoring-depth-anatomy-approved"),
  },
  fatFlowPanContact: {
    path: null,
    alt: "Approval-required external fat-flow and pan-contact illustration",
    treatment: "technical-illustration",
    approval: "approval-required",
    provenanceClass: "technical-illustration",
    source: "not installed",
    testingImplication: "none until approved",
    usageRestriction: "not allowed in production",
    externalContract: artworkContract("DD-fat-flow-pan-contact-approved"),
  },
  coldPanMechanism: {
    path: null,
    alt: "Approval-required external cold-pan mechanism illustration",
    treatment: "editorial-illustration",
    approval: "approval-required",
    provenanceClass: "approved-editorial-generated",
    source: "not installed",
    testingImplication: "none until approved",
    usageRestriction: "not allowed in production",
    externalContract: artworkContract("DD-cold-pan-mechanism-approved"),
  },
  thermometerReference: {
    path: null,
    alt: "Approval-required external instant-read thermometer illustration",
    treatment: "technical-illustration",
    approval: "approval-required",
    provenanceClass: "technical-illustration",
    source: "not installed",
    testingImplication: "none until approved",
    usageRestriction: "not allowed in production",
    externalContract: artworkContract("DD-thermometer-reference-approved"),
  },
  carryoverDonenessAnatomy: {
    path: null,
    alt: "Approval-required external carryover and doneness anatomy illustration",
    treatment: "editorial-illustration",
    approval: "approval-required",
    provenanceClass: "approved-editorial-generated",
    source: "not installed",
    testingImplication: "none until approved",
    usageRestriction: "not allowed in production",
    externalContract: artworkContract("DD-carryover-doneness-anatomy-approved"),
  },
} as const satisfies Record<string, {
  path: string | null;
  alt: string;
  treatment: VisualTreatment;
  approval: MediaApproval;
  provenanceClass: ProvenanceClass;
  source: string;
  testingImplication: string;
  usageRestriction: string;
  specimen?: SpecimenContract;
  externalContract?: ExternalArtworkContract;
}>;

export type MediaSlotId = keyof typeof mediaLibrary;

export function mediaFor(slot: MediaSlotId) {
  return mediaLibrary[slot];
}

export function assertApprovedMedia(slots: readonly MediaSlotId[]) {
  const blocked = [...new Set(slots)].filter((slot) => mediaLibrary[slot].approval !== "approved");
  if (blocked.length && process.env.ALLOW_REVIEW_MEDIA !== "1") {
    throw new Error(
      `Creative render blocked: unapproved media slots: ${blocked.join(", ")}. ` +
      "Install approved replacements in src/media/library.ts or use ALLOW_REVIEW_MEDIA=1 for an explicitly non-production review render.",
    );
  }
}
