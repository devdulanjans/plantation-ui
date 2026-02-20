import { useState } from "react";
import ComponentCard from "../common/ComponentCard";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Select from "../form/Select";

export default function FarmTypeRegistration() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [farmTypes, setFarmTypes] = useState([]);

  const [farmForm, setFarmForm] = useState({
    typeName: "",
    description: "",
    status: "",
  });

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const filteredTypes = farmTypes.filter((item) => {
    const matchesSearch = item.typeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "" || statusFilter === "all"
        ? true
        : item.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const handleAddFarmType = () => {
    if (!farmForm.typeName || !farmForm.status) {
      alert("Please fill in required fields.");
      return;
    }

    setFarmTypes((prev) => [...prev, farmForm]);
    setFarmForm({ typeName: "", description: "", status: "" });
  };

  return (
    <ComponentCard title="Farm Type Registration">
      {/* Form Section */}
      <div className="mb-8 border rounded p-4 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4">Add New Farm Type</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="typeName">Type Name</Label>
            <Input
              id="typeName"
              placeholder="e.g. Fruit Farm"
              value={farmForm.typeName}
              onChange={(e) =>
                setFarmForm({ ...farmForm, typeName: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Optional notes"
              value={farmForm.description}
              onChange={(e) =>
                setFarmForm({ ...farmForm, description: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              options={statusOptions}
              placeholder="Select Status"
              onChange={(value) => setFarmForm({ ...farmForm, status: value })}
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
            placeholder="Filter by status"
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
