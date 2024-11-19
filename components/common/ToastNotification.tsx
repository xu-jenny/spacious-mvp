"use client";

import React, { useState, useEffect } from "react";
import { Toast } from "flowbite-react";
import {
  HiCheck,
  HiExclamation,
  HiX,
  HiInformationCircle,
} from "react-icons/hi";

type ToastProps = {
  message: string;
  duration?: number;
  type?: "success" | "error" | "info" | "warning";
};

const ToastNotification: React.FC<ToastProps> = ({
  message,
  duration = 3000,
  type = "info",
}) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!show) return null;

  const iconMap = {
    success: <HiCheck className="h-5 w-5" />,
    error: <HiX className="h-5 w-5" />,
    info: <HiInformationCircle className="h-5 w-5" />,
    warning: <HiExclamation className="h-5 w-5" />,
  };

  const bgMap = {
    success:
      "bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200",
    error: "bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-200",
    info: "bg-blue-100 text-blue-500 dark:bg-blue-800 dark:text-blue-200",
    warning:
      "bg-yellow-100 text-yellow-500 dark:bg-yellow-800 dark:text-yellow-200",
  };

  return (
    <div className="fixed bottom-5 right-5">
      <Toast>
        <div
          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${bgMap[type]}`}
        >
          {iconMap[type]}
        </div>
        <div className="ml-3 text-sm font-normal">{message}</div>
        <Toast.Toggle onClick={() => setShow(false)} />
      </Toast>
    </div>
  );
};

export default ToastNotification;
