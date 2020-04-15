export enum WriteStrategy {
  END_OF_SCREENCAST,
  DURING_SCREENCAST,
  DEFER 
 }

 export interface WriteMetadata {
  imageFilename: string,
  data: string,
}