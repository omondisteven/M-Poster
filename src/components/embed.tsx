import { useRef, useState, useEffect } from "react";
import templates from "@/data/templates.json";

export function EmbedUI() {
  const posterRef = useRef<HTMLDivElement>(null);
  const [selectedTemplate] = useState(templates[0]);
  const [searchParams, setSearchParams] = useState({
    phone: "0712 345 678",
    name: "JOHN DOE",
    showName: false,
    title: "SEND MONEY",
    color: "#16a34a",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearchParams({
      phone: params.get("phone") ?? "0712 345 678",
      name: params.get("name") ?? "JOHN DOE",
      showName: params.get("showName") === "true",
      title: params.get("title") ?? "SEND MONEY",
      color: params.get("color") ?? "#16a34a",
    });
  }, []);

  // Format phone number if needed
  const formatPhoneNumber = (value: string): string => {
    const numbers = value.replace(/\D/g, "");
    const match = numbers.match(/^(\d{4})(\d{3})(\d{3})$/);
    if (match) {
      return `${match[1]} ${match[2]} ${match[3]}`;
    }
    return value;
  };

  const formattedPhoneNumber = formatPhoneNumber(searchParams.phone);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-lg">
        <div
          id="poster"
          ref={posterRef}
          className="grid bg-white w-full rounded-lg shadow-lg overflow-hidden border-8 border-gray-800"
          style={{
            gridTemplateRows: searchParams.showName ? "1fr 1fr 1fr" : "1fr 1fr",
            aspectRatio: `${selectedTemplate.size.width} / ${selectedTemplate.size.height}`,
            maxHeight: "400px",
          }}
        >
          {/* Title */}
          <div
            className="flex items-center justify-center px-4 sm:px-6"
            style={{ backgroundColor: searchParams.color }}
          >
            <h2 className="text-2xl sm:text-2xl md:text-2xl lg:text-4xl leading-tight select-none font-bold text-white text-center">
              {searchParams.title}
            </h2>
          </div>

          {/* Phone Number Display */}
          <div
            className="bg-white flex items-center justify-center px-4 sm:px-6"
            style={{
              borderTop: "8px solid #1a2335",
              borderBottom: searchParams.showName
                ? "8px solid #1a2335"
                : "none",
            }}
          >
            <div className="w-full text-2xl sm:text-2xl md:text-2xl lg:text-4xl leading-tight font-bold text-center">
              {formattedPhoneNumber}
            </div>
          </div>

          {/* Name Display - conditional rendering */}
          {searchParams.showName && (
            <div
              className="flex items-center justify-center px-4 sm:px-6"
              style={{ backgroundColor: searchParams.color }}
            >
              <div className="w-full text-2xl sm:text-2xl md:text-2xl lg:text-4xl leading-tight font-bold text-white text-center">
                {searchParams.name}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
