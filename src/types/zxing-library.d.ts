declare module '@zxing/library' {
    export class BrowserMultiFormatReader {
        decodeFromVideoDevice(
            deviceId: string | null,
            videoElement: HTMLVideoElement,
            callback: (result: Result | null, error: Error | null) => void
        ): void;
        reset(): void;
    }

    export interface Result {
        getText(): string;
    }
}