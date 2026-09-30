# Planet and sky texture credits

Planet maps and Milky Way sky map: **Solar System Scope / INOVE**.

- Creator and source: https://www.solarsystemscope.com/textures/
- License: **Creative Commons Attribution 4.0 International (CC BY 4.0)**, https://creativecommons.org/licenses/by/4.0/
- Downloaded: 2026-09-26.
- Original image names: `2k_sun.jpg`, `2k_mercury.jpg`, `2k_venus_atmosphere.jpg`, `2k_earth_daymap.jpg`, `2k_mars.jpg`, `2k_jupiter.jpg`, `2k_saturn.jpg`, `2k_uranus.jpg`, `2k_neptune.jpg`, `2k_moon.jpg`, `2k_earth_clouds.jpg`, `2k_earth_nightmap.jpg`, `2k_stars_milky_way.jpg`.
- Each download is at `https://www.solarsystemscope.com/textures/download/` followed by its original image name.
- Modifications: the first twelve maps were reduced from 2048 × 1024 to 1024 × 512 and assembled into `planet-atlas.jpg` (4096 × 2048; four columns/four rows; final row unused). JPEG quality 92. `stars_milky_way.jpg` is the unchanged 2K image, renamed. Runtime shaders add lighting, clouds, rotation and atmosphere. Album/PDF pictures are rendered derivatives of these images.

The creator describes the maps as based on NASA imagery and elevation data, with enhanced colors and gap filling. They are visualization maps, not calibrated scientific measurement products. Venus is viewed through a cloud map. The Moon map is only used for the Moon. Titan's haze, Io's sulfur colors, Europa's fractured ice and other satellites/small bodies use illustrative procedural surfaces, not measured topographic maps. Small irregular bodies use rotating ellipsoids rather than surveyed shapes.

The Milky Way is a spherical distant background that cannot be reached. Supplemental stars/galaxy haze, the forming planetary disk, early Earth magma, red giant, white dwarf and planetary nebula are programmatic educational visualizations. Their patterns, brightness and starting orbital phases are illustrative. The 380,000-year early-universe era intentionally has no stars or solar-system objects.

## Model version 2: colour and historical backgrounds (2026-09-29)

- Current-day worlds continue to use the attributed Solar System Scope maps. In the `natural` display, the Sun's texture is remapped to a near-white palette and Neptune's texture to pale blue-green. The transform preserves local intensity variations but is not a radiometric or colourimetric calibration. The `enhanced` display retains the former saturated palettes so that texture features are easy to inspect. The source files themselves are unchanged.
- The Sun's white visible-light appearance follows the [NASA/ESA SOHO FAQ](https://soho.nascom.nasa.gov/explore/faq.html). The Neptune adjustment follows the direction of the 2024 work by Patrick Irwin and colleagues, described by the [University of Oxford](https://www.ox.ac.uk/news/2024-01-05-new-images-reveal-what-neptune-and-uranus-really-look-0). Neither these institutions nor the authors supplied or validated this app's RGB transform. The app does not reproduce a calibrated spectrum.
- Ancient and future model-version-2 backgrounds no longer reuse the present-day sky image. They use locally generated, fixed-seed stellar fields and galactic-plane haze. Their patterns and differences between epochs are illustrative, not reconstructed constellations, measured star counts, or a prediction of future Galactic dynamics. They introduce no downloaded image assets.
- The early-universe display remains starless. Its natural-colour endpoint uses a warm tint to communicate the approximate 3000 K recombination epoch, with arbitrary exposure for the screen. This is not the contemporary 2.7 K microwave sky and not a simulation of human vision in that environment.
- Version-1 photographs keep the former palettes and backgrounds. The blue-grey / pale-gold white-dwarf gas visualization is unchanged in both versions.

When redistributing the app or exported images, retain the creator name, source URL and CC BY 4.0 license link. The app and exported presentation supply credit lines for normal use. If images are cropped separately, retain this attribution with the crop.
