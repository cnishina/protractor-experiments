import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as playwright from 'playwright';
import { Screencast } from './screencast';
import { WriteStrategy } from './write_strategy';

export class Visual {
  currentScreencast: Screencast;
  folders: string[] = [];
  screencasts: Screencast[] = [];

  baseFolder = 'output';
  name: string;

  /**
   * The session's screenshots and screencasts.
   * 
   * The name should be unique. If the name is not unique, screenshots and
   * screencasts become joined. There are no checks if folder name already
   * exists.
   * @param name 
   * @param page 
   * @param browserName 
   */
  constructor(name: string, private page: playwright.Page,
      private browserName: string) {
    this.name = name.replace('/', '_').replace(' ', '_');
    try {
      this.baseFolder = path.join(this.baseFolder, this.name);
      fs.mkdirSync(this.baseFolder,  {recursive: true});
    } catch (e) {
      // no-op: we just want an output directory. 
    }
  }

  async screenshot() {
    const timestamp = (Date.now() / 1000).toFixed(6);
    const folder = path.join(this.baseFolder, `${timestamp}_screenshot`);
    fs.mkdirSync(folder,  {recursive: true});
    this.folders.push(folder);
    const imageFilename = path.resolve(folder, `frame_${timestamp}.png`);
    await this.page.screenshot({path: imageFilename});
  }

  async startScreencast(
      everyNthFrame: number = 3,
      writeStrategy: WriteStrategy = WriteStrategy.DURING_SCREENCAST) {
    if (this.browserName === 'chromium') {
      if (this.currentScreencast) {
        await this.stopScreencast();
      }
      const chromiumContext = (
        this.page.context() as playwright.ChromiumBrowserContext);
      const chromeDevTools = await chromiumContext.newCDPSession(this.page);
      this.currentScreencast = new Screencast(chromeDevTools, this.baseFolder);
      await this.currentScreencast.start(everyNthFrame, writeStrategy);
      this.folders.push(this.currentScreencast.folder);
    } else {
      console.log('Screencast is supported by chromium only.');
    }
  }

  async stopScreencast() {
    if (this.browserName === 'chromium') {
      await this.currentScreencast.stop();
      if (this.currentScreencast.writeStrategy === WriteStrategy.DEFER) {
        this.screencasts.push(this.currentScreencast);
      }
      this.currentScreencast = null;
    } else {
      console.log('Screencast is supported by chromium only.');
    }
  }

  deferWrite() {
    for (let screencast of this.screencasts) {
      screencast.writeDeferredFiles();
    }
  }

  async createVideo() {
    let lastScreenshot: string = null;
    const tmpFolder = path.resolve(this.baseFolder, 'tmp_video');
    fs.mkdirSync(tmpFolder, {recursive: true});
    const regex = /.*_(\d+.\d+).png/
    
    for (const folder of this.folders) {
      // Gets the start and end timestamp.
      const files = fs.readdirSync(folder);
      let startTime = Number.MAX_SAFE_INTEGER;
      let endTime = Number.MIN_SAFE_INTEGER;
      for (const file of files) {
        const time = Number(regex.exec(file)[1]);
        startTime = Math.min(time, startTime);
        endTime = Math.max(time, endTime);
      }

      // Creates a video from the last screenshot and the first frame.
      if (lastScreenshot) {
        const lastScreenshotTimestamp = Number(regex.exec(lastScreenshot)[1]);
        const duration = startTime - lastScreenshotTimestamp;
        const videoFilename = path.resolve(tmpFolder, 
          `${lastScreenshotTimestamp.toFixed(6)}-${startTime.toFixed(6)}.avi`);
        let command = `ffmpeg -loop 1 -i "${lastScreenshot}" ` +
          `-t ${duration} ${videoFilename}`;
        console.log(command);
        child_process.execSync(command);
      }

      const runTime = endTime - startTime;
      const frameCount = files.length;
      if (runTime) {
        // Creates a video from screencasts.
        const frameRate = frameCount / runTime;
        const videoFilename = path.resolve(tmpFolder,
          `${startTime.toFixed(6)}-${endTime.toFixed(6)}.avi`);
        console.log(`Time: ${startTime} - ${endTime}`);
        console.log(`Frame rate: ${frameCount / runTime}`);
        let command = `ffmpeg -r ${frameRate} -pattern_type glob ` +
          `-i "${folder}/*.png" ${videoFilename}`;
        console.log(command);
        child_process.execSync(command);
      }
      // Sets the last screenshot.
      lastScreenshot = path.resolve(folder, `frame_${endTime.toFixed(6)}.png`);
    }
    await new Promise((resolve) => {
      setTimeout(resolve, 2000);
    });
    let concat = ''
    for (const file of fs.readdirSync(tmpFolder)) {
      concat += `${tmpFolder}/${file}|`;
    }
    const videoFilename = path.resolve(this.baseFolder, 'output.avi');
    concat = concat.slice(0, -1);
    const command = `ffmpeg -i "concat:${concat}" -c copy ${videoFilename}`;
    console.log(command);
    child_process.execSync(command);
  }
}