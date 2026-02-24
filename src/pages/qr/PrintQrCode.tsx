import { useState, useRef, useEffect } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import Swal from "sweetalert2";
import QRCode from "qrcode";
import { callApi } from "../../utils/api";

type QrStatusRecord = {
  assetCode: string;
  qrCode: string;
  allocationDate: string;
  assignedBy: string;
  status: string;
};

export default function PrintQrCodesComponent() {
  const [qrStatusRecords, setQrStatusRecords] = useState<QrStatusRecord[]>([]);
  const [qrImages, setQrImages] = useState<{ code: string; url: string }[]>([]);
  const printRef = useRef<HTMLDivElement>(null);

  // Fetch QR status records on mount
  useEffect(() => {
    fetchStatusRecords("all");
  }, []);

const fetchStatusRecords = async (status: string) => {
    try {
      const response = await callApi<any>(`/api/qr-allocations/status/${status}`, { method: "GET" });
      const statusArray = Array.isArray(response) ? response : [];
      const mappedStatus = statusArray.map((item: any) => ({
        assetCode: item.entity_code || item.asset_code || "",
        qrCode: item.qrCode || item.qr_code || "",
        allocationDate: item.allocationDate || item.allocation_date || "",
        assignedBy: item.assignedBy || item.assigned_by || "",
        status: item.status || "",
      }));
      setQrStatusRecords(mappedStatus);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load QR status records: " + error,
      });
    }
  };

  // Generate QR images for printing
  const generateQrImages = async () => {
    const images: { code: string; url: string }[] = [];
    for (const record of qrStatusRecords) {
      const url = await QRCode.toDataURL(record.qrCode);
      images.push({ code: record.qrCode, url });
    }
    setQrImages(images);
    console.log(qrImages);
    return images;
  };

  async function updatePrintedStatus(qrCodes: string[]) {
      try {
        // Replace with your actual logged-in user id logic
        const changedBy = localStorage.getItem("userId") || "admin";
        await callApi("/api/qr-allocations/bulk/status", {
          method: "PATCH",
          body: {
            qrCodes,
            status: "Printed",
            changedBy,
          },
          headers: {
            "Content-Type": "application/json",
          },
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Update Error",
          text: "Failed to update printed status: " + error,
        });
      }
    }

  // Print handler
  const handlePrint = async () => {

    const result = await Swal.fire({
        title: "Are you sure to print this?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, Print",
        cancelButtonText: "No",
    });

    if (result.isConfirmed) {

    await fetchStatusRecords("Active");
    await updatePrintedStatus(qrStatusRecords.map(record => record.qrCode));
    const images = await generateQrImages();
    if (images.length > 0) {
      if (printRef.current) {
        printRef.current.innerHTML = `
          <div class="qr-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:24px;padding:24px;">
            ${images
              .map(
                (qr) => `
                  <div class="qr-item" style="display:flex;flex-direction:column;align-items:center;border:1px solid #ccc;padding:12px;border-radius:8px;page-break-inside:avoid;">
                    <img src="${qr.url}" alt="QR ${qr.code}" style="width:120px;height:120px;" />
                    <div style="margin-top:8px;font-size:12px;">${qr.code}</div>
                  </div>
                `
              )
              .join("")}
          </div>
        `;
        const printContents = printRef.current.innerHTML;
        const win = window.open("", "Print QR Codes", "width=800,height=600");
        if (win) {
          win.document.write(`
            <html>
              <head>
                <title>Print QR Codes</title>
                <style>
                  @media print {
                    body { margin: 0; }
                    .qr-grid {
                      display: grid;
                      grid-template-columns: repeat(4, 1fr);
                      gap: 24px;
                      padding: 24px;
                    }
                    .qr-item {
                      display: flex;
                      flex-direction: column;
                      align-items: center;
                      border: 1px solid #ccc;
                      padding: 12px;
                      border-radius: 8px;
                      page-break-inside: avoid;
                    }
                    img { width: 120px; height: 120px; }
                    .qr-code-label { margin-top: 8px; font-size: 12px; }
                  }
                </style>
              </head>
              <body>
                ${printContents}
              </body>
            </html>
          `);
          win.document.close();
          win.focus();
          win.print();
          win.close();
        } else {
          Swal.fire({
            icon: "error",
            title: "Print Error",
            text: "Unable to open print window. Please check your browser settings.",
          });
        }
      }
    } else {
      Swal.fire({
        icon: "info",
        title: "No QR Codes",
        text: "No active QR codes found to print.",
      });
    }
    } else {
        console.log("Print cancelled by user.");
    }
  };

  return (
    <ComponentCard title="Generate QR Codes">
      <div className="mt-12">
        <button
          className="px-4 py-2 text-white bg-gray-800 rounded hover:bg-gray-900 mb-6"
          onClick={handlePrint}
        >
          Print Active QR Codes
        </button>
        <h3 className="font-semibold mb-2">All QR Status Records</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border border-gray-200 dark:border-gray-700">
            <thead className="bg-gray-100 dark:bg-dark-800">
              <tr className="text-xs font-semibold text-gray-600 uppercase dark:text-gray-300">
                <th className="px-4 py-2 border-r">Asset Code</th>
                <th className="px-4 py-2 border-r">QR Code</th>
                <th className="px-4 py-2 border-r">Allocation Date</th>
                <th className="px-4 py-2 border-r">Assigned By</th>
                <th className="px-4 py-2 border-r">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-dark-900">
              {qrStatusRecords.map((record, idx) => (
                <tr
                  key={idx}
                  className={`hover:bg-gray-50 dark:hover:bg-dark-700 ${
                    record.status === "Active"
                      ? "bg-yellow-100"
                      : record.status === "Printed"
                      ? "bg-green-100"
                      : record.status === "Cancelled"
                      ? "bg-red-100"
                      : record.status === "Allocated"
                      ? "bg-blue-100"
                      :""
                  }`}
                >
                  <td className="px-4 py-2 border-r">{record.assetCode}</td>
                  <td className="px-4 py-2 border-r">{record.qrCode}</td>
                  <td className="px-4 py-2 border-r">{record.allocationDate}</td>
                  <td className="px-4 py-2 border-r">{record.assignedBy}</td>
                  <td className="px-4 py-2 border-r">{record.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {qrStatusRecords.length === 0 && (
            <div className="p-4 text-sm text-gray-500 dark:text-gray-400">No QR status records found.</div>
          )}
        </div>
        {/* Hidden print section */}
        <div ref={printRef} style={{ display: "none" }} />
      </div>
    </ComponentCard>
  );
}