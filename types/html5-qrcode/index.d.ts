// types/html5-qrcode/index.d.ts

declare module 'html5-qrcode' {
    export interface QrcodeSuccessCallback {
      (decodedText: string, decodedResult: any): void;
    }
  
    export interface QrcodeErrorCallback {
      (errorMessage: string, error: any): void;
    }
  
    export interface Html5QrcodeScannerConfig {
      fps?: number;
      qrbox?: number | { width: number; height: number };
      aspectRatio?: number;
      disableFlip?: boolean;
      videoConstraints?: MediaTrackConstraints;
    }
  
    export class Html5QrcodeScanner {
      constructor(
        elementId: string,
        config: Html5QrcodeScannerConfig,
        verbose?: boolean
      );
      
      render(
        successCallback: QrcodeSuccessCallback,
        errorCallback?: QrcodeErrorCallback
      ): void;
      
      clear(): Promise<void>;
    }
  }