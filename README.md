[English](./README.en.md) | **中文**

# 🎨 auto-contrast-color ✨

[![npm version](https://img.shields.io/npm/v/auto-contrast-color.svg?style=flat-square)](https://www.npmjs.com/package/auto-contrast-color)
[![npm downloads](https://img.shields.io/npm/dm/auto-contrast-color.svg?style=flat-square)](https://www.npmjs.com/package/auto-contrast-color)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
<!-- 可选：未来添加 Build 和 Coverage 徽章 -->
<!-- [![Build Status](https://img.shields.io/github/actions/workflow/status/YOUR_USERNAME/auto-contrast-color/ci.yml?branch=main&style=flat-square)](https://github.com/YOUR_USERNAME/auto-contrast-color/actions) -->
<!-- [![Coverage Status](https://img.shields.io/coveralls/github/YOUR_USERNAME/auto-contrast-color/main.svg?style=flat-square)](https://coveralls.io/github/YOUR_USERNAME/auto-contrast-color?branch=main) -->

还在为动态背景下的文字颜色发愁吗？还在纠结用黑色还是白色文字才能让用户看清吗？

`auto-contrast-color` 来了！它能根据你提供的背景色，智能地计算出合适的文本颜色，不仅能确保最佳的**易读性**（符合 WCAG 标准的黑/白对比），还能根据**色彩理论**生成各种和谐或对比强烈的颜色（如互补色、邻近色等）。

是时候告别色彩选择困难症，让你的 UI 更加智能和美观了！😎

## 🤔 为什么需要它？

在很多场景下，背景颜色是动态变化的：

*   用户自定义主题
*   基于内容的背景图或渐变色
*   数据可视化图表
*   图片上的文字叠加

手动为每种背景色指定合适的文本颜色既繁琐又容易出错。`auto-contrast-color` 通过算法自动化了这个过程，确保：

1.  **无障碍访问 (Accessibility)**：默认策略优先保证文本具有足够的亮度对比度，符合 WCAG AA/AAA 级别要求。
2.  **视觉和谐/冲击**: 提供多种基于色相环的色彩策略，轻松实现同类、邻近、对比、互补等配色方案。
3.  **灵活性**: 支持自定义角度旋转和方向控制，满足各种创意需求。

## ✨ 主要特性

*   **多种策略**:
    *   `accessibility`: 亮度优先，返回高对比度的黑/白（默认）。
    *   `analogous`: 同类色 (+15°)。
    *   `adjacent`: 邻近色 (+60°)。
    *   `contrast`: 对比色 (+120°)。
    *   `complementary`: 互补色 (180°)。
    *   `custom`: 自定义色相旋转角度。
*   **方向控制**: 支持顺时针 (`clockwise`) 或逆时针 (`counterClockwise`) 旋转。
*   **Alpha 透明度处理**: 能够处理带透明度的背景色（假设底层为白色）。
*   **健壮性**: 对无效颜色输入和无色相颜色（黑/白/灰）有优雅的回退处理。
*   **TypeScript 支持**: 使用 TypeScript 编写，提供完整的类型定义。
*   **轻量级**: 核心逻辑简单，依赖小巧强大的 [tinycolor2](https://github.com/bgrins/TinyColor)。

## 🚀 安装

```bash
npm install auto-contrast-color tinycolor2
# 或者
yarn add auto-contrast-color tinycolor2
```

**重要提示**: `tinycolor2` 是一个 `peerDependency`，你需要将它安装在你的项目中。

## 💡 使用方法

### 基础用法 (获取高对比度黑/白)

```typescript
import getContrastTextColor from 'auto-contrast-color';

// 浅色背景 -> 返回深色 (默认 '#000000')
const textColorForLightBg = getContrastTextColor('#f0f0f0'); // -> '#000000'
console.log(textColorForLightBg);

// 深色背景 -> 返回浅色 (默认 '#FFFFFF')
const textColorForDarkBg = getContrastTextColor('#333333'); // -> '#FFFFFF'
console.log(textColorForDarkBg);

// 使用自定义的亮/暗色
const customOptions = { lightColor: '#FAFAFA', darkColor: '#101010' };
const customTextColor = getContrastTextColor('lightblue', customOptions);
console.log(customTextColor); // -> '#101010' (因为 lightblue 亮度 > 0.5)
```

### 进阶用法 (使用不同策略和选项)

```typescript
import getContrastTextColor, { ContrastColorOptions, ColorStrategy } from 'auto-contrast-color';

const myBackgroundColor = 'purple'; // (#800080)

// 1. 获取互补色 (黄色)
const optionsComplementary: ContrastColorOptions = { strategy: 'complementary' };
const complementaryColor = getContrastTextColor(myBackgroundColor, optionsComplementary);
console.log(complementaryColor); // -> '#808000' (近似黄色)

// 2. 获取邻近色 (顺时针旋转 60 度，得到蓝色系)
const optionsAdjacent: ContrastColorOptions = { strategy: 'adjacent' };
const adjacentColor = getContrastTextColor(myBackgroundColor, optionsAdjacent);
console.log(adjacentColor); // -> '#000080' (近似蓝色)

// 3. 获取对比色 (逆时针旋转 120 度，得到绿色系)
const optionsContrastReverse: ContrastColorOptions = {
  strategy: 'contrast',
  direction: 'counterClockwise'
};
const contrastColorReverse = getContrastTextColor(myBackgroundColor, optionsContrastReverse);
console.log(contrastColorReverse); // -> '#008000' (近似绿色)

// 4. 自定义旋转角度 (顺时针 45 度)
const optionsCustom: ContrastColorOptions = {
  strategy: 'custom',
  customDegree: 45
};
const customColor = getContrastTextColor(myBackgroundColor, optionsCustom);
console.log(customColor); // -> '#400080' (近似靛蓝色)

// 5. 处理带透明度的颜色 (假设背景为白色)
const transparentBg = 'rgba(0, 0, 255, 0.5)'; // 半透明蓝色
const textColorForTransparent = getContrastTextColor(transparentBg); // 默认 accessibility
console.log(textColorForTransparent); // -> '#000000' (因为与白色混合后变亮了)
```

## ⚙️ API 文档

### `getContrastTextColor(backgroundColor, options?)`

*   `backgroundColor`: `string | tinycolor.ColorInput` - 背景颜色。可以是 HEX, RGB(A), HSL(A), HSV(A), 颜色名称等 `tinycolor2` 支持的任何格式。
*   `options?`: `ContrastColorOptions` (可选) - 配置对象。
*   **返回**: `string` - 计算出的文本颜色十六进制字符串 (例如 `'#FFFFFF'`)。如果输入无效，则返回 `options.darkColor`（默认为 `'#000000'`）。

### `ContrastColorOptions` 接口

```typescript
export interface ContrastColorOptions {
    /**
     * 用于确定文本颜色的策略。
     * - 'accessibility': (默认) 优先保证亮度对比度，在 'lightColor'/'darkColor' 之间选择。
     * - 'analogous': 同类色 (旋转色相 +/- 15 度)。
     * - 'adjacent': 邻近色 (旋转色相 +/- 60 度)。
     * - 'contrast': 对比色 (旋转色相 +/- 120 度)。
     * - 'complementary': 互补色 (旋转色相 180 度)。
     * - 'custom': 自定义旋转度数。
     * 注意：除 'accessibility' 外，其他策略不保证 WCAG 对比度。对于无色相颜色 (黑/白/灰)，旋转策略会回退到 'accessibility' 行为。
     * @default 'accessibility'
     */
    strategy?: ColorStrategy; // 类型为 'accessibility' | 'analogous' | ... | 'custom'

    /**
     * [策略: 'accessibility'] 用于判断背景是亮色还是暗色的亮度阈值 (0-1)。
     * @default 0.5
     */
    threshold?: number;

    /**
     * [策略: 'accessibility'] 为暗色背景返回的颜色。也是其他策略处理无色相或纯黑背景时的回退色。
     * @default '#FFFFFF'
     */
    lightColor?: string;

    /**
     * [策略: 'accessibility'] 为亮色背景返回的颜色。也是其他策略处理无色相或纯白背景时的回退色。
     * @default '#000000'
     */
    darkColor?: string;

    /**
     * [策略: 色相旋转类 'analogous'|'adjacent'|'contrast'|'complementary'|'custom']
     * 旋转方向。'clockwise' (顺时针) 或 'counterClockwise' (逆时针)。
     * @default 'clockwise'
     */
    direction?: 'clockwise' | 'counterClockwise';

    /**
     * [策略: 'custom'] 自定义的色相旋转度数 (可以是负数)。
     * @default 0
     */
    customDegree?: number;
}
```

## 🧠 理解策略

*   **`accessibility` (亮度优先)**: 这是默认策略，也是唯一**保证高可读性**的策略。它不关心色相，只计算背景的**相对亮度**。如果亮度高于 `threshold` (默认 0.5)，则认为背景是亮的，返回 `darkColor` (默认黑)；否则返回 `lightColor` (默认白)。这是实现 WCAG 对比度要求的最简单可靠方法。
*   **色相旋转策略 (`analogous`, `adjacent`, `contrast`, `complementary`, `custom`)**: 这些策略基于 HSL 色彩空间的**色相 (Hue)**。它们获取背景色的色相值，然后根据选定的策略和 `direction` 旋转指定的度数 (`customDegree` 或预设值)，生成一个新的色相。饱和度 (Saturation) 和亮度 (Lightness) 通常保持不变。
    *   **重要**: 这些策略产生的颜色**不保证**满足 WCAG 对比度要求，它们更多是为了实现特定的色彩搭配效果。
    *   **回退**: 如果背景色是**无色相**的（即黑色、白色或灰色，饱和度为 0），这些旋转策略无法生效，会自动回退到 `accessibility` 策略的行为。此外，`complementary` 策略对纯黑/纯白背景也会强制回退，以避免返回相同的颜色。

## ⚠️ 重要提示

*   **WCAG 合规性**: 只有 `strategy: 'accessibility'` (默认) 是以满足 WCAG 对比度为主要目标的。其他策略产生的颜色可能视觉效果好，但不一定易于所有用户阅读。
*   **Alpha 透明度**: 函数会先将带 Alpha 通道的颜色与白色背景混合（计算等效的不透明颜色），然后再应用所选策略。
*   **Peer Dependency**: 再次提醒，请确保你的项目中安装了 `tinycolor2`。

## 🤝 贡献

欢迎各种形式的贡献！如果你发现 Bug、有功能建议或想改进代码/文档，请随时提交 Issue 或 Pull Request。

<!-- (可选) 详细贡献指南请参见 CONTRIBUTING.md 文件。 -->

##📄 许可证

本项目采用 [MIT](LICENSE) 许可证。 