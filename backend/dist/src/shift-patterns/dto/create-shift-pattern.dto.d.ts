export declare class ShiftPatternSequenceItemDto {
    type: string;
    start?: string;
    end?: string;
    sourceMatrixId?: string;
    blockIndex?: number;
}
export declare class CreateShiftPatternDto {
    name: string;
    sequence: ShiftPatternSequenceItemDto[];
}
