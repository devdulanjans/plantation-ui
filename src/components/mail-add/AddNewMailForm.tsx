import { useState } from "react";
import ComponentCard from "../common/ComponentCard";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import DatePicker from "../form/date-picker";
import Textarea from "../form/input/TextArea";
import { EyeIcon, EyeCloseIcon } from "../../icons";

export default function AddNewMailForm() {
  const [showTracking, setShowTracking] = useState(false);

  const departments = [
    { value: "hr", label: "HR Department" },
    { value: "finance", label: "Finance Department" },
    { value: "admin", label: "Admin Department" },
  ];

  const priorities = [
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
  ];

  const mailTypes = [
    { value: "incoming", label: "Incoming" },
    { value: "outgoing", label: "Outgoing" },
    { value: "internal", label: "Internal" },
  ];

  return (
    <ComponentCard title="Add New Mail">
      <div className="space-y-6">

        <div>
          <Label htmlFor="tracking">Tracking Number</Label>
          <div className="relative">
            <Input
              type={showTracking ? "text" : "password"}
              id="tracking"
              placeholder="Enter tracking number"
            />
            <button
              onClick={() => setShowTracking(!showTracking)}
              className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
            >
              {showTracking ? (
                <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
              ) : (
                <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mail Reference */}
        <div>
          <Label htmlFor="refNo">Mail Reference No.</Label>
          <Input type="text" id="refNo" placeholder="REF12345" />
        </div>

        {/* Mail Type */}
        <div>
          <Label>Mail Type</Label>
          <Select
            options={mailTypes}
            placeholder="Select mail type"
            onChange={(value) => console.log("Mail Type selected:", value)}
          />
        </div>

        {/* Subject */}
        <div>
          <Label htmlFor="subject">Subject</Label>
          <Input type="text" id="subject" placeholder="Subject or title" />
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea rows={3} placeholder="Description or note..." />
        </div>

        {/* Mail Date */}
        <div>
          <DatePicker
            id="mailDate"
            label="Mail Date"
            placeholder="Select date"
            onChange={(dateStr) => console.log(dateStr)}
          />
        </div>

        {/* Department */}
        <div>
          <Label>Department</Label>
          <Select
            options={departments}
            placeholder="Select department"
            onChange={(value) => console.log("Department selected:", value)}
          />
        </div>

        {/* Assigned To */}
        <div>
          <Label htmlFor="assignedTo">Assigned To</Label>
          <Input type="text" id="assignedTo" placeholder="User ID or name" />
        </div>

        {/* Priority */}
        <div>
          <Label>Priority</Label>
          <Select
            options={priorities}
            placeholder="Select priority"
            onChange={(value) => console.log("Priority selected:", value)}
          />
        </div>

        {/* Tracking Number (Optional - toggled) */}


        {/* Remarks */}
        <div>
          <Label htmlFor="remarks">Remarks</Label>
          <Textarea rows={2} placeholder="Optional internal remarks" />
        </div>

        {/* File Upload (You can integrate this later with a file input or drag-drop) */}
        <div>
          <Label htmlFor="upload">Attachment</Label>
          <Input type="file" id="upload" />
        </div>

      </div>
    </ComponentCard>
  );
}
