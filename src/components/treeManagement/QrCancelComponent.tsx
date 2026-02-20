import { useState, useEffect } from "react";
import ComponentCard from "../common/ComponentCard";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import TextArea from "../form/input/TextArea";
import DatePicker from "../form/date-picker";
import { callApi } from "../../utils/api";
import Swal from "sweetalert2";

type CancelledQR = {
  status: string;
  assetCode: string;
  qrCode: string;
  cancelReason: string;
  cancelledBy: string;
  cancelDate: string;
};

export default function QrCancelProcess() {
  const [qrList, setQrList] = useState([
    {
      assetCode: "TREE-001",
      qrCode: "a1b2c3d4",
      status: "Active",
      allocationDate: "2025-07-12",
    },
    {
      assetCode: "TREE-002",
      qrCode: "e5f6g7h8",
      status: "Active",
      allocationDate: "2025-07-13",
    },
  ]);

  const [cancelledList, setCancelledList] = useState<CancelledQR[]>([]);
  const [selectedQR, setSelectedQR] = useState("");
  const [cancelForm, setCancelForm] = useState({
    assetCode: "",
    qrCode: "",
    cancelReason: "",
    cancelledBy: "",
    cancelDate: "",
  });

  useEffect(() => {
    const fetchActiveQRs = async () => {
      try {
        const response = await callApi<any>("/api/qr-allocations", { method: "GET" });
        // If response.data is the array
        console.log("/api/qr-allocations response: ", response);
        const qrArray = Array.isArray(response) ? response : [];
        // Map to your dropdown format
        const activeQRs = qrArray.map((qr: any) => ({
          assetCode: qr.id || qr.id || "",
          qrCode: qr.qrCode || qr.qr_code || "",
          status: qr.status || "",
          allocationDate: qr.allocationDate || qr.allocation_date || "",
          }));
        setQrList(activeQRs);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load QR allocations: " + error,
        });
      }
    };
    fetchActiveQRs();
  }, []);

  const handleSelectQR = (qrCode: string) => {
    const found = qrList.find((q) => q.qrCode === qrCode);
    if (found) {
      setSelectedQR(qrCode);
      setCancelForm({
        assetCode: found.assetCode,
        qrCode: found.qrCode,
        cancelReason: "",
        cancelledBy: "",
        cancelDate: "",
      });
    }
  };

  const handleCancelQR = async () => {
    if (!cancelForm.qrCode || !cancelForm.cancelReason || !cancelForm.cancelledBy || !cancelForm.cancelDate) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill all required fields",
      });
      return;
    }

    const payload = {
      cancelledBy: cancelForm.cancelledBy,
      cancelDate: cancelForm.cancelDate,
      cancelReason: cancelForm.cancelReason,
    };

    try {
      const response = await callApi<any>(`/api/qr-allocations/${cancelForm.assetCode}/cancel`, {
        method: "PATCH",
        body: payload,
      });
      if (response) {
        Swal.fire({
          icon: "success",
          title: "QR Cancelled",
          text: "QR has been successfully cancelled!",
        });
        // Remove from QR List
        setQrList(qrList.filter((q) => q.qrCode !== cancelForm.qrCode));
        // Add to cancelled list
        setCancelledList([
          ...cancelledList,
          {
            ...cancelForm,
            status: "Cancelled",
          },
        ]);
        // Clear form
        setSelectedQR("");
        setCancelForm({
          assetCode: "",
          qrCode: "",
          cancelReason: "",
          cancelledBy: "",
          cancelDate: "",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "QR could not be cancelled.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to cancel QR: " + error,
      });
    }
  };

  return (
    <ComponentCard title="QR Cancel Process">
      {/* Select QR to cancel */}
      <div className="mb-6">
        <Label>Select Active QR to Cancel</Label>
        <Select
          options={qrList.map((qr) => ({
            value: qr.qrCode,
            label: `${qr.assetCode} (${qr.qrCode})`,
          }))}
          placeholder="Choose a QR"
          onChange={(value) => handleSelectQR(value)}
        />
      </div>

      {/* Form to cancel */}
      {selectedQR && (
        <div className="border rounded p-4 mb-6 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4">Cancel QR Code</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Asset Code</Label>
              <Input value={cancelForm.assetCode} disabled />
            </div>
            <div>
              <Label>QR Code</Label>
              <Input value={cancelForm.qrCode} disabled />
            </div>
            <div>
              <Label>Cancelled By</Label>
              <Input
                placeholder="e.g. Supervisor A"
                value={cancelForm.cancelledBy}
                onChange={(e) =>
                  setCancelForm({ ...cancelForm, cancelledBy: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Cancel Date</Label>
              <DatePicker
                id="cancel-date"
                defaultDate={cancelForm.cancelDate ? new Date(cancelForm.cancelDate) : undefined}
                onChange={(dates: Date[] | null) =>
                  setCancelForm({
                    ...cancelForm,
                    cancelDate:
                      dates && dates.length > 0
                        ? dates[0].toISOString().slice(0, 10)
                        : "",
                  })
                }
              />
            </div>
            <div className="md:col-span-2">
              <Label>Reason for Cancellation</Label>
              <TextArea
                placeholder="Write reason..."
                value={cancelForm.cancelReason}
                onChange={(value: string) =>
                  setCancelForm({ ...cancelForm, cancelReason: value })
                }
              />
            </div>
          </div>
          <div className="mt-4">
            <button
              className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
              onClick={handleCancelQR}
            >
              Confirm Cancel
            </button>
          </div>
        </div>
      )}

      {/* Cancelled QR Table */}
      <div className="overflow-x-auto mt-6">
        <h3 className="font-semibold mb-2">QR Codes with Status "Cancel"</h3>
        <table className="min-w-full text-sm text-left border border-gray-200 dark:border-gray-700">
          <thead className="bg-gray-100 dark:bg-dark-800">
            <tr className="text-xs font-semibold text-gray-600 uppercase dark:text-gray-300">
              <th className="px-4 py-2 border-r">QR Code</th>
              <th className="px-4 py-2 border-r">Asset Code</th>
              <th className="px-4 py-2 border-r">Allocation Date</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-dark-900">
            {qrList.filter(qr => qr.status === "Cancelled").map((qr, idx) => (
              <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                <td className="px-4 py-2 border-r">{qr.qrCode}</td>
                <td className="px-4 py-2 border-r">{qr.assetCode}</td>
                <td className="px-4 py-2 border-r">{qr.allocationDate}</td>
                <td className="px-4 py-2 text-red-600 font-semibold">{qr.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {qrList.filter(qr => qr.status === "Cancel").length === 0 && (
          <div className="p-4 text-sm text-gray-500 dark:text-gray-400">No cancelled QR codes found.</div>
        )}
      </div>
    </ComponentCard>
  );
}
