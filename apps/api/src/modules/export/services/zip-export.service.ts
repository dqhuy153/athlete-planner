import { Injectable } from '@nestjs/common';
import JSZip from 'jszip';

@Injectable()
export class ZipExportService {
  async buildZip(
    files: Array<{ filename: string; data: Uint8Array }>,
  ): Promise<Buffer> {
    const zip = new JSZip();
    for (const file of files) {
      zip.file(file.filename, file.data);
    }
    return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  }
}
