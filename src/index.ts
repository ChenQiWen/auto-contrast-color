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
 * 定义颜色生成策略的类型
 */
export type ColorStrategy =
    | 'accessibility' // 亮度优先 (黑/白)
    | 'analogous'     // 同类色 (色相 +/- 15度)
    | 'adjacent'      // 邻近色 (色相 +/- 60度)
    | 'contrast'      // 对比色 (色相 +/- 120度)
    | 'complementary' // 互补色 (色相 180度)
    | 'custom';       // 自定义旋转度数

/**
 * getContrastTextColor 函数的选项接口
 */
export interface ContrastColorOptions {
    /**
     * 用于确定文本颜色的策略。
     * - 'accessibility': (默认) 优先保证亮度对比度，在 'lightColor'/'darkColor' 之间选择。
     * - 'analogous': 同类色 (旋转色相 +15 度)。
     * - 'adjacent': 邻近色 (旋转色相 +60 度)。
     * - 'contrast': 对比色 (旋转色相 +120 度)。
     * - 'complementary': 互补色 (旋转色相 180 度)。
     * - 'custom': 自定义旋转度数。
     * 注意：除 'accessibility' 外，其他策略不保证 WCAG 对比度。对于无色相颜色 (黑/白/灰)，旋转策略会回退到 'accessibility' 行为。
     * @default 'accessibility'
     */
    strategy?: ColorStrategy;
    /**
     * [策略: 'accessibility'] 用于判断背景是亮色还是暗色的亮度阈值 (0-1)。
     * 默认为 0.5。
     */
    threshold?: number;
    /**
     * [策略: 'accessibility'] 为暗色背景返回的颜色。也是其他策略在处理无色相背景时的回退色。默认为 '#FFFFFF'。
     */
    lightColor?: string;
    /**
     * [策略: 'accessibility'] 为亮色背景返回的颜色。也是其他策略在处理无色相背景时的回退色。默认为 '#000000'。
     */
    darkColor?: string;
    /**
     * [策略: 色相旋转类] 旋转方向。'clockwise' (顺时针) 或 'counterClockwise' (逆时针)。
     * @default 'clockwise'
     */
    direction?: 'clockwise' | 'counterClockwise';
    /**
     * [策略: 'custom'] 自定义的色相旋转度数。
     * @default 0
     */
    customDegree?: number;
}

/**
 * 根据给定的背景色和策略确定合适的文本颜色。
 *
 * @param backgroundColor - 背景色字符串。
 * @param options - 可选的配置对象。
 * @returns 计算出的文本颜色字符串。如果输入颜色无效，则返回 options.darkColor。
 */
export function getContrastTextColor(
    backgroundColor: string | tinycolor.ColorInput,
    options: ContrastColorOptions = {}
): string {
    const color = tinycolor(backgroundColor);

    const {
        strategy = 'accessibility',
        threshold = 0.5,
        lightColor = '#FFFFFF',
        darkColor = '#000000',
        direction = 'clockwise', // 默认顺时针
        customDegree = 0 // 默认自定义度数为 0
    } = options;

    if (!color.isValid()) {
        console.warn(`无效的背景色输入: "${backgroundColor}"。将返回默认深色 (${darkColor})。`);
        return darkColor;
    }

    let processedColor = color;
    let rgb = color.toRgb();
    const originalAlpha = rgb.a;

    if (originalAlpha < 1 && originalAlpha > 0) {
        processedColor = tinycolor.mix('#FFFFFF', color, (1 - originalAlpha) * 100);
        rgb = processedColor.toRgb();
    } else if (originalAlpha === 0) {
        console.warn(`背景色 "${backgroundColor}" 完全透明。无法可靠地确定颜色。将返回默认深色 (${darkColor})。`);
        return darkColor;
    }

    // 对于需要旋转色相的策略，先检查背景色是否为无色相 (黑/白/灰)
    // 通过检查饱和度 (Saturation) 是否为 0 来判断
    const hsl = processedColor.toHsl();
    const isAchromatic = hsl.s === 0; // 饱和度为 0 表示无色相

    // --- 根据策略选择计算方法 ---
    switch (strategy) {
        case 'analogous':
        case 'adjacent':
        case 'contrast':
        case 'complementary':
        case 'custom':
            // 回退到 accessibility 的条件:
            // 1. 背景是无色相 (黑/白/灰)
            // 2. 策略是 'complementary' 且背景是纯黑或纯白 (避免互补色是自身)
            const processedHex = processedColor.toHexString();
            if (isAchromatic ||
                (strategy === 'complementary' && (processedHex === '#000000' || processedHex === '#ffffff')))
            {
                if (isAchromatic) {
                    console.log(`背景色 ${processedHex} 无色相，策略 '${strategy}' 回退到亮度对比`);
                } else {
                     console.log(`背景为 ${processedHex}，互补色策略强制返回亮度对比色`);
                }
                // 使用 accessibility 的逻辑
                const luminanceFallback = getRelativeLuminance(rgb);
                return luminanceFallback > threshold ? darkColor : lightColor;
            }

            // 确定基础旋转度数
            let baseDegrees: number;
            switch (strategy) {
                case 'analogous':     baseDegrees = 15; break;
                case 'adjacent':      baseDegrees = 60; break;
                case 'contrast':      baseDegrees = 120; break;
                case 'complementary': baseDegrees = 180; break;
                case 'custom':        baseDegrees = customDegree || 0; break; // 使用 customDegree，若无效则为 0
                default:              baseDegrees = 0;
            }

            // 根据方向调整最终度数
            const finalDegrees = direction === 'counterClockwise' ? -baseDegrees : baseDegrees;

            // 使用 spin 方法旋转色相
            const spunColor = processedColor.spin(finalDegrees);
            return spunColor.toHexString();

        case 'accessibility':
        default:
             // 计算相对亮度并返回黑/白
            const luminance = getRelativeLuminance(rgb);
            return luminance > threshold ? darkColor : lightColor;
    }
}

export default getContrastTextColor; 