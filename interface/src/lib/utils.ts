import { twMerge } from "tailwind-merge";
import clsx, { type ClassValue } from "clsx";
import toast from "react-hot-toast";

export const shortAddress = (
  address: string | null | `0x${string}` | undefined
) => {
  return `${address?.substring(0, 4)}...${address?.substring(
    address?.length - 0,
    address?.length - 4
  )}`;
};

export const cn = (...className: ClassValue[]) => {
  return twMerge(clsx(className));
};

export const toastError = (text: string) => {
  return toast.error(`${text}`, {
    duration: 3000,
  });
};

export const toastSuccess = (text: string) => {
  return toast.success(`${text}`, {
    duration: 3000,
  });
};

export const copyPaste = (item: string) => {
  toast.success("Copy Successfully !", {
    duration: 3000,
  });
  return navigator.clipboard.writeText(item);
};

export const convertTime = (timestamp: number) => {
  if (timestamp === 0 || !timestamp) {
    return "No time set";
  }
  const date = new Date(timestamp * 1000);
  const readableTime = date.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return readableTime;
};

export const dateTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date;
};

export const formatDate = (timestamp: string) => {
  const date = new Date(timestamp);
  const format = date.toLocaleDateString("en-CA");
  return format;
};

export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(2) + " " + units[i];
};
