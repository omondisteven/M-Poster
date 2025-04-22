import { useState, useRef } from "react";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";

interface QCard {
  name: string;
  title?: string;
  email?: string;
  phone?: string;
  website?: string;
  comment?: string;
  address?: string;
  whatsappnumber?: string;
}

const defaultFields = [
  { id: "name", label: "Name", placeholder: "Jaskier", required: true },
  { id: "title", label: "Title", placeholder: "Singer, Poet, Lute Player" },
  { id: "email", label: "Email", placeholder: "info@balladsfromjaskier.com" },
  { id: "phone", label: "Phone", placeholder: "+000 000" },
  { id: "website", label: "Website", placeholder: "https://thelute.com" },
  { id: "comment", label: "Comment", placeholder: "Your comment..." },
  { id: "address", label: "Address", placeholder: "10 Lute Street, 012" },
  { id: "whatsappnumber", label: "WhatsApp No.", placeholder: "Start with country code" },
];

export default function BusinessProfile() {
  const [fields, setFields] = useState<typeof defaultFields>([...defaultFields]);
  const [activeFields, setActiveFields] = useState<typeof defaultFields>([]);
  const [formData, setFormData] = useState<QCard | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>({});

  const activateField = (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (field) {
      setActiveFields([...activeFields, field]);
      setFields(fields.filter(f => f.id !== fieldId));
      setTimeout(() => inputRefs.current[fieldId]?.focus(), 0);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  
    const data: Partial<QCard> = {};
  
    activeFields.forEach(field => {
      const val = inputRefs.current[field.id]?.value;
      if (val) {
        data[field.id as keyof QCard] = val;
      }
    });
  
    // Validate that 'name' is present (required field)
    if (!data.name || data.name.trim() === "") {
      alert("Name is required.");
      return;
    }
  
    setFormData(data as QCard);
  };
  

  return (
    <div className="p-4">
      {!formData ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            {activeFields.map(field => (
              <div key={field.id} className="flex flex-col">
                <label htmlFor={field.id} className={`font-medium ${field.required ? "text-red-600" : ""}`}>
                  {field.label}{field.required && " *"}
                </label>
                {field.id === "comment" ? (
                  <textarea
                    id={field.id}
                    ref={el => {
                      inputRefs.current[field.id] = el;
                    }}
                    placeholder={field.placeholder}
                    className="p-2 border rounded"
                    required={field.required}
                  />
                ) : (
                  <input
                    id={field.id}
                    ref={el => {
                      inputRefs.current[field.id] = el;
                    }}
                    type="text"
                    placeholder={field.placeholder}
                    className="p-2 border rounded"
                    required={field.required}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {fields.map(field => (
              <button
                type="button"
                key={field.id}
                onClick={() => activateField(field.id)}
                className="text-sm border px-2 py-1 rounded hover:border-red-500"
              >
                + {field.label}
              </button>
            ))}
          </div>

          <Button type="submit" className="mt-4">Create</Button>
        </form>
      ) : (
        <div className="space-y-4 p-4 border border-gray-300 rounded">
          <QRCode value={JSON.stringify(formData)} size={128} />
          <h1 className="text-2xl font-bold">{formData.name}</h1>
          {formData.title && <h2 className="text-lg text-gray-600">{formData.title}</h2>}
          <div className="grid gap-2 text-sm">
            {formData.phone && <div><strong>Phone:</strong> {formData.phone}</div>}
            {formData.email && <div><strong>Email:</strong> {formData.email}</div>}
            {formData.website && <div><strong>Website:</strong> {formData.website}</div>}
            {formData.address && <div><strong>Address:</strong> {formData.address}</div>}
            {formData.whatsappnumber && <div><strong>WhatsApp:</strong> {formData.whatsappnumber}</div>}
            {formData.comment && <div><strong>Comment:</strong> {formData.comment}</div>}
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigator.clipboard.writeText(JSON.stringify(formData))}>Copy</Button>
            <Button onClick={() => setFormData(null)} variant="outline">Edit</Button>
          </div>
        </div>
      )}
    </div>
  );
}
