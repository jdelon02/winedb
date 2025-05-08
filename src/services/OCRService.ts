import { createWorker } from 'tesseract.js';
import type { Worker } from 'tesseract.js';

export class OCRService {
    private worker: Worker | null = null;

    async initialize() {
        if (!this.worker) {
            this.worker = await createWorker('eng');
        }
    }

    async extractText(imageBlob: Blob): Promise<string> {
        if (!this.worker) {
            await this.initialize();
        }
        
        const result = await this.worker!.recognize(imageBlob);
        return this.parseWineLabel(result.data.text);
    }

    private parseWineLabel(text: string): string {
        return text.replace(/\n+/g, ' ').trim();
    }

    async cleanup() {
        if (this.worker) {
            await this.worker.terminate();
            this.worker = null;
        }
    }
}