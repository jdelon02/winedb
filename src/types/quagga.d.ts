// Type definitions for Quagga 0.12.1
// Project: https://github.com/serratus/quaggaJS
// Definitions by: Wine Collection App Team

declare module 'quagga' {
  namespace Quagga {
    interface QuaggaInitConfig {
      inputStream: {
        name?: string;
        type: string;
        target: HTMLElement;
        constraints?: {
          width?: number | { min: number };
          height?: number | { min: number };
          aspectRatio?: { min: number; max: number };
          facingMode?: string;
          deviceId?: string | { exact: string };
        };
        area?: {
          top?: string;
          right?: string;
          left?: string;
          bottom?: string;
        };
        singleChannel?: boolean;
      };
      locator?: {
        patchSize?: string;
        halfSample?: boolean;
      };
      decoder?: {
        readers: string[];
        debug?: {
          showCanvas?: boolean;
          showPatches?: boolean;
          showFoundPatches?: boolean;
          showSkeleton?: boolean;
          showLabels?: boolean;
          showPatchLabels?: boolean;
          showRemainingPatchLabels?: boolean;
        };
      };
      locate?: boolean;
      numOfWorkers?: number;
      frequency?: number;
    }

    interface QuaggaResult {
      codeResult: {
        code: string;
        format: string;
        start: number;
        end: number;
        codeset: number;
        startInfo: {
          error: number;
          code: number;
          start: number;
          end: number;
        };
        decodedCodes: any[];
      };
      line: {
        x: number;
        y: number;
      }[];
      angle: number;
      pattern: number[];
      box: [
        { x: number; y: number },
        { x: number; y: number },
        { x: number; y: number },
        { x: number; y: number }
      ];
    }

    function init(
      config: QuaggaInitConfig,
      callback: (err: any) => void
    ): void;
    function start(): void;
    function stop(): void;
    function onDetected(callback: (data: QuaggaResult) => void): void;
    function offDetected(callback: (data: QuaggaResult) => void): void;
    function decodeSingle(
      config: QuaggaInitConfig,
      callback: (result: QuaggaResult) => void
    ): void;
  }

  export default Quagga;
}