import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FiMaximize2 } from 'react-icons/fi';

const QRCodeDisplay = ({ value, title = "Scan to Check-in" }) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-gray-100/80 dark:border-slate-700 flex flex-col items-center justify-center text-center">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <FiMaximize2 className="text-blue-500" />
        {title}
      </h3>
      <div className="bg-white p-4 rounded-2xl shadow-inner border border-gray-100 inline-block mb-4">
        <QRCodeSVG 
          value={value} 
          size={180}
          bgColor={"#ffffff"}
          fgColor={"#000000"}
          level={"Q"}
          className="rounded-lg"
        />
      </div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        Show this QR code at the counter for quick verification.
      </p>
    </div>
  );
};

export default QRCodeDisplay;
