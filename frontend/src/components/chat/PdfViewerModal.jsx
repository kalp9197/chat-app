import React from "react";
import { X } from "lucide-react";

const PdfViewerModal = ({ pdfData, fileName, onClose }) => {
  if (!pdfData) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-black rounded-lg shadow-xl w-[90vw] h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold truncate text-white">
            {fileName}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-500"
          >
            <X size={24} />
          </button>
        </header>
        <div className="flex-1">
          <object
            data={`data:application/pdf;base64,${pdfData}`}
            type="application/pdf"
            width="100%"
            height="100%"
          >
            <p className="p-4 text-center">
              Your browser does not support embedded PDFs. You can{" "}
              <a
                href={`data:application/pdf;base64,${pdfData}`}
                download={fileName}
                className="text-white hover:underline"
              >
                download the PDF
              </a>{" "}
              instead.
            </p>
          </object>
        </div>
      </div>
    </div>
  );
};

export default PdfViewerModal;
