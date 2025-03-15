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

  export interface Html5QrcodeConfig {
    fps?: number;
    qrbox?: number | { width: number; height: number };
    aspectRatio?: number;
    disableFlip?: boolean;
    videoConstraints?: MediaTrackConstraints;
  }

  export interface CameraDevice {
    id: string;
    label: string;
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

  export class Html5Qrcode {
    constructor(elementId: string);
    
    start(
      cameraIdOrConfig: string,
      configuration: Html5QrcodeConfig,
      qrCodeSuccessCallback: QrcodeSuccessCallback,
      qrCodeErrorCallback?: QrcodeErrorCallback
    ): Promise<void>;
    
    stop(): Promise<void>;
    
    clear(): void;
    
    static getCameras(): Promise<CameraDevice[]>;
    
    isScanning: boolean;
    
    scanFile(file: File, showImage?: boolean): Promise<string>;
  }
}