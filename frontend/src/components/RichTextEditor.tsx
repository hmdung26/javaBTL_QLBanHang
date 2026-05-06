import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Bold, Heading2, ImagePlus, Italic, List, ListOrdered } from 'lucide-react';
import { toast } from 'react-toastify';
import { uploadImage } from '../services/UploadService';

interface RichTextEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function RichTextEditor({ label, value, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  function syncValue() {
    onChange(editorRef.current?.innerHTML || '');
  }

  function exec(command: string, commandValue?: string) {
    document.execCommand(command, false, commandValue);
    editorRef.current?.focus();
    syncValue();
  }

  async function handleImageUpload(file: File | undefined) {
    if (!file) {
      return;
    }

    setIsUploading(true);
    try {
      const imageUrl = await uploadImage(file);
      exec('insertImage', imageUrl);
      toast.success('Đã chèn ảnh vào mô tả');
    } catch {
      toast.error('Không chèn được ảnh');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <label className="block text-sm font-bold text-slate-700">
      {label}
      <div className="mt-1 overflow-hidden rounded border border-slate-300 bg-white">
        <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 p-2">
          <ToolbarButton label="Tiêu đề" onClick={() => exec('formatBlock', 'h2')}>
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Đậm" onClick={() => exec('bold')}>
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Nghiêng" onClick={() => exec('italic')}>
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Danh sách" onClick={() => exec('insertUnorderedList')}>
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Danh sách số" onClick={() => exec('insertOrderedList')}>
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <span className="relative inline-flex">
            <input
              type="file"
              accept="image/*"
              onChange={(event) => handleImageUpload(event.target.files?.[0])}
              className="absolute inset-0 cursor-pointer opacity-0"
              title=""
            />
            <span className="inline-flex h-8 items-center gap-1 rounded bg-white px-2 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
              <ImagePlus className="h-4 w-4" />
              {isUploading ? 'Đang tải...' : 'Chèn ảnh'}
            </span>
          </span>
        </div>
        <div
          ref={editorRef}
          contentEditable
          onInput={syncValue}
          className="prose prose-sm max-w-none min-h-48 px-3 py-2 text-sm outline-none"
          suppressContentEditableWarning
        />
      </div>
    </label>
  );
}

function ToolbarButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className="grid h-8 w-8 place-items-center rounded bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-red-50 hover:text-[#d71920]"
    >
      {children}
    </button>
  );
}

export default RichTextEditor;
