import { useState, useEffect, useRef } from "react";
import ComponentCard from "../common/ComponentCard";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import DatePicker from "../form/date-picker";
import { callApi } from "../../utils/api"; // Adjust path as needed
import Swal from "sweetalert2"; // For alerts
import QRCode from "qrcode"; // Install with: npm install qrcode

type Tree = {
  treeCode: string;
  treeType: string;
  row: string;
  location: string;
  plantingDate: string;
  healthStatus: string;
  status: string;
  notes: string;
};

export default function TreeManagement() {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const today = new Date();
  const formattedToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const [treeForm, setTreeForm] = useState({
    treeCode: "",
    treeType: "",
    row: "",
    location: "",
    plantingDate: formattedToday, // <-- Set to current date
    healthStatus: "",
    status: "",
    notes: "",
  });

  const [rowOptions, setRowOptions] = useState<{ value: string; label: string }[]>([]);
  const [locationOptions, setLocationOptions] = useState<{ value: string; label: string }[]>([]);

  const healthStatusOptions = [
    { value: "healthy", label: "Healthy" },
    { value: "diseased", label: "Diseased" },
    { value: "recovering", label: "Recovering" },
    { value: "dead", label: "Dead" },
  ];
  
  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "removed", label: "Removed" },
  ];

  const filteredTrees = trees.filter((tree: Tree) => {
    const matchesSearch = tree.treeCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "" || statusFilter === "all"
        ? true
        : tree.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Fetch trees from API on mount
  useEffect(() => {
    const fetchTrees = async () => {
      try {
        const response = await callApi<any>("/api/tree", { method: "GET" });
        // If response.data is the array
        const treeArray = Array.isArray(response.data) ? response.data : [];
        const mappedTrees = treeArray.map((item: any) => ({
          treeCode: item.treeCode || item.tree_code || "",
          treeType: item.treeType || item.tree_type || "",
          row: item.row || item.row_id || "",
          location: item.location || "",
          plantingDate: item.plantingDate || item.planting_date || "",
          healthStatus: item.healthStatus || item.health_status || "",
          status: item.status || "",
          notes: item.notes || "",
        }));
        setTrees(mappedTrees);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load trees: " + error,
        });
      }
    };
    fetchTrees();
  }, []);

  // Fetch rows from API on mount
  useEffect(() => {
    const fetchRows = async () => {
      try {
        const response = await callApi<any>("/api/rows", { method: "GET" });
        const rowArray = Array.isArray(response) ? response : [];
        console.log("rowArray data: ", rowArray);
        const mappedRowOptions = rowArray.map((item: any) => ({
          value: item.id || item.row_id || item.value || "",
          label: item.rowName || item.row_name || item.label || item.value || "",
        }));
        setRowOptions(mappedRowOptions);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load rows: " + error,
        });
      }
    };
    fetchRows();
  }, []);

  // Fetch locations from API on mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await callApi<any>("/api/locations", { method: "GET" });
        const locationArray = Array.isArray(response) ? response : [];
        const mappedLocationOptions = locationArray.map((item: any) => ({
          value: item.locationName || item.location_name || item.value || "",
          label: item.locationName || item.location_name || item.label || item.value || "",
        }));
        setLocationOptions(mappedLocationOptions);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load locations: " + error,
        });
      }
    };
    fetchLocations();
  }, []);

  // Add tree (POST)
  const handleAddTree = async () => {
    if (!treeForm.treeCode || !treeForm.treeType || !treeForm.location || !treeForm.row || !treeForm.status) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill required fields",
      });
      return;
    }

    const payload = {
      treeCode: treeForm.treeCode,
      treeType: treeForm.treeType,
      row: treeForm.row ? treeForm.row : "", // Ensure row is always a string
      location: treeForm.location,
      plantingDate: treeForm.plantingDate && treeForm.plantingDate !== "" ? treeForm.plantingDate : "" , // Always a string
      healthStatus: treeForm.healthStatus,
      status: treeForm.status,
      notes: treeForm.notes,
    };

    try {
      const response = await callApi<typeof payload>("/api/tree", {
        method: "POST",
        body: payload,
      });
      if (response) {
        Swal.fire({
          icon: "success",
          title: "Tree Added",
          text: "Tree has been successfully registered!",
        });
        setTrees([...trees, payload]);
        setTreeForm({
          treeCode: "",
          treeType: "",
          row: "",
          location: "",
          plantingDate: "",
          healthStatus: "",
          status: "",
          notes: "",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Tree could not be added.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to add tree: " + error,
      });
    }
  };

  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  // Generate QR code for the current tree code
  const handleGenerateQR = async () => {
    if (!treeForm.treeCode) {
      Swal.fire({
        icon: "warning",
        title: "Missing Tree Code",
        text: "Please enter a Tree Code before generating QR.",
      });
      return;
    }
    try {
      // Use tree code + current timestamp for uniqueness
      const uniqueCode = `${treeForm.treeCode}`;
      const url = await QRCode.toDataURL(uniqueCode);
      setQrCodeUrl(url);
      console.log(qrCodeUrl);
      Swal.fire({
        icon: "success",
        title: "QR Generated",
        html: `<div style="display:flex;flex-direction:column;align-items:center;">
                 <img src="${url}" alt="QR Code" style="margin-bottom:8px;" />
                 <div><b>${uniqueCode}</b></div>
               </div>`,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "QR Generation Failed",
        text: "Could not generate QR code: " + error,
      });
    }
  };

  const qrPrintRef = useRef<HTMLDivElement>(null);

  // Generate QR code for each tree
  const getTreeQRCodes = async () => {
    const codes = await Promise.all(
      trees.map(async (tree) => ({
        treeCode: tree.treeCode,
        qrUrl: await QRCode.toDataURL(tree.treeCode),
      }))
    );
    return codes;
  };

  const handlePrintQRCodes = async () => {
    const qrCodes = await getTreeQRCodes();
    if (qrPrintRef.current) {
      qrPrintRef.current.innerHTML = qrCodes
        .map(
          (qr) =>
            `<div style="display:inline-block;margin:12px;text-align:center;">
              <img src="${qr.qrUrl}" alt="QR for ${qr.treeCode}" style="width:120px;height:120px;" />
              <div style="margin-top:8px;font-size:14px;">${qr.treeCode}</div>
            </div>`
        )
        .join("");
      // Print only the QR section
      const printContents = qrPrintRef.current.innerHTML;
      const win = window.open("", "Print QR Codes", "width=800,height=600");
      if (win) {
        win.document.write(`
          <html>
            <head>
              <title>Print QR Codes</title>
            </head>
            <body style="text-align:center;">
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

  const [suggestedTreeCode, setSuggestedTreeCode] = useState("");

  useEffect(() => {
    const fetchLastTreeCode = async () => {
      try {
        const response = await callApi<any>("/api/tree/last", { method: "GET" });
        const lastCode = response?.data.tree_code || "MNG-000";
        // Extract number and increment
        const match = lastCode.match(/([A-Z]+)-(\d+)/);
        let nextCode = "MNG-001";
        if (match) {
          const prefix = match[1];
          const num = String(parseInt(match[2], 10) + 1).padStart(3, "0");
          nextCode = `${prefix}-${num}`;
        }
        setSuggestedTreeCode(nextCode);
      } catch (error) {
        setSuggestedTreeCode("MNG-001");
      }
    };
    fetchLastTreeCode();
  }, []);

  return (
    <ComponentCard title="Tree Management">
      {/* Form Section */}
      <div className="mb-8 border rounded p-4 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4">Register New Tree</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="treeCode">Tree Code</Label>
            <Input
              id="treeCode"
              placeholder="e.g. MNG-001"
              value={treeForm.treeCode}
              onChange={(e) => setTreeForm({ ...treeForm, treeCode: e.target.value })}
            />
            {suggestedTreeCode && (
              <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                Suggestion: <span className="font-mono">{suggestedTreeCode}</span>
                <button
                  className="px-2 py-1 bg-blue-100 text-blue-700 rounded"
                  type="button"
                  onClick={() => setTreeForm({ ...treeForm, treeCode: suggestedTreeCode })}
                >
                  Use
                </button>
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="treeType">Tree Type</Label>
            <Input
              id="treeType"
              placeholder="e.g. Mango"
              value={treeForm.treeType}
              onChange={(e) => setTreeForm({ ...treeForm, treeType: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="row">Row</Label>
            <Select
              options={rowOptions}
              defaultValue={treeForm.row}
              placeholder="Select Row"
              onChange={(value) => {
                console.log("Selected Row:", rowOptions); // Debug print
                setTreeForm({ ...treeForm, row: value });
              }}
            />
            {/* <Select
              options={rowOptions}
              defaultValue={treeForm.row} // <-- Add this line
              placeholder="Select Row"
              onChange={(value) => setTreeForm({ ...treeForm, row: value })}
            /> */}
            
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Select
              options={locationOptions}
              placeholder="Select Location"
              onChange={(value) => setTreeForm({ ...treeForm, location: value })}
            />
          </div>
          <div>
            <Label htmlFor="plantingDate">Planting Date</Label>
            <DatePicker
              id="plantingDate"
              defaultDate={treeForm.plantingDate}
              onChange={(value) => {
                // If value is an array (range picker), take the first date
                const date = Array.isArray(value) ? value[0] : value;
                setTreeForm({
                  ...treeForm,
                  plantingDate: date
                    ? date instanceof Date
                      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
                      : date
                    : "",
                });
              }}
              placeholder="Select Date"
            />
          </div>
          <div>
            <Label htmlFor="healthStatus">Health Status</Label>
            <Select
              options={healthStatusOptions}
              placeholder="Select Health"
              onChange={(value) => setTreeForm({ ...treeForm, healthStatus: value })}
            />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              options={statusOptions}
              placeholder="Select Status"
              onChange={(value) => setTreeForm({ ...treeForm, status: value })}
            />
          </div>
          <div className="md:col-span-3">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              placeholder="Optional comments"
              value={treeForm.notes}
              onChange={(e) => setTreeForm({ ...treeForm, notes: e.target.value })}
            />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700"
            onClick={handleAddTree}
          >
            Add Tree
          </button>
          <button
            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
            onClick={handleGenerateQR}
          >
            Generate QR
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
        <div>
          <Label htmlFor="search">Search by Tree Code</Label>
          <Input
            id="search"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <Label>Status</Label>
          <Select
            options={[{ value: "all", label: "All Statuses" }, ...statusOptions]}
            placeholder="Filter by status"
            onChange={(value) => setStatusFilter(value)}
          />
        </div>
      </div>

      {/* Tree Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left border border-gray-200 dark:border-gray-700">
          <thead className="bg-gray-100 dark:bg-dark-800">
            <tr className="text-xs font-semibold text-gray-600 uppercase dark:text-gray-300">
              <th className="px-4 py-2 border-r">Tree Code</th>
              <th className="px-4 py-2 border-r">Type</th>
              <th className="px-4 py-2 border-r">Row</th>
              <th className="px-4 py-2 border-r">Location</th>
              <th className="px-4 py-2 border-r">Planting Date</th>
              <th className="px-4 py-2 border-r">Health</th>
              <th className="px-4 py-2 border-r">Status</th>
              <th className="px-4 py-2 border-r">Notes</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-dark-900">
            {filteredTrees.map((tree, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                <td className="px-4 py-2 border-r">{tree.treeCode}</td>
                <td className="px-4 py-2 border-r">{tree.treeType}</td>
                <td className="px-4 py-2 border-r">{tree.row}</td>
                <td className="px-4 py-2 border-r">{tree.location}</td>
                <td className="px-4 py-2 border-r">{tree.plantingDate}</td>
                <td className="px-4 py-2 border-r">{tree.healthStatus}</td>
                <td className="px-4 py-2 border-r">{tree.status}</td>
                <td className="px-4 py-2 border-r">{tree.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredTrees.length === 0 && (
          <div className="p-4 text-sm text-gray-500 dark:text-gray-400">No trees found.</div>
        )}
        <button
          className="px-4 py-2 text-white bg-gray-800 rounded hover:bg-gray-900 mt-4"
          onClick={() => window.print()}
        >
          Print
        </button>
        {/* ...existing form and table... */}
      <button
        className="px-4 py-2 text-white bg-gray-800 rounded hover:bg-gray-900 mt-4"
        onClick={handlePrintQRCodes}
      >
        Print All Tree QR Codes
      </button>
      {/* Hidden QR print section */}
      <div ref={qrPrintRef} style={{ display: "none" }} />
      </div>
    </ComponentCard>
  );
}
