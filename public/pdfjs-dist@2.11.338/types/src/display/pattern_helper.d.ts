export function getShadingPattern(IR: any, cachedCanvasPatterns: any): RadialAxialShadingPattern | MeshShadingPattern | DummyShadingPattern;
export class TilingPattern {
    static get MAX_PATTERN_SIZE(): any;
    constructor(IR: any, color: any, ctx: any, canvasGraphicsFactory: any, baseTransform: any);
    operatorList: any;
    matrix: any;
    bbox: any;
    xstep: any;
    ystep: any;
    paintType: any;
    tilingType: any;
    color: any;
    ctx: any;
    canvasGraphicsFactory: any;
    baseTransform: any;
    createPatternCanvas(owner: any): {
        canvas: any;
        scaleX: any;
        scaleY: any;
        offsetX: any;
        offsetY: any;
    };
    getSizeAndScale(step: any, realOutputSize: any, scale: any): {
        scale: any;
        size: number;
    };
    clipBbox(graphics: any, x0: any, y0: any, x1: any, y1: any): void;
    setFillAndStrokeStyleToContext(graphics: any, paintType: any, color: any): void;
    getPattern(ctx: any, owner: any, inverse: any, shadingFill?: boolean): any;
}
declare class RadialAxialShadingPattern extends BaseShadingPattern {
    constructor(IR: any, cachedCanvasPatterns: any);
    _type: any;
    _bbox: any;
    _colorStops: any;
    _p0: any;
    _p1: any;
    _r0: any;
    _r1: any;
    matrix: any;
    cachedCanvasPatterns: any;
    _createGradient(ctx: any): any;
}
declare class MeshShadingPattern extends BaseShadingPattern {
    constructor(IR: any);
    _coords: any;
    _colors: any;
    _figures: any;
    _bounds: any;
    _bbox: any;
    _background: any;
    matrix: any;
    _createMeshCanvas(combinedScale: any, backgroundColor: any, cachedCanvases: any): {
        canvas: any;
        offsetX: number;
        offsetY: number;
        scaleX: number;
        scaleY: number;
    };
}
declare class DummyShadingPattern extends BaseShadingPattern {
}
declare class BaseShadingPattern {
    getPattern(): void;
}
export {};
