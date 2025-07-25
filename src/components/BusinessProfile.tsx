//src/components/BusinessProfile.tsx
import { useState, useRef, useEffect } from "react";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import { toPng } from "html-to-image";
import { saveAs } from "file-saver";
import {
  Mail, Phone, Globe, MapPin, Share2, Download, Copy, X
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useAppContext } from "@/context/AppContext";
import { Card } from "@/components/ui/card";

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
  { id: "promo2", label: "Promotion Button text", placeholder: "Promotion Button text" },
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
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    return savedData ? JSON.parse(savedData).activeFields || [{ ...defaultFields[0] }] : [{ ...defaultFields[0] }];
  });
  const [formData, setFormData] = useState<QCard | null>(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    return savedData ? JSON.parse(savedData).formData || null : null;
  });
  const [showFieldDropdown, setShowFieldDropdown] = useState(false);
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

  const resetForm = () => {
    setFormData(null);
    setActiveFields([{ ...defaultFields[0] }]);
    Object.values(inputRefs.current).forEach(ref => {
      if (ref) ref.value = '';
    });
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  const addField = (fieldId: string) => {
    const field = defaultFields.find(f => f.id === fieldId);
    if (!field || isActive(fieldId)) return;
    
    setActiveFields([...activeFields, field]);
    setShowFieldDropdown(false);
    setTimeout(() => inputRefs.current[fieldId]?.focus(), 0);
  };

  const removeField = (fieldId: string) => {
    if (fieldId === 'name') return;
    setActiveFields(activeFields.filter(f => f.id !== fieldId));
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
      qrSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [formData, isMobile]);

  const qrRef = useRef<HTMLDivElement | null>(null);

  const downloadQR = () => {
    if (!qrRef.current || !formData) return;
  
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

  const availableFields = defaultFields.filter(
    field => !isActive(field.id) && field.id !== 'name'
  );

  return (
    <div className={`p-2 md:p-4 flex flex-col lg:flex-row gap-2 md:gap-8 w-full max-w-[100vw] overflow-x-hidden dark:bg-[#0a0a23] text-white`}>
      {/* Left Section: Form */}
      <div className="w-full lg:w-[70%] min-w-0">
        <h2 className="text-xl font-bold pb-4 md:pb-8 text-gray-900 dark:text-white">
          E-Business Card
        </h2>

        <Card className="relative bg-white dark:bg-[#0a0a23] border border-gray-300 dark:border-green-500 rounded-md px-3 md:px-4 pt-6 md:pt-8 pb-3 md:pb-4">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center w-full justify-center">
            <div className="flex items-center w-full px-3 md:px-4">
              <span className="px-2 md:px-3 bg-white dark:bg-[#0a0a23] text-gray-700 dark:text-gray-300 font-semibold text-sm md:text-base">
                Select to fill in Contact Details
              </span>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4">
                  {activeFields.map((field) => (
                  <div key={field.id} className="flex flex-col relative">
                      <div className="flex justify-between items-center">
                      <label
                          htmlFor={field.id}
                          className={`font-medium ${
                          field.required
                              ? "text-red-600"
                              : "text-gray-300 dark: text-gray-800"
                          }`}
                      >
                          {field.label}
                          {field.required && " *"}
                      </label>
                      {/* Remove Field Button */}
                      {field.id !== "name" && (
                          <button
                          type="button"
                          onClick={() => removeField(field.id)}
                          className="text-gray-400 hover:text-red-500 p-1"
                          >
                          <X className={`w-4 h-4 dark:text-gray-300 : "text-gray-600"}`} />
                          </button>
                      )}
                      </div>
                      {/* Input or Textarea */}
                      {["comment", "promo1", "promo2"].includes(field.id) ? (
                      <textarea
                          id={field.id}
                          ref={(el) => {
                          inputRefs.current[field.id] = el;
                          }}
                          placeholder={field.placeholder}
                          className={`p-2 rounded border focus:ring-2 focus:ring-green-500
                          bg-[#0a0a23] text-white border-gray-600 : "bg-white text-black border-gray-300"}`}
                          required={field.required}
                      />
                      ) : (
                      <>
                          <input
                          id={field.id}
                          ref={(el) => {
                              inputRefs.current[field.id] = el;
                          }}
                          type="text"
                          inputMode={
                              ["phone", "whatsappnumber"].includes(field.id) ? "numeric" : "text"
                          }
                          pattern={
                              ["phone", "whatsappnumber"].includes(field.id) ? "[0-9\\- ]*" : undefined
                          }
                          placeholder={field.placeholder}
                          className={`p-2 rounded border focus:ring-2 focus:ring-green-500
                          dark:bg-[#0a0a23] text-white border-gray-600 : "bg-white text-black border-gray-300"}`}
                          required={field.required}
                          list={`recent-${field.id}`}
                          />
                          <datalist id={`recent-${field.id}`}>
                          {getRecentEntries(field.id).map((entry, idx) => (
                              <option key={idx} value={entry} />
                          ))}
                          </datalist>
                      </>
                      )}
                  </div>
                  ))}
              </div>
              {/* Mobile layout - Reset and Add Fields buttons */}
              <div className="md:hidden flex flex-col space-y-4">
                  <div className="flex gap-2">
                  {availableFields.length > 0 && (
                      <Button
                      type="button"
                      onClick={() => setShowFieldDropdown(!showFieldDropdown)}
                      className={`flex-1 ${
                          "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                  >
                      +Add Fields
                      </Button>
                  )}
                  <Button 
                      type="button"
                      onClick={resetForm}
                      className={`flex-1 ${
                      "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                  >
                      --Reset
                  </Button>
                  </div>
                  <hr className="border-t border-gray-300" />
                  <Button 
                  type="submit"
                  className={`flex-1 ${
                      "bg-green-700 text-white hover:bg-green-800 dark:bg-green-600 text-white hover:bg-green-700"
                  }`}
                  >
                  Create Contact Card
                  </Button>
              </div>

              {/* Desktop layout - All buttons in one line */}
              <div className="hidden md:flex gap-2">
                  <Button 
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-blue-500 text-white hover:bg-blue-600"
                  >
                  --Reset
                  </Button>
                  {availableFields.length > 0 && (
                  <Button
                      type="button"
                      onClick={() => setShowFieldDropdown(!showFieldDropdown)}
                      className="flex-1 bg-blue-500 text-white hover:bg-blue-600"
                  >
                      +Add Fields
                  </Button>
                  )}
                  <Button 
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                  Create Contact Card
                  </Button>
              </div>

              {showFieldDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow-lg">
                  {availableFields.map(field => (
                      <button
                      key={field.id}
                      type="button"
                      onClick={() => addField(field.id)}
                      className="block w-full text-left px-4 py-2 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                      {field.label}
                      </button>
                  ))}
                  </div>
              )}
          </form>
        </Card>
      </div>      
      
      {/* Right side - Qr/Contact */}
      <div className="w-full lg:w-[30%] min-w-0" ref={qrSectionRef}>
        <Card className="relative rounded-md px-2 md:px-4 pt-4 md:pt-6 pb-2 md:pb-4 bg-white dark:bg-[#0a0a23] border border-gray-300 dark:border-green-500">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 md:px-4 text-center bg-white dark:bg-[#0a0a23] relative">
            <span className="font-semibold text-sm md:text-base text-gray-700 dark:text-gray-300 relative">
              E-Business Card Preview
            </span>
          </div>
          <div className="p-2 md:p-3 rounded-lg border-4 shadow-md bg-gray-100 dark:bg-black border-gray-300 dark:border-[#2f363d] w-full">
            {formData ? (
              <>
                <div 
                  ref={qrRef} 
                  className="flex justify-center mb-2 md:mb-3 w-full p-2 md:p-3 bg-white"
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

                <hr className="border-t border-gray-300 my-1 md:my-2" />

                <div className="space-y-1 md:space-y-2">
                  <div className="text-center mb-2 md:mb-3">
                    <h1 className="text-xl md:text-2xl font-bold dark:text-white text-[#2f363d] hover:text-[#170370] transition-colors">
                      {formData.name}
                    </h1>
                    {formData.title && (
                      <h2 className="text-base md:text-lg dark:text-gray-300 text-gray-700 hover:text-[#170370] transition-colors">
                        {formData.title}
                      </h2>
                    )}
                  </div>

                  {/* Phone */}
                  {formData.phone && (
                    <div className="group pl-2 border-l-4 border-gray-500 hover:border-l-8 hover:border-[#170370] hover:bg-[rgba(23,3,112,0.05)] transition-all">
                      <div className="text-xs uppercase font-bold dark:text-gray-300 text-gray-500 group-hover:text-[#170370] transition-colors pl-2">
                        Telephone
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="dark:text-white text-black group-hover:text-[#170370] transition-colors pl-2 py-1">
                          {formData.phone}
                        </p>
                        <a href={`tel:${formData.phone}`} className="p-1 md:p-2 hover:scale-125 transition-transform">
                          <Phone className="w-4 h-4 md:w-5 md:h-5 dark:text-blue-300 text-black" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  {formData.email && (
                    <div className="group pl-2 border-l-4 border-gray-500 hover:border-l-8 hover:border-[#170370] hover:bg-[rgba(23,3,112,0.05)] transition-all">
                      <div className="text-xs uppercase font-bold dark:text-gray-300 text-gray-500 group-hover:text-[#170370] transition-colors pl-2">
                        Email
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="dark:text-white text-black group-hover:text-[#170370] transition-colors pl-2 py-1">
                          {formData.email}
                        </p>
                        <a href={`mailto:${formData.email}`} className="p-1 md:p-2 hover:scale-125 transition-transform">
                          <Mail className="w-4 h-4 md:w-5 md:h-5 dark:text-blue-300 text-black" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Address */}
                  {formData.address && (
                    <div className="group pl-2 border-l-4 border-gray-500 hover:border-l-8 hover:border-[#170370] hover:bg-[rgba(23,3,112,0.05)] transition-all">
                      <div className="text-xs uppercase font-bold dark:text-gray-300 text-gray-500 group-hover:text-[#170370] transition-colors pl-2">
                        Address
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="dark:text-white text-black group-hover:text-[#170370] transition-colors pl-2 py-1">
                          {formData.address}
                        </p>
                        <a 
                          href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(formData.address)}`} 
                          target="_blank" 
                          className="p-1 md:p-2 hover:scale-125 transition-transform"
                        >
                          <MapPin className="w-4 h-4 md:w-5 md:h-5 dark:text-blue-300 text-black" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Website */}
                  {formData.website && (
                    <div className="group pl-2 border-l-4 border-gray-500 hover:border-l-8 hover:border-[#170370] hover:bg-[rgba(23,3,112,0.05)] transition-all">
                      <div className="text-xs uppercase font-bold dark:text-gray-300 text-gray-500 group-hover:text-[#170370] transition-colors pl-2">
                        Website
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="dark:text-white text-black group-hover:text-[#170370] transition-colors pl-2 py-1">
                          {formData.website}
                        </p>
                        <a href={formData.website} target="_blank" className="p-1 md:p-2 hover:scale-125 transition-transform">
                          <Globe className="w-4 h-4 md:w-5 md:h-5 dark:text-blue-300 text-black" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* WhatsApp */}
                  {formData.whatsappnumber && (
                    <div className="group pl-2 border-l-4 border-gray-500 hover:border-l-8 hover:border-[#170370] hover:bg-[rgba(23,3,112,0.05)] transition-all">
                      <div className="text-xs uppercase font-bold dark:text-gray-300 text-gray-500 group-hover:text-[#170370] transition-colors pl-2">
                        WhatsApp
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="dark:text-white text-black group-hover:text-[#170370] transition-colors pl-2 py-1">
                          {formData.whatsappnumber}
                        </p>
                        <a 
                          href="#" 
                          onClick={(e) => handleWhatsAppClick(formData.whatsappnumber!, e)}
                          className="p-1 md:p-2 hover:scale-125 transition-transform"
                        >
                          <FaWhatsapp className="w-4 h-4 dark:text-blue-300 text-green-500" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Comment */}
                  {formData.comment && (
                    <div className="group pl-2 border-l-4 border-gray-500 hover:border-l-8 hover:border-[#170370] hover:bg-[rgba(23,3,112,0.05)] transition-all">
                      <div className="text-xs uppercase font-bold dark:text-gray-300 text-gray-500 group-hover:text-[#170370] transition-colors pl-2">
                        Description
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="dark:text-white text-black group-hover:text-[#170370] transition-colors pl-2 py-1">
                          {formData.comment}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <hr className="border-t border-gray-300 my-2 md:my-3" />

                <div className="flex justify-end gap-1 md:gap-2">                
                  {'share' in navigator && typeof navigator.share === 'function' ? (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={shareQR}
                      className="p-1 md:p-2 hover:bg-gray-100"
                      title="Share Contact"
                    >
                      <Share2 className="w-4 h-4 md:w-5 md:h-5 dark:text-blue-300 text-black" />
                    </Button>
                  ) : (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={copyLink}
                      className="p-1 md:p-2 hover:bg-gray-100"
                      title="Copy Link"
                    >
                      <Copy className="w-4 h-4 md:w-5 md:h-5 dark:text-blue-300 text-black" />
                    </Button>
                  )}
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={downloadVCard}
                    className="p-1 md:p-2 bg-red-500 text-white hover:bg-red-600"
                    title="Download Contact"
                  >
                    <Download className="w-4 h-4 md:w-5 md:h-5" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-4 md:p-6 text-center dark:text-gray-300 text-gray-500">
                <div className="mb-3 w-full p-3">
                  <QRCode 
                    value="placeholder" 
                    size={256}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    bgColor="transparent"
                    fgColor="#e5e7eb"
                  />
                </div>
                <p className="text-base md:text-lg font-medium">
                  Your Contact Card and QR code will appear here...
                </p>
                <p className="text-xs md:text-sm mt-1 md:mt-2">
                  Fill out the form and click "Create Contact Card" to generate your personalized QR code.
                </p>
              </div>
            )}
          </div>
        </Card>
        
        {/* Download/Share QR Buttons */}
        {formData && (
          <div className="flex gap-1 md:gap-2 justify-center mt-2 md:mt-3">
            <Button 
              onClick={downloadQR}
              disabled={!formData}
              className="bg-green-600 hover:bg-green-700 text-white text-sm md:text-base p-1 md:p-2"
            >
              <Download className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              Download QR
            </Button>
            <Button 
              onClick={shareQR} 
              className="bg-red-600 hover:bg-gray-800 text-white text-sm md:text-base p-1 md:p-2"
            >
              <Share2 className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              Share QR
            </Button>
          </div>
        )}
      </div>      
    </div>
  );
}