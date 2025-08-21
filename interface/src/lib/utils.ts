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
