"use client";
import { scanReciept } from "@/actions/transaction";
import { Button } from "@/components/ui/button";
import useFetch from "@/hooks/use-fetch";
import { Camera, Loader2 } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { toast } from "sonner";

const RecieptScanner = ({ onScanComplete }) => {
  const fileInputRef = useRef();

  const {
    loading: scanRecieptLoading,
    fn: scanRecieptFn,
    data: scannedData,
    error,
  } = useFetch(scanReciept);

  const handleRecieptScan = async (file) => {
    if (file.size > 5 * 1024 * 1024) {
      // 5mb
      toast.error("File size should be less than 5 MB");
      return;
    }
    await scanRecieptFn(file);
  };

  useEffect(() => {
    if (scannedData && !scanRecieptLoading) {
      onScanComplete(scannedData);
      toast.success("Reciept scanned successfully");
    }
  }, [scannedData, scanRecieptLoading]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Reciept Scanning Failed");
    }
  }, [error]);

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleRecieptScan(file);
        }}
      />
      <Button
        type="button"
        variant="outline"
        className="w-full h-10 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500 animate-gradient hover:opacity-90 transition-opacity text-white hover:text-white"
        onClick={() => fileInputRef.current?.click()}
        disabled={scanRecieptLoading}
      >
        {scanRecieptLoading ? (
          <>
            <Loader2 className="mr-2 animate-spin" />
            <span>Scanning Reciept...</span>
          </>
        ) : (
          <>
            <Camera className="mr-2" />
            <span>Scan Recieptwith AI</span>
          </>
        )}
      </Button>
    </div>
  );
};

export default RecieptScanner;
