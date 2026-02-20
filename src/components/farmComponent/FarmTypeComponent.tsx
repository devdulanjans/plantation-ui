import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import ComponentCard from "../common/ComponentCard";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import { callApi } from "../../utils/api"; // Adjust path as needed

interface FarmType {
  typeName: string;
  description: string;
  status: string;
}

export default function FarmTypeRegistrationComponent() {
  const [farmTypes, setFarmTypes] = useState<FarmType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [formData, setFormData] = useState<FarmType>({
    typeName: "",
    description: "",
    status: "",
  });

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  // GET: Fetch farm types on mount
  useEffect(() => {
    const fetchFarmTypes = async () => {
      try {
        const response = await callApi<any>("/api/farms", { method: "GET" });
        const farmArray = Array.isArray(response) ? response : [];
        const mappedFarmTypes = farmArray.map((item: any) => ({
          typeName: item.typeName || item.type_name || "",
          description: item.description || "",
          status: item.status || "",
        }));
        setFarmTypes(mappedFarmTypes);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load farm types: " + error,
        });
      }
    };
    fetchFarmTypes();
  }, []);

  // POST: Save new farm type
  const handleAddFarmType = async () => {
    if (!formData.typeName || !formData.status) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill in Type Name and Status",
      });
      return;
    }

    const payload = {
      typeName: formData.typeName,
      description: formData.description,
      status: formData.status,
    };

    try {
      const response = await callApi<typeof payload>("/api/farms", {
        method: "POST",
        body: payload,
      });
      if (response) {
        Swal.fire({
          icon: "success",
          title: "Saved",
          text: "Farm type has been successfully added!",
        });
        setFarmTypes([...farmTypes, payload]);
        setFormData({ typeName: "", description: "", status: "" });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Farm type could not be saved.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save farm type: " + error,
      });
    }
  };

  const filteredTypes = farmTypes.filter((type) => {
    const matchesSearch = type.typeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "" || statusFilter === "all"
        ? true
        : type.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <ComponentCard title="Farm Type Registration">
      {/* Add Farm Type Form */}
      <div className="mb-8 border rounded p-4 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4">Add New Farm Type</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="typeName">Type Name</Label>
            <Input
              id="typeName"
              placeholder="e.g. Fruit Farm"
              value={formData.typeName}
              onChange={(e) => setFormData({ ...formData, typeName: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Optional description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              options={statusOptions}
              placeholder="Select Status"
              onChange={(value) => setFormData({ ...formData, status: value })}
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700"
            onClick={handleAddFarmType}
          >
            Add Farm Type
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
        <div>
          <Label htmlFor="search">Search by Type Name</Label>
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
            placeholder="Filter by Status"
            onChange={(value) => setStatusFilter(value)}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left border border-gray-200 dark:border-gray-700">
          <thead className="bg-gray-100 dark:bg-dark-800">
            <tr className="text-xs font-semibold text-gray-600 uppercase dark:text-gray-300">
              <th className="px-4 py-2 border-r">Type Name</th>
              <th className="px-4 py-2 border-r">Description</th>
              <th className="px-4 py-2 border-r">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-dark-900">
            {filteredTypes.map((type, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                <td className="px-4 py-2 border-r">{type.typeName}</td>
                <td className="px-4 py-2 border-r">{type.description}</td>
                <td className="px-4 py-2 border-r">{type.status}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredTypes.length === 0 && (
          <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
            No farm types found.
          </div>
        )}
      </div>
    </ComponentCard>
  );
}
