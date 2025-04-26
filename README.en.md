**English** | [中文](./README.md)

# 🎨 auto-contrast-color ✨

[![npm version](https://img.shields.io/npm/v/auto-contrast-color.svg?style=flat-square)](https://www.npmjs.com/package/auto-contrast-color)
[![npm downloads](https://img.shields.io/npm/dm/auto-contrast-color.svg?style=flat-square)](https://www.npmjs.com/package/auto-contrast-color)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
<!-- Optional: Add Build and Coverage badges later -->
<!-- [![Build Status](https://img.shields.io/github/actions/workflow/status/YOUR_USERNAME/auto-contrast-color/ci.yml?branch=main&style=flat-square)](https://github.com/YOUR_USERNAME/auto-contrast-color/actions) -->
<!-- [![Coverage Status](https://img.shields.io/coveralls/github/YOUR_USERNAME/auto-contrast-color/main.svg?style=flat-square)](https://coveralls.io/github/YOUR_USERNAME/auto-contrast-color?branch=main) -->

Struggling with text colors on dynamic backgrounds? Tired of guessing whether black or white text will be readable?

Enter `auto-contrast-color`! Given a background color, it intelligently calculates a suitable text color. Not only can it ensure optimal **readability** (WCAG-compliant black/white contrast), but it can also generate harmonious or high-impact colors based on **color theory** (like complementary, adjacent colors, etc.).

It's time to say goodbye to color selection woes and make your UI smarter and more beautiful! 😎

## 🤔 Why Do You Need It?

Background colors often change dynamically in various scenarios:

*   User-defined themes
*   Content-based background images or gradients
*   Data visualization charts
*   Text overlays on images

Manually specifying the right text color for every possible background is tedious and error-prone. `auto-contrast-color` automates this process, ensuring:

1.  **Accessibility**: The default strategy prioritizes sufficient luminance contrast, meeting WCAG AA/AAA level requirements.
2.  **Visual Harmony/Impact**: Offers various color strategies based on the hue wheel, easily achieving analogous, adjacent, contrast, complementary, and other color schemes.
3.  **Flexibility**: Supports custom hue rotation angles and direction control for creative needs.

## ✨ Key Features

*   **Multiple Strategies**:
    *   `accessibility`: Luminance priority, returns high-contrast black/white (default).
    *   `analogous`: Analogous colors (+15° hue rotation).
    *   `adjacent`: Adjacent colors (+60° hue rotation).
    *   `contrast`: Contrast colors (+120° hue rotation).
    *   `complementary`: Complementary color (180° hue rotation).
    *   `custom`: Custom hue rotation angle.
*   **Direction Control**: Supports clockwise (`clockwise`) or counter-clockwise (`counterClockwise`) rotation.
*   **Alpha Transparency Handling**: Correctly processes background colors with alpha channels (assuming a white underlay).
*   **Robustness**: Gracefully handles invalid color inputs and achromatic colors (black/white/gray) with fallback logic.
*   **TypeScript Support**: Written in TypeScript with full type definitions provided.
*   **Lightweight**: Simple core logic, relies on the small yet powerful [tinycolor2](https://github.com/bgrins/TinyColor).

## 🚀 Installation

```bash
npm install auto-contrast-color tinycolor2
# or
yarn add auto-contrast-color tinycolor2
```

**Important**: `tinycolor2` is a `peerDependency`, so you need to install it alongside this package in your project.

## 💡 Usage

### Basic Usage (High Contrast Black/White)

```typescript
import getContrastTextColor from 'auto-contrast-color';

// Light background -> returns dark color (default '#000000')
const textColorForLightBg = getContrastTextColor('#f0f0f0'); // -> '#000000'
console.log(textColorForLightBg);

// Dark background -> returns light color (default '#FFFFFF')
const textColorForDarkBg = getContrastTextColor('#333333'); // -> '#FFFFFF'
console.log(textColorForDarkBg);

// Using custom light/dark colors
const customOptions = { lightColor: '#FAFAFA', darkColor: '#101010' };
const customTextColor = getContrastTextColor('lightblue', customOptions);
console.log(customTextColor); // -> '#101010' (because lightblue luminance > 0.5)
```

### Advanced Usage (Different Strategies and Options)

```typescript
import getContrastTextColor, { ContrastColorOptions, ColorStrategy } from 'auto-contrast-color';

const myBackgroundColor = 'purple'; // (#800080)

// 1. Get complementary color (Yellowish)
const optionsComplementary: ContrastColorOptions = { strategy: 'complementary' };
const complementaryColor = getContrastTextColor(myBackgroundColor, optionsComplementary);
console.log(complementaryColor); // -> '#808000' (Approx. yellow)

// 2. Get adjacent color (Rotate +60 degrees clockwise -> Blueish)
const optionsAdjacent: ContrastColorOptions = { strategy: 'adjacent' };
const adjacentColor = getContrastTextColor(myBackgroundColor, optionsAdjacent);
console.log(adjacentColor); // -> '#000080' (Approx. blue)

// 3. Get contrast color (Rotate -120 degrees counter-clockwise -> Greenish)
const optionsContrastReverse: ContrastColorOptions = {
  strategy: 'contrast',
  direction: 'counterClockwise'
};
const contrastColorReverse = getContrastTextColor(myBackgroundColor, optionsContrastReverse);
console.log(contrastColorReverse); // -> '#008000' (Approx. green)

// 4. Custom rotation angle (Rotate +45 degrees clockwise)
const optionsCustom: ContrastColorOptions = {
  strategy: 'custom',
  customDegree: 45
};
const customColor = getContrastTextColor(myBackgroundColor, optionsCustom);
console.log(customColor); // -> '#400080' (Approx. indigo)

// 5. Handle color with alpha (assuming white background)
const transparentBg = 'rgba(0, 0, 255, 0.5)'; // Semi-transparent blue
const textColorForTransparent = getContrastTextColor(transparentBg); // Default 'accessibility' strategy
console.log(textColorForTransparent); // -> '#000000' (becomes lighter when mixed with white)
```

## ⚙️ API Documentation

### `getContrastTextColor(backgroundColor, options?)`

*   `backgroundColor`: `string | tinycolor.ColorInput` - The background color. Accepts any format supported by `tinycolor2` (HEX, RGB(A), HSL(A), HSV(A), color names, etc.).
*   `options?`: `ContrastColorOptions` (optional) - Configuration object.
*   **Returns**: `string` - The calculated text color as a hex string (e.g., `'#FFFFFF'`). Returns `options.darkColor` (default `'#000000'`) if the input is invalid.

### `ContrastColorOptions` Interface

```typescript
export interface ContrastColorOptions {
    /**
     * The strategy used to determine the text color.
     * - 'accessibility': (Default) Prioritizes luminance contrast, choosing between 'lightColor'/'darkColor'. WCAG compliant. Usually returns black or white.
     * - 'analogous': Analogous color (rotates hue +/- 15 degrees).
     * - 'adjacent': Adjacent color (rotates hue +/- 60 degrees).
     * - 'contrast': Contrast color (rotates hue +/- 120 degrees).
     * - 'complementary': Complementary color (rotates hue 180 degrees).
     * - 'custom': Custom hue rotation degree.
     * Note: Strategies other than 'accessibility' do not guarantee WCAG contrast ratios. For achromatic colors (black/white/gray), hue rotation strategies fall back to 'accessibility' behavior.
     * @default 'accessibility'
     */
    strategy?: ColorStrategy; // Type: 'accessibility' | 'analogous' | ... | 'custom'

    /**
     * [Strategy: 'accessibility'] The luminance threshold (0-1) to determine if a background is light or dark.
     * @default 0.5
     */
    threshold?: number;

    /**
     * [Strategy: 'accessibility'] The color returned for dark backgrounds. Also the fallback for achromatic/black backgrounds in other strategies.
     * @default '#FFFFFF'
     */
    lightColor?: string;

    /**
     * [Strategy: 'accessibility'] The color returned for light backgrounds. Also the fallback for achromatic/white backgrounds in other strategies.
     * @default '#000000'
     */
    darkColor?: string;

    /**
     * [Strategy: Hue Rotation ('analogous'|'adjacent'|'contrast'|'complementary'|'custom')]
     * The direction of hue rotation.
     * @default 'clockwise'
     */
    direction?: 'clockwise' | 'counterClockwise';

    /**
     * [Strategy: 'custom'] The custom degree for hue rotation (can be negative).
     * @default 0
     */
    customDegree?: number;
}
```

## 🧠 Understanding the Strategies

*   **`accessibility` (Luminance Priority)**: This is the default and the only strategy guaranteed to provide high **readability**. It ignores hue and calculates the background's **relative luminance**. If luminance is above the `threshold` (default 0.5), the background is considered light, and `darkColor` (default black) is returned; otherwise, `lightColor` (default white) is returned. This is the simplest and most reliable way to meet WCAG contrast requirements.
*   **Hue Rotation Strategies (`analogous`, `adjacent`, `contrast`, `complementary`, `custom`)**: These strategies operate on the **Hue** component in the HSL color space. They take the background color's hue, rotate it by the specified `customDegree` or a preset degree based on the chosen strategy and `direction`, generating a new hue. Saturation and Lightness generally remain unchanged.
    *   **Important**: Colors generated by these strategies **do not guarantee** WCAG compliance. They are primarily for achieving specific visual color combinations.
    *   **Fallback**: If the background color is **achromatic** (black, white, or gray – saturation is 0), these rotation strategies cannot be applied effectively and will automatically fall back to the behavior of the `accessibility` strategy. Additionally, the `complementary` strategy also forces a fallback for pure black/white backgrounds to avoid returning the same color.

## ⚠️ Important Notes

*   **WCAG Compliance**: Only `strategy: 'accessibility'` (default) is designed primarily to meet WCAG contrast guidelines. Other strategies might look good but may not be easily readable for all users.
*   **Alpha Transparency**: Colors with an alpha channel are first blended against a white background (calculating the equivalent opaque color) before the selected strategy is applied.
*   **Peer Dependency**: Remember to install `tinycolor2` in your project.

## 🤝 Contributing

Contributions of all kinds are welcome! If you find a bug, have a feature suggestion, or want to improve the code or documentation, please feel free to open an Issue or Pull Request.

<!-- (Optional) See the CONTRIBUTING.md file for detailed contribution guidelines. -->

## 📄 License

This project is licensed under the [MIT](LICENSE) License. 