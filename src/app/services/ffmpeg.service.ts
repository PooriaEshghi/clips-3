import { Injectable } from '@angular/core';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

@Injectable({
  providedIn: 'root'
})
export class FfmpegService {
  isRunning = false
  isReady = false
  private ffmpeg

  constructor() {
    this.ffmpeg = createFFmpeg({log: true})
   }
   async init(){
    if(this.isReady){
      return
    }
    await this.ffmpeg.load()

    this.isReady = true
  }

  async getScreenShots(file: File){
    this.isRunning = true
    const data = await fetchFile(file)
    this.ffmpeg.FS('writeFile', file.name, data )
    const seconds = [1,2,3]
    const comands: string[] = []
    seconds.forEach( second => {
      comands.push(
        // Input
        '-i', file.name,
        // Output Option
        '-ss', `00:00:0${second}`,
        '-frames:v', '1',
        '-filter:v', 'scale=510:-1',
        // Output
        `output_0${second}.png`
      )
    })
    await this.ffmpeg.run(
     ...comands
    )

    const screenshots: string[] = []

    seconds.forEach(second => {
      const screenshotFile = this.ffmpeg.FS(
        'readFile',`output_0${second}.png`
      )
      const screenshotBlob = new Blob(
        [screenshotFile.buffer],{
          type: 'image/png'
        }
      )  

      const screenshotURL = URL.createObjectURL(screenshotBlob)  

      screenshots.push(screenshotURL)
    })
    this.isRunning = false
    return screenshots
  }
  async blobFormURL(url: string){
    const response = await fetch(url)
    console.log(response.body, response.headers)
    const blob = await response.blob()

    return blob
  }
}
