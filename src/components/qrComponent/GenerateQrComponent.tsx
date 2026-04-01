import { useState, useRef, useEffect } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
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

export default function GenerateQRCodesComponent() {
  const [inputValue, setInputValue] = useState("");
  const [qrCodes, setQrCodes] = useState<{ code: string; url: string }[]>([]);
  const printRef = useRef<HTMLDivElement>(null);
  const [qrStatusRecords, setQrStatusRecords] = useState<QrStatusRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterDate, setFilterDate] = useState("");
  const [filterQrCode, setFilterQrCode] = useState("");
  const recordsPerPage = 50;

  // Filter records by date and QR code
  const filteredRecords = qrStatusRecords.filter((record) => {
    // Normalize to YYYY-MM-DD for comparison
    const recordDate = record.allocationDate ? record.allocationDate.slice(0, 10) : "";
    const matchesDate = filterDate ? recordDate === filterDate : true;
    const matchesQrCode = filterQrCode ? record.qrCode.toLowerCase().includes(filterQrCode.toLowerCase()) : true;
    return matchesDate && matchesQrCode;
  });

  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  useEffect(() => {
    const fetchStatusRecords = async () => {
      try {
        const response = await callApi<any>("/api/qr-allocations/status/all", { method: "GET" });
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
    fetchStatusRecords();
  }, []);

  const handlePrint = () => {
    if (printRef.current) {
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
      }
    }
  };

  const handleGenerateQRs = async () => {
    const count = parseInt(inputValue);
    if (!count || count < 1) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Number",
        text: "Please enter a valid number greater than 0.",
      });
      return;
    }
    try {
      const generatedQRCodes: { code: string; url: string }[] = [];
      for (let i = 0; i < count; i++) {
        const entityCode = `FRUITE${String(i + 1).padStart(3, "0")}`; // Example: FRUITE001, FRUITE002, ...
        const qrCode = `QR-${Date.now()}-${Math.floor(Math.random() * 100000)}-${i + 1}`;
        const url = await QRCode.toDataURL(qrCode);
        generatedQRCodes.push({ code: qrCode, url });

        // // Save QR code to database
        // const payload = {
        //   code: qrCode,
        //   qrImage: url,
        //   createdAt: new Date().toISOString(),
        // };
        // await callApi<typeof payload>("/api/qr-allocations", {
        //   method: "POST",
        //   body: payload,
        // });

        // Allocate QR code
        const allocationPayload = {
          entityType: "fruite",
          entityCode: entityCode,
          qrCode: qrCode,
          allocationDate: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
          assignedBy: "Farmer John",
          status: "Active",
        };
        await callApi<typeof allocationPayload>("/api/qr-allocations", {
          method: "POST",
          body: allocationPayload,
        });
      }
      setQrCodes(generatedQRCodes);
      Swal.fire({
        icon: "success",
        title: "QR Codes Generated & Allocated",
        html: `<div>Successfully generated and allocated ${count} QR codes.</div>`,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "QR Generation Failed",
        text: "Could not generate QR codes: " + error,
      });
    }
  };

  return (
    <ComponentCard title="Generate QR Codes">
      <div className="mb-8 border rounded p-4 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4">Generate Unique QR Codes</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="qrInput">Enter Number of QR Codes</Label>
            <Input
              id="qrInput"
              type="number"
              min="1"
              placeholder="Enter a number (e.g. 10)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button
              className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
              onClick={handleGenerateQRs}
            >
              Generate QR Codes
            </button>
          </div>
        </div>
        {qrCodes.length > 0 && (
          <>
            <button
              className="px-4 py-2 text-white bg-gray-800 rounded hover:bg-gray-900 mt-6 mb-4"
              onClick={handlePrint}
            >
              Print QR Codes
            </button>
            <div ref={printRef}>
              <div className="qr-grid">
                {qrCodes.map((qr, idx) => (
                  <div key={idx} className="qr-item">
                    <img src={qr.url} alt={`QR ${qr.code}`} />
                    <div className="qr-code-label">{qr.code}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="mt-12">
        <h3 className="font-semibold mb-2">All QR Status Records</h3>
        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div>
            <Label htmlFor="filterDate">Filter by Date</Label>
            <input
              id="filterDate"
              type="date"
              className="border rounded px-2 py-1 w-full"
              value={filterDate}
              onChange={e => { setFilterDate(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div>
            <Label htmlFor="filterQrCode">Filter by QR Code</Label>
            <input
              id="filterQrCode"
              type="text"
              className="border rounded px-2 py-1 w-full"
              placeholder="Enter QR Code"
              value={filterQrCode}
              onChange={e => { setFilterQrCode(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>
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
              {paginatedRecords.map((record, idx) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                  <td className="px-4 py-2 border-r">{record.assetCode}</td>
                  <td className="px-4 py-2 border-r">{record.qrCode}</td>
                  <td className="px-4 py-2 border-r">{record.allocationDate}</td>
                  <td className="px-4 py-2 border-r">{record.assignedBy}</td>
                  <td className="px-4 py-2 border-r">{record.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredRecords.length === 0 && (
            <div className="p-4 text-sm text-gray-500 dark:text-gray-400">No QR status records found.</div>
          )}
        </div>
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-4 gap-2">
            <button
              className="px-3 py-1 rounded border bg-gray-100 dark:bg-dark-700 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`px-3 py-1 rounded border ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-dark-700'}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="px-3 py-1 rounded border bg-gray-100 dark:bg-dark-700 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </ComponentCard>
    
  );
}