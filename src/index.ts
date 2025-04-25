import tinycolor from 'tinycolor2';

/**
 * 计算 RGB 颜色的相对亮度。
 * 公式来源: https://www.w3.org/TR/WCAG20/#relativeluminancedef
 * @param rgb - 包含 r, g, b 属性的对象 (0-255).
 * @returns 相对亮度 (0-1).
 */
function getRelativeLuminance(rgb: tinycolor.ColorFormats.RGB): number {
    // 将 R, G, B 标准化到 0-1
    const R = rgb.r / 255;
    const G = rgb.g / 255;
    const B = rgb.b / 255;

    // 应用 WCAG 公式的非线性部分
    const RsRGB = R <= 0.03928 ? R / 12.92 : Math.pow((R + 0.055) / 1.055, 2.4);
    const GsRGB = G <= 0.03928 ? G / 12.92 : Math.pow((G + 0.055) / 1.055, 2.4);
    const BsRGB = B <= 0.03928 ? B / 12.92 : Math.pow((B + 0.055) / 1.055, 2.4);

    // 计算最终的相对亮度
    return 0.2126 * RsRGB + 0.7152 * GsRGB + 0.0722 * BsRGB;
}

/**
 * getContrastTextColor 函数的选项接口
 */
export interface ContrastColorOptions {
    /**
     * 用于判断背景是亮色还是暗色的亮度阈值 (0-1)。
     * 默认为 0.5。较高的值倾向于黑色文本，较低的值倾向于白色文本。
     */
    threshold?: number;
    /**
     * 为暗色背景返回的颜色。默认为 '#FFFFFF'。
     */
    lightColor?: string;
    /**
     * 为亮色背景返回的颜色。默认为 '#000000'。
     */
    darkColor?: string;
}

/**
 * 根据给定的背景色确定对比强烈的文本颜色（默认为黑色或白色）。
 * 使用 WCAG 相对亮度计算方法。
 *
 * @param backgroundColor - 背景色字符串，可以是 tinycolor2 支持的任何格式（HEX, RGB, HSL, 颜色名称等）。
 * @param options - 可选的配置对象，用于设置阈值和输出颜色。
 * @returns 对比强烈的文本颜色字符串（例如 '#000000' 或 '#FFFFFF'）。
 *          如果输入颜色无效，则返回 darkColor（默认为 '#000000'）。
 */
export function getContrastTextColor(
    backgroundColor: string | tinycolor.ColorInput,
    options: ContrastColorOptions = {}
): string {
    const color = tinycolor(backgroundColor);

    // 解构选项，并提供默认值
    const {
        threshold = 0.5,
        lightColor = '#FFFFFF',
        darkColor = '#000000'
    } = options;

    // 检查输入颜色是否有效
    if (!color.isValid()) {
        console.warn(`无效的背景色输入: "${backgroundColor}"。将返回默认深色。`);
        return darkColor;
    }

    // 处理 Alpha 透明度：如果存在且显著，假设背景是白色
    // 更健壮的方案可能需要接受一个底层颜色参数。
    // 为简单起见，如果 alpha 小于 1，先与白色混合再计算亮度。
    let rgb = color.toRgb();
    const originalAlpha = rgb.a;

    if (originalAlpha < 1 && originalAlpha > 0) {
        // 与白色背景混合
        const mixedColor = tinycolor.mix('#FFFFFF', color, (1 - originalAlpha) * 100);
        rgb = mixedColor.toRgb();
        // 注意：亮度计算技术上不使用 alpha，
        // 但*感知*颜色会改变，因此先混合。
    } else if (originalAlpha === 0) {
        // 完全透明 - 无法确定对比度，除非知道背后是什么。
        // 在许多 UI 中，默认使用深色文本可能最安全，但这有争议。
        console.warn(`背景色 "${backgroundColor}" 完全透明。无法可靠地确定对比度。将返回默认深色。`);
        return darkColor;
    }

    // 计算（可能是混合后的）颜色的相对亮度
    const luminance = getRelativeLuminance(rgb);

    // 根据亮度阈值返回对比色
    return luminance > threshold ? darkColor : lightColor;
}

// 默认导出，方便使用
export default getContrastTextColor; 