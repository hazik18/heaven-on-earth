import { useState, useId } from 'react';

/**
 * Reusable single-image uploader supporting drag-and-drop, device file picker,
 * and direct image URL input, with a 3 MB size guard and live preview.
 */
export default function SingleImageUpload({
  label,
  value = '',
  onChange,
  required = false,
  error = '',
  placeholder = 'https://example.com/image.jpg',
}) {
  const inputId = useId();
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFile = (files) => {
    const file = Array.from(files || []).find((f) => f.type.startsWith('image/'));
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      setUploadError('Image exceeds 3 MB limit.');
      return;
    }
    setUploadError('');
    const reader = new FileReader();
    reader.onload = (e) => onChange(e.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <label className="text-[13px] font-bold text-slate-200 uppercase block">
        {label} {required && <span className="text-red-400">*</span>}
      </label>

      {/* Drag-and-drop + device upload zone */}
      <div
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${
          dragOver
            ? 'border-[#EA580C] bg-orange-500/10'
            : 'border-slate-700 bg-slate-950/60 hover:border-slate-500'
        }`}
      >
        {value ? (
          <div className="flex items-center gap-3 sm:gap-4 text-left">
            <img
              src={value}
              alt={label}
              className="w-16 h-16 rounded-lg object-cover border border-slate-700 shrink-0 bg-slate-800"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">
                {value.startsWith('data:') ? 'Uploaded image from device' : value}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <label
                  htmlFor={inputId}
                  className="cursor-pointer text-xs font-bold text-orange-400 hover:text-orange-300"
                >
                  Replace file
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setUploadError('');
                    onChange('');
                  }}
                  className="text-xs font-bold text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 py-1">
            <span className="material-icons text-slate-300 text-2xl">cloud_upload</span>
            <p className="text-xs text-slate-300">
              Drag & drop an image here, or{' '}
              <label
                htmlFor={inputId}
                className="cursor-pointer font-bold text-orange-400 hover:text-orange-300 underline"
              >
                browse from device
              </label>
            </p>
          </div>
        )}

        <input
          id={inputId}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            handleFile(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {/* Optional direct URL input */}
      <input
        type="text"
        required={required}
        value={value}
        onChange={(e) => {
          setUploadError('');
          onChange(e.target.value);
        }}
        placeholder={placeholder}
        className={`w-full bg-slate-950 border rounded-lg px-4 py-2.5 text-[15px] text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-orange-500/20 ${
          error || uploadError
            ? 'border-red-500 focus:border-red-400'
            : 'border-slate-700 focus:border-[#EA580C]'
        }`}
      />

      {(uploadError || error) && (
        <p className="text-red-400 text-xs flex items-center gap-1">
          <span className="material-icons text-[14px]">error_outline</span>
          {uploadError || error}
        </p>
      )}
    </div>
  );
}
