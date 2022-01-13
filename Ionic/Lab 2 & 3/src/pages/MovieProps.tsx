import React from "react";
import dateFormat from "dateformat";
import {GeolocationPosition} from "@capacitor/core";
export const libraryDateFormat = "yyyy-mm-dd HH:mm";
export const IonDateTimeDateFormat = "YYYY-MM-DD HH:mm";


export interface MovieProps {

  _id?: string;
  name: string;
  director:string;
  rating:number;
  debut:Date;
  isFinished:boolean;
  photo?: Photo;
  position?: GeolocationPosition;

}
export function dateToString(date: Date): string {
  return dateFormat(date, libraryDateFormat);
}

export function stringToDate(string: string | undefined | null): Date {
  return new Date(string || new Date());
}
export interface Photo {
  filepath: string;
  webviewPath?: string;
}
