import { useEffect, useState } from "react";
import ComponentCard from "../common/ComponentCard";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import Textarea from "../form/input/TextArea";
import DatePicker from "../form/date-picker";
import { callApi } from "../../utils/api";
import Swal from "sweetalert2";

type Harvest = {
  assetCode: string;
  harvestDate: string;
  performedBy: string;
  quantity: string;
  qualityGrade: string;
  remarks: string;
  qrCodes: string[];
};

export default function Harvesting() {
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [formData, setFormData] = useState<Harvest>({
    assetCode: "",
    harvestDate: "",
    performedBy: "",
    quantity: "",
    qualityGrade: "A",
    remarks: "",
    qrCodes: [],
  });

  // GET: Fetch harvest records on mount
  useEffect(() => {
    const fetchHarvests = async () => {
      try {
        const response = await callApi<any>("/api/harvests", { method: "GET" });
        const harvestArray = Array.isArray(response) ? response : [];
        const mappedHarvests = harvestArray.map((item: any) => ({
          assetCode: item.assetCode || item.asset_code || "",
          harvestDate: item.harvestDate || item.harvest_date || "",
          performedBy: item.performedBy || item.performed_by || "",
          quantity: item.quantity || "",
          qualityGrade: item.qualityGrade || item.quality_grade || "",
          qrCodes: item.qrCodes || item.qr_codes || [],
          remarks: item.remarks || "",
        }));
        setHarvests(mappedHarvests);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load harvest records: " + error,
        });
      }
    };
    fetchHarvests();
  }, []);

  const assetOptions = [
    { value: "TREE-001", label: "Mango Tree - TREE-001" },
    { value: "TREE-002", label: "Jackfruit Tree - TREE-002" },
  ];

  const gradeOptions = [
    { value: "A", label: "A (Excellent)" },
    { value: "B", label: "B (Good)" },
    { value: "C", label: "C (Average)" },
  ];

  const generateQRCodes = (quantity: number) => {
    const qrList = [];
    for (let i = 0; i < quantity; i++) {
      const id = `QR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      qrList.push(id);
    }
    return qrList;
  };

  // POST: Save new harvest record
  const handleHarvest = async () => {
    const { assetCode, harvestDate, performedBy, quantity, qualityGrade, remarks } = formData;
    if (!assetCode || !harvestDate || !performedBy || !quantity || !qualityGrade) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill all required fields",
      });
      return;
    }

    const newQrCodes = generateQRCodes(parseInt(quantity));
    const payload = {
      assetCode,
      harvestDate,
      performedBy,
      quantity,
      qualityGrade,
      qrCodes: newQrCodes,
      remarks,
    };

    try {
      const response = await callApi<typeof payload>("/api/harvests", {
        method: "POST",
        body: payload,
      });
      if (response) {
        Swal.fire({
          icon: "success",
          title: "Harvest Saved",
          text: "Harvest record has been successfully saved!",
        });
        setHarvests([...harvests, payload]);
        setFormData({
          assetCode: "",
          harvestDate: "",
          performedBy: "",
          quantity: "",
          qualityGrade: "A",
          remarks: "",
          qrCodes: [],
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Harvest record could not be saved.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save harvest record: " + error,
      });
    }
  };

  return (
    <ComponentCard title="Harvesting">
      {/* Harvesting Form */}
      <div className="border rounded p-4 mb-6 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4">New Harvest Entry</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Asset Code (Tree)</Label>
            <Select
              options={assetOptions}
              placeholder="Select tree"
              onChange={(value) => setFormData({ ...formData, assetCode: value })}
            />
          </div>
          <div>
            <Label>Harvest Date</Label>
            <DatePicker
              id="harvest-date"
              defaultDate={formData.harvestDate}
              onChange={(value: Date | Date[] | string) => {
                // If value is an array, take the first date and convert to string
                let dateStr = "";
                if (Array.isArray(value)) {
                  dateStr = value[0] && value[0] instanceof Date ? value[0].toISOString().slice(0, 10) : "";
                } else if (typeof value === "object" && value instanceof Date) {
                  dateStr = value.toISOString().slice(0, 10);
                } else if (typeof value === "string") {
                  dateStr = value;
                }
                setFormData({ ...formData, harvestDate: dateStr });
              }}
              placeholder="Select Date"
            />
          </div>
          <div>
            <Label>Performed By</Label>
            <Input
              placeholder="e.g. Worker C"
              value={formData.performedBy}
              onChange={(e) => setFormData({ ...formData, performedBy: e.target.value })}
            />
          </div>
          <div>
            <Label>Quantity (Units)</Label>
            <Input
              type="number"
              placeholder="e.g. 20"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            />
          </div>
          <div>
            <Label>Quality Grade</Label>
            <Select
              options={gradeOptions}
              onChange={(value) => setFormData({ ...formData, qualityGrade: value })}
              defaultValue={formData.qualityGrade}
            />
          </div>
          <div className="md:col-span-3">
            <Label>Remarks (Optional)</Label>
            <Textarea
              placeholder="e.g. Large size fruits, ripe condition"
              value={formData.remarks}
              onChange={(value: string) => setFormData({ ...formData, remarks: value })}
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            onClick={handleHarvest}
          >
            Save Harvest
          </button>
        </div>
      </div>

      {/* Harvested Records Table */}
      <div className="overflow-x-auto mt-6">
        <h3 className="font-semibold mb-2">Harvest Records</h3>
        <table className="min-w-full text-sm text-left border border-gray-200 dark:border-gray-700">
          <thead className="bg-gray-100 dark:bg-dark-800">
            <tr className="text-xs font-semibold text-gray-600 uppercase dark:text-gray-300">
              <th className="px-4 py-2 border-r">Tree Code</th>
              <th className="px-4 py-2 border-r">Date</th>
              <th className="px-4 py-2 border-r">By</th>
              <th className="px-4 py-2 border-r">Qty</th>
              <th className="px-4 py-2 border-r">Grade</th>
              <th className="px-4 py-2 border-r">QR Codes</th>
              <th className="px-4 py-2">Remarks</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-dark-900">
            {harvests.map((harvest, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                <td className="px-4 py-2 border-r">{harvest.assetCode}</td>
                <td className="px-4 py-2 border-r">{harvest.harvestDate}</td>
                <td className="px-4 py-2 border-r">{harvest.performedBy}</td>
                <td className="px-4 py-2 border-r">{harvest.quantity}</td>
                <td className="px-4 py-2 border-r">{harvest.qualityGrade}</td>
                <td className="px-4 py-2 border-r">
                  {Array.isArray(harvest.qrCodes) && (
                    <>
                      {(harvest.qrCodes.length > 5
                        ? (harvest as any)._showAllQRCodes
                        : true
                      )
                        ? harvest.qrCodes.map((code, i) => (
                            <div key={i} className="text-xs">{code}</div>
                          ))
                        : harvest.qrCodes.slice(0, 5).map((code, i) => (
                            <div key={i} className="text-xs">{code}</div>
                          ))}
                      {harvest.qrCodes.length > 5 && (
                        <button
                          className="text-blue-600 underline text-xs mt-1"
                          type="button"
                          onClick={() => {
                            setHarvests(harvests =>
                              harvests.map((h, idx) =>
                                idx === index
                                  ? { ...h, _showAllQRCodes: !(h as any)._showAllQRCodes }
                                  : h
                              )
                            );
                          }}
                        >
                          {(harvest as any)._showAllQRCodes ? "Show less" : `Show ${harvest.qrCodes.length - 5} more`}
                        </button>
                      )}
                    </>
                  )}
                </td>
                <td className="px-4 py-2">{harvest.remarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {harvests.length === 0 && (
          <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
            No harvest entries yet.
          </div>
        )}
      </div>
    </ComponentCard>
  );
}
