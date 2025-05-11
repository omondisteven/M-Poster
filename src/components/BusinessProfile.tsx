//src/components/BusinessProfile.tsx
import { useState, useRef, useEffect } from "react";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import { toPng } from "html-to-image";
import { saveAs } from "file-saver";
import {
  Mail, Phone, Globe, MapPin, Share2, Download, Copy, 
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa"; // Font Awesome WhatsApp icon
import { useAppContext } from "@/context/AppContext";

interface QCard {
  name: string;
  title?: string;
  email?: string;
  phone?: string;
  website?: string;
  comment?: string;
  address?: string;
  whatsappnumber?: string;
  promo1?: string;
  promo2?: string;
}

const defaultFields = [
  { id: "name", label: "Name", placeholder: "Jaskier", required: true },
  { id: "title", label: "Title", placeholder: "Singer, Poet, Lute Player" },
  { id: "email", label: "Email", placeholder: "info@balladsfromjaskier.com" },
  { id: "phone", label: "Phone", placeholder: "0722123456" },
  { id: "website", label: "Website", placeholder: "https://thelute.com" },
  { id: "comment", label: "Business Description", placeholder: "Description of the Business Card..." },
  { id: "address", label: "Address", placeholder: "10 Lute Street, 012" },
  { id: "whatsappnumber", label: "WhatsApp No.", placeholder: "0722123456" },
  { id: "promo1", label: "Promotion text 1", placeholder: "Promotion or Offer Details..." },
  { id: "promo2", label: "Promotion text 2", placeholder: "Additional Promotion Info..." },
];

const MAX_SUGGESTIONS = 5;

function getRecentEntries(fieldId: string): string[] {
  const raw = localStorage.getItem(`recent_${fieldId}`);
  return raw ? JSON.parse(raw) : [];
}

function saveRecentEntry(fieldId: string, value: string) {
  if (!value.trim()) return;
  const existing = getRecentEntries(fieldId);
  const updated = [value, ...existing.filter(v => v !== value)].slice(0, MAX_SUGGESTIONS);
  localStorage.setItem(`recent_${fieldId}`, JSON.stringify(updated));
}

const LOCAL_STORAGE_KEY = 'businessProfileData';
export default function BusinessProfile() {
  const [activeFields, setActiveFields] = useState<typeof defaultFields>(() => {
    // Load active fields from localStorage if available
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    return savedData ? JSON.parse(savedData).activeFields || [{ ...defaultFields[0] }] : [{ ...defaultFields[0] }];
  });
  const [formData, setFormData] = useState<QCard | null>(() => {
    // Load form data from localStorage if available
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    return savedData ? JSON.parse(savedData).formData || null : null;
  });
  const inputRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>({});
  const qrSectionRef = useRef<HTMLDivElement>(null);
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const { setData } = useAppContext();

  const isActive = (fieldId: string) => activeFields.some(f => f.id === fieldId);

  useEffect(() => {
    if (formData || activeFields) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
        formData,
        activeFields
      }));
    }
  }, [formData, activeFields]);

  // Add this function to reset the form
  const resetForm = () => {
    setFormData(null);
    setActiveFields([{ ...defaultFields[0] }]); // Always reset to just the name field
    // Clear input values
    Object.values(inputRefs.current).forEach(ref => {
      if (ref) ref.value = '';
    });
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  const toggleField = (fieldId: string) => {
    const field = defaultFields.find(f => f.id === fieldId);
    if (!field) return;
    
    // Prevent removing the 'name' field
    if (fieldId === 'name') return;
    
    if (isActive(fieldId)) {
      setActiveFields(activeFields.filter(f => f.id !== fieldId));
    } else {
      setActiveFields([...activeFields, field]);
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
        saveRecentEntry(field.id, val);        
      }
    });
    if (!data.name || data.name.trim() === "") {
      alert("Name is required.");
      return;
    }
    setFormData(data as QCard);
    
    // Update the context with business profile data
    setData({
      businessName: data.name || "",
      businessTitle: data.title || "",
      businessEmail: data.email || "",
      businessPhone: data.phone || "",
      businessWebsite: data.website || "",
      businessComment: data.comment || "",
      businessAddress: data.address || "",
      businessWhatsapp: data.whatsappnumber || "",
      businessPromo1: data.promo1 || "",
      businessPromo2: data.promo2 || "",

    });
  };

  useEffect(() => {
    if (formData && isMobile && qrSectionRef.current) {
      // Scroll to the QR code section with smooth behavior
      qrSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [formData, isMobile]);

  const qrRef = useRef<HTMLDivElement | null>(null);

  const downloadQR = () => {
    if (!qrRef.current) {
      console.error("QR ref not found");
      return;
    }
    if (!formData) {
      console.error("No form data");
      return;
    }
  
    toPng(qrRef.current, {
      quality: 1,
      backgroundColor: '#ffffff',
      cacheBust: true
    })
      .then((dataUrl) => {
        saveAs(dataUrl, `${formData.name || "qr"}.png`);
      })
      .catch((err) => {
        console.error("Error generating QR image:", err);
        alert("Failed to download QR code. Please try again.");
      });
  };

  const copyLink = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link)
      .then(() => alert("Link copied to clipboard!"))
      .catch(() => alert("Failed to copy link"));
  };

  const shareQR = async () => {
    if ('share' in navigator && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: `${formData?.name}'s Contact Card`,
          text: `Here's ${formData?.name}'s contact information`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      copyLink();
    }
  };

  const downloadVCard = () => {
    if (!formData) return;
    
    let vcard = "BEGIN:VCARD\nVERSION:3.0\n";
    vcard += `FN:${formData.name}\n`;
    if (formData.title) vcard += `TITLE:${formData.title}\n`;
    if (formData.email) vcard += `EMAIL:${formData.email}\n`;
    if (formData.phone) vcard += `TEL:${formData.phone}\n`;
    if (formData.address) vcard += `ADR:${formData.address}\n`;
    if (formData.website) vcard += `URL:${formData.website}\n`;
    if (formData.comment) vcard += `NOTE:${formData.comment}\n`;
    vcard += "END:VCARD";
    
    const blob = new Blob([vcard], { type: "text/vcard" });
    saveAs(blob, `${formData.name}.vcf`);
  };

  const handleWhatsAppClick = (phoneNumber: string, e: React.MouseEvent) => {
    e.preventDefault();
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      window.location.href = `whatsapp://send?phone=${phoneNumber}`;
    } else {
      window.open(`https://web.whatsapp.com/send?phone=${phoneNumber}`, '_blank');
    }
  };

  return (
    <div className="p-4 flex flex-col lg:flex-row gap-8">
      {/* Left: Entry Form */}
      <div className="w-full lg:w-[70%]">
      <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">E-Business Card</h2>
          <Button 
            onClick={resetForm}
            variant="outline"
            className="bg-white hover:bg-gray-100"
          >
            Reset
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            {activeFields.map(field => (
              <div key={field.id} className="flex flex-col">
                <label htmlFor={field.id} className={`font-medium ${field.required ? "text-red-600" : ""}`}>
                  {field.label}{field.required && " *"}
                </label>
                {["comment", "promo1", "promo2"].includes(field.id) ? (
                  <textarea
                    id={field.id}
                    ref={el => { inputRefs.current[field.id] = el }}
                    placeholder={field.placeholder}
                    className="p-2 border rounded"
                    required={field.required}
                  />
                ) : (
                  <>
                  <input
                    id={field.id}
                    ref={el => { inputRefs.current[field.id] = el; }}
                    type="text"
                    inputMode={["phone", "whatsappnumber"].includes(field.id) ? "numeric" : "text"}
                    pattern={["phone", "whatsappnumber"].includes(field.id) ? "[0-9\\- ]*" : undefined}
                    onInput={(e) => {
                      if (["phone", "whatsappnumber"].includes(field.id)) {
                        const value = (e.target as HTMLInputElement).value;
                        (e.target as HTMLInputElement).value = value.replace(/[^\d\- ]/g, '');
                      }
                    }}
                    list={`recent-${field.id}`}
                    placeholder={field.placeholder}
                    className="p-2 border rounded"
                    required={field.required}
                  />


                      <datalist id={`recent-${field.id}`}>
                        {getRecentEntries(field.id).map((entry, idx) => (
                          <option key={idx} value={entry} />
                        ))}
                      </datalist></>
                )}
              </div>
            ))}
          </div>

          {/* Field toggles */}
          <div className="flex flex-wrap gap-2">
          {defaultFields.map(field => (
          field.id !== 'name' && ( // Only render toggle button if it's not the 'name' field
            <button
              type="button"
              key={field.id}
              onClick={() => toggleField(field.id)}
              className={`text-sm border px-2 py-1 rounded flex items-center gap-1 ${
                isActive(field.id) ? "bg-red-100 hover:bg-red-200" : "hover:border-blue-500"
              }`}
            >
              {isActive(field.id) ? "−" : "+"}
              {field.label}
            </button>
          )
        ))}
          </div>

          <Button type="submit">Create Contact Card</Button>
        </form>
      </div>      

      {/* Right side - Qr/Contact - Always visible */}
      <div className="lg:w-[30%]" ref={qrSectionRef}>
        <div className="bg-white p-4 rounded-lg border-4 border-[#2f363d] shadow-md w-full">
          {formData ? (
            <>
              <div 
                ref={qrRef} 
                className="flex justify-center mb-4 w-full p-4 bg-white" // Added bg-white for better PNG export
              >
                <a href={window.location.href} className="w-full">
                  <QRCode 
                    value={JSON.stringify(formData)} 
                    size={256}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    bgColor="transparent"
                  />
                </a>
              </div>

              <hr className="border-t border-gray-300 my-2" />

              <div className="space-y-2">
                <div className="text-center mb-4">
                  <h1 className="text-2xl font-bold text-[#2f363d] hover:text-[#170370] transition-colors">
                    {formData.name}
                  </h1>
                  {formData.title && (
                    <h2 className="text-lg text-gray-700 hover:text-[#170370] transition-colors">
                      {formData.title}
                    </h2>
                  )}
                </div>

                {/* Phone */}
                {formData.phone && (
                  <>
                    <div className="h-[1px] bg-gray-200 mx-2 my-1"></div>
                    <div className="group pl-2 border-l-4 border-gray-500 hover:border-l-8 hover:border-[#170370] hover:bg-[rgba(23,3,112,0.05)] transition-all">
                      <div className="text-xs uppercase font-bold text-gray-500 group-hover:text-[#170370] transition-colors pl-2">
                        Telephone
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="group-hover:text-[#170370] transition-colors pl-2 py-1">
                          {formData.phone}
                        </p>
                        <a href={`tel:${formData.phone}`} className="p-2 hover:scale-125 transition-transform">
                          <Phone className="w-5 h-5" />
                        </a>
                      </div>
                    </div>
                  </>
                )}

                {/* Email */}
                {formData.email && (
                  <>
                    <div className="h-[1px] bg-gray-200 mx-2 my-1 group-hover:bg-[rgba(23,3,112,0.2)]"></div>
                    <div className="group pl-2 border-l-4 border-gray-500 hover:border-l-8 hover:border-[#170370] hover:bg-[rgba(23,3,112,0.05)] transition-all">
                      <div className="text-xs uppercase font-bold text-gray-500 group-hover:text-[#170370] transition-colors pl-2">
                        Email
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="group-hover:text-[#170370] transition-colors pl-2 py-1">
                          {formData.email}
                        </p>
                        <a href={`mailto:${formData.email}`} className="p-2 hover:scale-125 transition-transform">
                          <Mail className="w-5 h-5" />
                        </a>
                      </div>
                    </div>
                  </>
                )}

                {/* Address */}
                {formData.address && (
                  <>
                    <div className="h-[1px] bg-gray-200 mx-2 my-1"></div>
                    <div className="group pl-2 border-l-4 border-gray-500 hover:border-l-8 hover:border-[#170370] hover:bg-[rgba(23,3,112,0.05)] transition-all">
                      <div className="text-xs uppercase font-bold text-gray-500 group-hover:text-[#170370] transition-colors pl-2">
                        Address
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="group-hover:text-[#170370] transition-colors pl-2 py-1">
                          {formData.address}
                        </p>
                        <a 
                          href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(formData.address)}`} 
                          target="_blank" 
                          className="p-2 hover:scale-125 transition-transform"
                        >
                          <MapPin className="w-5 h-5" />
                        </a>
                      </div>
                    </div>
                  </>
                )}

                {/* Website */}
                {formData.website && (
                  <>
                    <div className="h-[1px] bg-gray-200 mx-2 my-1"></div>
                    <div className="group pl-2 border-l-4 border-gray-500 hover:border-l-8 hover:border-[#170370] hover:bg-[rgba(23,3,112,0.05)] transition-all">
                      <div className="text-xs uppercase font-bold text-gray-500 group-hover:text-[#170370] transition-colors pl-2">
                        Website
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="group-hover:text-[#170370] transition-colors pl-2 py-1">
                          {formData.website}
                        </p>
                        <a href={formData.website} target="_blank" className="p-2 hover:scale-125 transition-transform">
                          <Globe className="w-5 h-5" />
                        </a>
                      </div>
                    </div>
                  </>
                )}

                {/* WhatsApp */}
                {formData.whatsappnumber && (
                  <>
                    <div className="h-[1px] bg-gray-200 mx-2 my-1"></div>
                    <div className="group pl-2 border-l-4 border-gray-500 hover:border-l-8 hover:border-[#170370] hover:bg-[rgba(23,3,112,0.05)] transition-all">
                      <div className="text-xs uppercase font-bold text-gray-500 group-hover:text-[#170370] transition-colors pl-2">
                        WhatsApp
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="group-hover:text-[#170370] transition-colors pl-2 py-1">
                          {formData.whatsappnumber}
                        </p>
                        <a 
                          href="#" 
                          onClick={(e) => handleWhatsAppClick(formData.whatsappnumber!, e)}
                          className="p-2 hover:scale-125 transition-transform"
                        >
                          <FaWhatsapp className="w-4 h-4 mr-1 text-green-500" />,
                        </a>
                      </div>
                    </div>
                  </>
                )}

                {/* Comment */}
                {formData.comment && (
                  <>
                    <div className="h-[1px] bg-gray-200 mx-2 my-1"></div>
                    <div className="group pl-2 border-l-4 border-gray-500 hover:border-l-8 hover:border-[#170370] hover:bg-[rgba(23,3,112,0.05)] transition-all">
                      <div className="text-xs uppercase font-bold text-gray-500 group-hover:text-[#170370] transition-colors pl-2">
                        Description
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="group-hover:text-[#170370] transition-colors pl-2 py-1">
                          {formData.comment}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <hr className="border-t border-gray-300 my-4" />

              <div className="flex justify-end gap-2">                
                
                {'share' in navigator && typeof navigator.share === 'function' ? (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={shareQR}
                    className="p-2 hover:bg-gray-100"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={copyLink}
                    className="p-2 hover:bg-gray-100"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                )}
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={downloadVCard}
                  className="p-2 bg-red-500 text-white hover:bg-red-600"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500">
              <div className="mb-4 w-full p-4">
                <QRCode 
                  value="placeholder" 
                  size={256}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  bgColor="transparent"
                  fgColor="#e5e7eb"
                />
              </div>
              <p className="text-lg font-medium">
                Your Contact Card and QR code will appear here...
              </p>
              <p className="text-sm mt-2">
                Fill out the form and click "Create Contact Card" to generate your personalized QR code.
              </p>
            </div>
          )}
        </div>

        {/* Download/Share Buttons */}
        {formData && (
          <div className="flex gap-2 justify-center mt-4">
            <Button 
            onClick={downloadQR}
            disabled={!formData}
          >
            <Download className="w-4 h-4 mr-1" />
            Download QR
          </Button>
            <Button onClick={shareQR} variant="outline"><Share2 className="w-4 h-4 mr-1" />Share Qr</Button>
          </div>
        )}
      </div>      
    </div>
  );
}

