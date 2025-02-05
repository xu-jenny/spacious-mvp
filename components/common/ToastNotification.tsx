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
    <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-4">
      <Toast className="flex items-center justify-between p-3 w-auto max-w-sm bg-white rounded-lg shadow-md border border-gray-200">
        <div className="flex items-center space-x-3">
          <div
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${bgMap[type]}`}
          >
            {iconMap[type]}
          </div>
          <div className="text-sm font-normal">{message}</div>
        </div>
        <button
          onClick={() => setShow(false)}
          className="ml-4 flex items-center justify-center h-8 w-8 rounded-lg hover:bg-gray-200 transition"
        >
          <HiX className="h-5 w-5 text-gray-500" />
        </button>
      </Toast>
    </div>
  );
};

export default ToastNotification;
