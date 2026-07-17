import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';

export default function AboutEditor({ initialData, onSave }) {
    const [loading, setLoading] = useState(false);
    const [text, setText] = useState(initialData?.text || '');
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(initialData?.image || null);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave({ text, image: initialData?.image }, imageFile);
            toast.success('About section updated successfully');
        } catch (err) {
            toast.error(err.message || 'Failed to update about section');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-4 rounded-xl border border-border/60 bg-secondary/10 p-4">
                <div className="space-y-1.5">
                    <Label className="text-sm font-medium">About Image</Label>
                    <div className="relative aspect-video rounded-lg border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-background group">
                        {previewUrl ? (
                            <img src={previewUrl} alt="About Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-center">
                                <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                                <span className="text-xs text-muted-foreground">Click to upload image</span>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="aboutText" className="text-sm font-medium">About Text</Label>
                    <Textarea
                        id="aboutText"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Write something about your brand..."
                        className="min-h-[160px] rounded-lg resize-none"
                    />
                </div>
            </div>

            <Button type="submit" className="w-full h-12 rounded-xl text-sm font-semibold" disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : 'Save About Changes'}
            </Button>
        </form>
    );
}
