import React from "react";
import { QRCodeSVG } from "qrcode.react";
import CoinsButton from "@/components/coins/coins-button.component";

export interface SchedulingQrDialogProps {
  qrValue: string;
  code?: string;
  onShare?: () => void;
}

export const SchedulingQrDialog: React.FC<SchedulingQrDialogProps> = ({ qrValue, code, onShare }) => {
  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="p-4 bg-white rounded-lg shadow border">
        <QRCodeSVG value={qrValue} size={180} />
      </div>
      {code && (
        <div className="text-lg font-mono text-center">
          Código de acceso: <span className="font-bold">{code}</span>
        </div>
      )}
      <CoinsButton variant="primary" onClick={onShare}>
        Compartir QR y código
      </CoinsButton>
    </div>
  );
};

export default SchedulingQrDialog;
