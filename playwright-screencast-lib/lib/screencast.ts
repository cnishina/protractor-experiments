import * as fs from 'fs';
import * as path from 'path';
import * as playwright from 'playwright';
import { WriteMetadata, WriteStrategy } from './write_strategy';

/**
 * Screencast uses an experimental feature in Chrome DevTools Protocol to
 * capture frames between a start and stop event.
 */
export class Screencast {
  writeMetadata: WriteMetadata[] = [];
  writeStrategy: WriteStrategy;

  constructor(private cdpSession: playwright.CDPSession,
      public folder: string) {}

  async start(everyNthFrame: number = 3,
      writeStrategy: WriteStrategy = WriteStrategy.DURING_SCREENCAST) {
    this.writeStrategy = writeStrategy;
    const timestamp = (Date.now() / 1000).toFixed(6);
    this.folder = path.resolve(this.folder, `${timestamp}_screencast`);
    fs.mkdirSync(this.folder);

    await this.cdpSession.send('Page.startScreencast',
      {format : 'png', everyNthFrame});
    this.cdpSession.on('Page.screencastFrame', async (frame) => {
      await this.cdpSession.send('Page.screencastFrameAck',
        {sessionId: frame.sessionId});
      const imageFilename = path.resolve(this.folder,
        `frame_${frame.metadata.timestamp.toFixed(6)}.png`);

      // Writing files either at the time of the event or to defer till later.
      if (this.writeStrategy === WriteStrategy.DURING_SCREENCAST) {
        this.writeToFile(imageFilename, frame.data);
      } else {
        this.writeMetadata.push({imageFilename, data: frame.data,});
      }
    });
  }

  async stop() {
    await this.cdpSession.send('Page.stopScreencast');
    if (this.writeStrategy === WriteStrategy.END_OF_SCREENCAST) {
      this.writeDeferredFiles();
    }
  }

  writeToFile(imageFilename: string, data: string) {
    fs.writeFileSync(imageFilename, data, 'base64');
  }

  writeDeferredFiles() {
    for (let metadata of this.writeMetadata) {
      this.writeToFile(metadata.imageFilename, metadata.data);
    }
    this.writeMetadata = [];
  }
}