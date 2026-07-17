import React, { useRef } from 'react';
import { Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ImageUpload({ value, onChange }) {
    const inputRef = useRef(null);

    const handleFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            onChange(ev.target.result);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium">Product Image</label>
            {value ? (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-border">
                    <img src={value} alt="Product" className="w-full h-full object-cover" />
                    <button
                        type="button"
                        onClick={() => onChange('')}
                        className="absolute top-1 right-1 w-6 h-6 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            ) : (
                <Button
                    type="button"
                    variant="outline"
                    className="h-24 w-24 flex flex-col items-center justify-center gap-1 rounded-lg border-dashed"
                    onClick={() => inputRef.current?.click()}
                >
                    <Camera className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Upload</span>
                </Button>
            )}
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFile}
            />
        </div>
    );
}