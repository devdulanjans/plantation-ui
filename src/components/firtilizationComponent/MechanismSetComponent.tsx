import { useState, useEffect } from "react";
import ComponentCard from "../common/ComponentCard";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import Textarea from "../form/input/TextArea";
import { callApi } from "../../utils/api";
import Swal from "sweetalert2";


type Mechanism = {
  name: string;
  type: string;
  farmType: string;
  crops: string;
  equipment: string;
  notes: string;
};

export default function MechanismSetComponent() {
  const [mechanisms, setMechanisms] = useState<Mechanism[]>([]);
  const [formData, setFormData] = useState<Mechanism>({
    name: "",
    type: "",
    farmType: "",
    crops: "",
    equipment: "",
    notes: "",
  });

  const applicationTypes = [
    { value: "Manual", label: "Manual" },
    { value: "Automatic", label: "Automatic" },
    { value: "Mixed", label: "Mixed" },
  ];

  const farmTypes = [
    { value: "Fruit", label: "Fruit" },
    { value: "Seed", label: "Seed" },
    { value: "Meat", label: "Meat" },
  ];

  const handleAdd = async () => {
    if (!formData.name || !formData.type || !formData.farmType) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill all required fields.",
      });
      return;
    }

    const payload = {
      name: formData.name,
      type: formData.type,
      farmType: formData.farmType,
      crops: formData.crops,
      equipment: formData.equipment,
      notes: formData.notes,
    };

    try {
      const response = await callApi<typeof payload>("/api/fertilizer-mechanisms", {
        method: "POST",
        body: payload,
      });
      if (response) {
        Swal.fire({
          icon: "success",
          title: "Saved",
          text: "Mechanism has been successfully registered!",
        });
        setMechanisms([...mechanisms, payload]);
        setFormData({
          name: "",
          type: "",
          farmType: "",
          crops: "",
          equipment: "",
          notes: "",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Mechanism could not be saved.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save mechanism: " + error,
      });
    }
  };

  useEffect(() => {
    const fetchMechanisms = async () => {
      try {
        const response = await callApi<any>("/api/fertilizer-mechanisms", { method: "GET" });
        const mechArray = Array.isArray(response.content) ? response.content : [];
        const mappedMechanisms = mechArray.map((item: any) => ({
          name: item.name || "",
          type: item.type || "",
          farmType: item.farmType || item.farm_type || "",
          crops: item.crops || "",
          equipment: item.equipment || "",
          notes: item.notes || "",
        }));
        setMechanisms(mappedMechanisms);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load mechanisms: " + error,
        });
      }
    };
    fetchMechanisms();
  }, []);

  return (
    <ComponentCard title="Fertilizer Mechanism Set">
      {/* Form */}
      <div className="border rounded p-4 mb-6 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4">Register New Mechanism</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Mechanism Name</Label>
            <Input
              placeholder="e.g. Sprayer, Drip Irrigation"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <Label>Application Type</Label>
            <Select
              options={applicationTypes}
              placeholder="Select Type"
              onChange={(value) => setFormData({ ...formData, type: value })}
            />
          </div>
          <div>
            <Label>Farm Type</Label>
            <Select
              options={farmTypes}
              placeholder="Select Farm Type"
              onChange={(value) => setFormData({ ...formData, farmType: value })}
            />
          </div>
          <div>
            <Label>Compatible Crops</Label>
            <Input
              placeholder="e.g. Mango, Banana"
              value={formData.crops}
              onChange={(e) => setFormData({ ...formData, crops: e.target.value })}
            />
          </div>
          <div>
            <Label>Equipment Name</Label>
            <Input
              placeholder="e.g. SprayPump 3000"
              value={formData.equipment}
              onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
            />
          </div>
          <div className="md:col-span-3">
            <Label>Notes / Description</Label>
            <Textarea
              placeholder="Any special instructions or description"
              value={formData.notes}
              onChange={(value: string) => setFormData({ ...formData, notes: value })}
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleAdd}
          >
            Save Mechanism
          </button>
        </div>
      </div>

      {/* Mechanism Table */}
      <div className="overflow-x-auto mt-6">
        <h3 className="font-semibold mb-2">Registered Mechanisms</h3>
        <table className="min-w-full text-sm text-left border border-gray-200 dark:border-gray-700">
          <thead className="bg-gray-100 dark:bg-dark-800">
            <tr className="text-xs font-semibold text-gray-600 uppercase dark:text-gray-300">
              <th className="px-4 py-2 border-r">Name</th>
              <th className="px-4 py-2 border-r">Type</th>
              <th className="px-4 py-2 border-r">Farm Type</th>
              <th className="px-4 py-2 border-r">Crops</th>
              <th className="px-4 py-2 border-r">Equipment</th>
              <th className="px-4 py-2">Notes</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-dark-900">
            {mechanisms.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                <td className="px-4 py-2 border-r">{item.name}</td>
                <td className="px-4 py-2 border-r">{item.type}</td>
                <td className="px-4 py-2 border-r">{item.farmType}</td>
                <td className="px-4 py-2 border-r">{item.crops}</td>
                <td className="px-4 py-2 border-r">{item.equipment}</td>
                <td className="px-4 py-2">{item.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {mechanisms.length === 0 && (
          <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
            No mechanisms registered.
          </div>
        )}
      </div>
    </ComponentCard>
  );
}
