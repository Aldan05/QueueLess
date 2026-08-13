import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { FiX, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const QRScanner = ({ isOpen, onClose, onScanSuccess }) => {
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    // Use a small timeout to allow modal to mount
    const timeout = setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      scanner.render((decodedText) => {
        try {
          let data = null;
          
          if (decodedText.includes('/staff/verify-qr')) {
            const url = new URL(decodedText);
            data = {
              appointmentId: url.searchParams.get('aptId'),
              verificationCode: url.searchParams.get('code'),
              businessId: url.searchParams.get('bizId')
            };
          } else {
            data = JSON.parse(decodedText);
          }

          if (data && data.appointmentId && data.verificationCode) {
            scanner.clear();
            setScanning(false);
            onScanSuccess(data);
          } else {
            toast.error('Invalid QR Code format.');
          }
        } catch (err) {
          toast.error('Could not parse QR data.');
        }
      }, (err) => {
        // Handle scan errors quietly (fires frequently when no QR is in view)
      });

      return () => {
        scanner.clear().catch(e => console.error("Failed to clear scanner", e));
      };
    }, 100);

    return () => clearTimeout(timeout);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 dark:border-slate-800">
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
          <h2 className="text-xl font-bold dark:text-white">Scan Customer QR</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
            <FiX />
          </button>
        </div>
        
        <div className="p-6">
          {scanning ? (
            <div id="qr-reader" className="w-full overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700"></div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mb-4">
                <FiCheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold dark:text-white">QR Scanned Successfully!</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2 text-center">
                Processing check-in...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
