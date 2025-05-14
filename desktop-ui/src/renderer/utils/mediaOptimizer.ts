/**
 * Utilities for optimizing images and media to reduce memory usage
 */

/**
 * Options for image optimization
 */
export interface ImageOptimizationOptions {
  /**
   * The maximum width of the image
   * @default 1920
   */
  maxWidth?: number;
  
  /**
   * The maximum height of the image
   * @default 1080
   */
  maxHeight?: number;
  
  /**
   * The quality of the image (0-1)
   * @default 0.8
   */
  quality?: number;
  
  /**
   * The format of the image
   * @default 'webp'
   */
  format?: 'jpeg' | 'png' | 'webp';
  
  /**
   * Whether to preserve the aspect ratio
   * @default true
   */
  preserveAspectRatio?: boolean;
}

/**
 * A class for optimizing images and media
 */
export class MediaOptimizer {
  /**
   * Optimizes an image to reduce memory usage
   * @param imageSource The image source (URL, File, Blob, or HTMLImageElement)
   * @param options Options for optimization
   * @returns A promise that resolves to an optimized image blob
   */
  async optimizeImage(
    imageSource: string | File | Blob | HTMLImageElement,
    options: ImageOptimizationOptions = {}
  ): Promise<Blob> {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      format = 'webp',
      preserveAspectRatio = true,
    } = options;
    
    // Load the image
    const image = await this.loadImage(imageSource);
    
    // Calculate dimensions
    const { width, height } = this.calculateDimensions(
      image.width,
      image.height,
      maxWidth,
      maxHeight,
      preserveAspectRatio
    );
    
    // Create a canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    // Draw the image on the canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }
    
    ctx.drawImage(image, 0, 0, width, height);
    
    // Convert the canvas to a blob
    const mimeType = this.getMimeType(format);
    const blob = await this.canvasToBlob(canvas, mimeType, quality);
    
    return blob;
  }
  
  /**
   * Optimizes a video thumbnail
   * @param videoSource The video source (URL, File, Blob, or HTMLVideoElement)
   * @param options Options for optimization
   * @returns A promise that resolves to an optimized thumbnail blob
   */
  async optimizeVideoThumbnail(
    videoSource: string | File | Blob | HTMLVideoElement,
    options: ImageOptimizationOptions & { time?: number } = {}
  ): Promise<Blob> {
    const { time = 0, ...imageOptions } = options;
    
    // Load the video
    const video = await this.loadVideo(videoSource);
    
    // Seek to the specified time
    video.currentTime = time;
    
    // Wait for the video to be ready
    await new Promise<void>((resolve, reject) => {
      const onSeeked = () => {
        video.removeEventListener('seeked', onSeeked);
        resolve();
      };
      
      const onError = (error: Event) => {
        video.removeEventListener('error', onError);
        reject(new Error('Failed to seek video'));
      };
      
      video.addEventListener('seeked', onSeeked);
      video.addEventListener('error', onError);
    });
    
    // Create a canvas
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the video frame on the canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Optimize the thumbnail
    return this.optimizeImage(canvas.toDataURL('image/png'), imageOptions);
  }
  
  /**
   * Creates a responsive image set
   * @param imageSource The image source (URL, File, Blob, or HTMLImageElement)
   * @param sizes An array of sizes to generate
   * @param options Options for optimization
   * @returns A promise that resolves to an array of optimized image blobs with their sizes
   */
  async createResponsiveImageSet(
    imageSource: string | File | Blob | HTMLImageElement,
    sizes: { width: number; height?: number }[],
    options: Omit<ImageOptimizationOptions, 'maxWidth' | 'maxHeight'> = {}
  ): Promise<Array<{ blob: Blob; width: number; height: number }>> {
    const results: Array<{ blob: Blob; width: number; height: number }> = [];
    
    // Load the image
    const image = await this.loadImage(imageSource);
    
    // Generate each size
    for (const size of sizes) {
      const { width, height = Math.round((size.width / image.width) * image.height) } = size;
      
      const blob = await this.optimizeImage(image, {
        ...options,
        maxWidth: width,
        maxHeight: height,
      });
      
      results.push({ blob, width, height });
    }
    
    return results;
  }
  
  /**
   * Preloads an image to ensure it's in the browser cache
   * @param url The URL of the image
   * @returns A promise that resolves when the image is loaded
   */
  preloadImage(url: string): Promise<HTMLImageElement> {
    return this.loadImage(url);
  }
  
  /**
   * Loads an image from various sources
   * @param source The image source (URL, File, Blob, or HTMLImageElement)
   * @returns A promise that resolves to an HTMLImageElement
   * @private
   */
  private loadImage(
    source: string | File | Blob | HTMLImageElement
  ): Promise<HTMLImageElement> {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      if (source instanceof HTMLImageElement) {
        if (source.complete) {
          resolve(source);
        } else {
          source.onload = () => resolve(source);
          source.onerror = () => reject(new Error('Failed to load image'));
        }
        return;
      }
      
      const image = new Image();
      
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Failed to load image'));
      
      if (typeof source === 'string') {
        image.src = source;
      } else {
        const url = URL.createObjectURL(source);
        image.src = url;
        
        // Clean up the object URL after the image is loaded
        image.onload = () => {
          URL.revokeObjectURL(url);
          resolve(image);
        };
      }
    });
  }
  
  /**
   * Loads a video from various sources
   * @param source The video source (URL, File, Blob, or HTMLVideoElement)
   * @returns A promise that resolves to an HTMLVideoElement
   * @private
   */
  private loadVideo(
    source: string | File | Blob | HTMLVideoElement
  ): Promise<HTMLVideoElement> {
    return new Promise<HTMLVideoElement>((resolve, reject) => {
      if (source instanceof HTMLVideoElement) {
        resolve(source);
        return;
      }
      
      const video = document.createElement('video');
      video.muted = true;
      
      video.onloadedmetadata = () => resolve(video);
      video.onerror = () => reject(new Error('Failed to load video'));
      
      if (typeof source === 'string') {
        video.src = source;
      } else {
        const url = URL.createObjectURL(source);
        video.src = url;
        
        // Clean up the object URL after the video is loaded
        video.onloadedmetadata = () => {
          URL.revokeObjectURL(url);
          resolve(video);
        };
      }
    });
  }
  
  /**
   * Calculates dimensions while preserving aspect ratio
   * @param originalWidth The original width
   * @param originalHeight The original height
   * @param maxWidth The maximum width
   * @param maxHeight The maximum height
   * @param preserveAspectRatio Whether to preserve the aspect ratio
   * @returns The calculated dimensions
   * @private
   */
  private calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number,
    preserveAspectRatio: boolean
  ): { width: number; height: number } {
    if (!preserveAspectRatio) {
      return {
        width: Math.min(originalWidth, maxWidth),
        height: Math.min(originalHeight, maxHeight),
      };
    }
    
    const aspectRatio = originalWidth / originalHeight;
    
    if (originalWidth > maxWidth || originalHeight > maxHeight) {
      const widthRatio = maxWidth / originalWidth;
      const heightRatio = maxHeight / originalHeight;
      
      if (widthRatio < heightRatio) {
        return {
          width: maxWidth,
          height: Math.round(maxWidth / aspectRatio),
        };
      } else {
        return {
          width: Math.round(maxHeight * aspectRatio),
          height: maxHeight,
        };
      }
    }
    
    return {
      width: originalWidth,
      height: originalHeight,
    };
  }
  
  /**
   * Converts a canvas to a blob
   * @param canvas The canvas element
   * @param mimeType The MIME type of the blob
   * @param quality The quality of the blob (0-1)
   * @returns A promise that resolves to a blob
   * @private
   */
  private canvasToBlob(
    canvas: HTMLCanvasElement,
    mimeType: string,
    quality: number
  ): Promise<Blob> {
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert canvas to blob'));
          }
        },
        mimeType,
        quality
      );
    });
  }
  
  /**
   * Gets the MIME type for a format
   * @param format The format
   * @returns The MIME type
   * @private
   */
  private getMimeType(format: 'jpeg' | 'png' | 'webp'): string {
    switch (format) {
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'webp':
        return 'image/webp';
      default:
        return 'image/jpeg';
    }
  }
}

// Create a singleton instance
export const mediaOptimizer = new MediaOptimizer();

export default mediaOptimizer;
