// Red and green encode horizontal and vertical offsets. The neutral center
// keeps the koi legible while the glass bends its engraving near the rim.
const lensMap = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="x"><stop/><stop offset="1" stop-color="red"/></linearGradient>
    <linearGradient id="y" x2="0" y2="1"><stop/><stop offset="1" stop-color="lime"/></linearGradient>
    <radialGradient id="core"><stop offset=".48" stop-color="#808080"/>
      <stop offset=".86" stop-color="#808080" stop-opacity=".55"/>
      <stop offset="1" stop-color="#808080" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="100" height="100" fill="url(#x)"/>
  <rect width="100" height="100" fill="url(#y)" style="mix-blend-mode:screen"/>
  <rect width="100" height="100" fill="url(#core)"/>
</svg>`;

// Each outline is drawn on the same 100-unit square as its glass surface.
const outlines = {
  crown: `M47 3 C58 3 63 1 71 6 S80 12 84 18 C92 23 90 29 95 35
    S98 46 97 54 C99 63 93 68 91 73 S86 83 78 86
    C71 89 70 94 61 95 S47 99 40 96 C34 93 28 95 23 90
    S13 84 10 76 C8 69 3 66 4 58 S1 46 4 39
    C9 32 6 25 15 19 S23 10 31 9 C37 9 39 4 47 3 Z`,
  sprout: `M47 4 C55 5 58 2 65 4 S74 10 80 13
    C88 17 86 23 91 28 S96 39 95 46 C94 54 99 58 95 66
    S88 75 84 82 C79 89 73 87 66 93 S54 96 47 97
    C39 99 35 95 28 93 S20 87 16 82 C10 78 8 74 8 68
    S2 58 3 49 C5 41 3 37 8 30 S12 20 19 17
    C26 13 26 9 34 8 S42 4 47 4 Z`,
  'right-bank': `M46 3 C53 1 58 5 65 4 S77 8 80 13
    C84 19 90 18 92 25 S93 33 96 39 C101 47 96 54 97 60
    S92 72 89 77 C86 83 82 82 76 88 S67 94 60 94
    C53 94 51 100 43 97 S32 96 26 91 C19 86 15 88 12 79
    S6 70 5 63 C5 56 0 52 3 45 S5 35 7 28
    C10 20 16 19 21 14 S31 9 36 6 Q40 4 46 3 Z`,
  'upper-left': `M48 3 C59 1 65 6 73 8 S81 13 87 19 Q91 22 92 30
    C92 36 98 40 98 48 S96 58 96 64 Q95 73 86 78
    C80 81 79 86 73 88 C68 90 62 83 57 77 Q55 75 56 80
    C58 86 61 94 55 97 S43 97 35 96 C29 96 28 92 21 89
    S13 80 10 74 Q4 69 4 60 C4 53 0 49 3 41
    S6 30 10 24 Q14 21 17 16 C20 10 26 11 32 7 S41 4 48 3 Z`,
  wide: `M47 2 C54 0 57 5 63 4 S72 6 77 10 Q81 13 85 14
    C90 16 89 23 93 28 S96 36 96 41 C96 45 100 48 98 55
    S99 66 94 72 Q90 76 88 82 C85 89 78 88 74 93
    S63 96 58 98 C51 100 47 96 42 96 C35 96 31 93 26 91
    S20 85 16 82 C12 79 10 76 7 72 S5 65 3 61 C0 54 4 49 3 43
    S4 32 9 28 C13 24 11 19 17 16 S23 10 29 8
    C35 7 40 3 47 2 Z`,
  cupped: `M47 3 C54 4 58 1 64 3 S71 8 77 9 C84 10 84 16 88 19
    S95 25 94 31 C93 37 100 39 98 46 Q97 50 94 52
    C89 55 89 58 92 61 Q96 63 94 67
    C93 72 91 75 88 78 C83 82 83 87 77 89 S69 96 62 95
    C56 94 53 100 44 98 S34 95 28 94 C20 92 22 85 15 81
    S9 72 7 67 C4 62 5 57 3 52 S2 41 6 36
    C10 30 6 26 13 21 S23 17 27 11 C31 5 40 7 47 3 Z`,
  companion: `M49 4 C56 5 60 2 65 5 S67 12 74 13 C83 13 86 19 88 24
    S95 30 96 39 C98 48 93 51 96 58 S93 69 91 75
    C89 82 83 84 78 89 S66 95 60 96 C54 97 50 99 44 99
    S31 98 26 95 S18 91 16 86 C13 81 8 81 7 75
    S3 64 4 59 C6 52 1 48 3 41 S7 33 8 27
    C9 20 17 20 21 15 S28 8 34 8 C40 8 42 3 49 4 Z`,
  small: `M48 3 C54 4 60 1 66 3 S75 6 79 12 C81 16 88 16 90 22
    S91 30 95 34 C99 39 96 45 98 51 S95 61 94 68
    C93 76 86 78 82 84 S72 90 67 94 C62 98 56 95 50 97
    S40 99 34 95 C29 91 23 94 18 88 S15 79 10 76
    C4 72 6 65 4 60 S1 48 4 43 C6 39 5 34 10 31
    C14 27 21 31 24 26 C27 22 21 18 26 12
    C29 8 33 9 37 6 S44 3 48 3 Z`
};

export function glassLeaf(variant) {
  const id = `leaf-${variant}`;
  return `<span class="lotus-pad lotus-${variant}" aria-hidden="true" style="--lens-optics:url(#glass-refraction);--leaf-clip:url(#${id}-clip)">
    <svg class="lotus-edge" viewBox="0 0 100 100" focusable="false" fill="none">
      <defs>
        <path id="${id}" d="${outlines[variant]}" vector-effect="non-scaling-stroke"/>
        <clipPath id="${id}-clip" clipPathUnits="objectBoundingBox"><use href="#${id}" transform="scale(.01)"/></clipPath>
      </defs>
      <use href="#${id}" class="lotus-edge-shadow"/>
      <use href="#${id}" stroke="url(#lotus-edge-light)" stroke-width="1"/>
    </svg></span>`;
}

export function lotusLeaves() {
  const optics = `<svg width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute">
    <defs><linearGradient id="lotus-edge-light" x2=".75" y2="1">
      <stop stop-color="white" stop-opacity=".95"/><stop offset=".48" stop-color="white" stop-opacity=".55"/>
      <stop offset="1" stop-color="black" stop-opacity=".12"/>
    </linearGradient><filter id="glass-refraction" x="0" y="0" width="1" height="1" primitiveUnits="objectBoundingBox" color-interpolation-filters="sRGB">
      <feImage href="data:image/svg+xml,${encodeURIComponent(lensMap)}" x="0" y="0" width="1" height="1" preserveAspectRatio="none" result="offsets"/>
      <feDisplacementMap in="SourceGraphic" in2="offsets" scale="-.075" xChannelSelector="R" yChannelSelector="G"/>
    </filter></defs>
  </svg>`;
  return optics + ['wide', 'cupped', 'companion', 'sprout', 'right-bank'].map(glassLeaf).join('');
}
