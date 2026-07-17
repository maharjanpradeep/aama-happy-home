import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { checkinDoorSignUrl } from "@/lib/contact";

const DoorSignQrCode = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "aama-daycare-checkin-qr.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div>
          <p className="font-semibold text-slate-900">Door Check-in QR Code</p>
          <p className="text-sm text-muted-foreground">
            Print this and post it at the entrance. Parents scan it to open the check-in
            page and tap Check In or Check Out.
          </p>
        </div>
        <div className="flex justify-center bg-white p-4 rounded-lg border border-slate-200 w-fit mx-auto">
          <QRCodeCanvas ref={canvasRef} value={checkinDoorSignUrl} size={240} marginSize={2} />
        </div>
        <div className="flex justify-center">
          <Button onClick={handleDownload} variant="outline" size="sm" className="gap-1.5">
            <Download className="h-4 w-4" />
            Download PNG
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DoorSignQrCode;
