import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from './button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './dialog';
import { Slider } from './slider';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface ImageCropperProps {
  open: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedImage: string) => void;
  aspectRatio?: number;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

export const ImageCropper: React.FC<ImageCropperProps> = ({
  open,
  onClose,
  imageSrc,
  onCropComplete,
  aspectRatio = 1,
}) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const imgRef = useRef<HTMLImageElement>(null);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, aspectRatio));
  }, [aspectRatio]);

  const handleCropComplete = useCallback(async () => {
    if (!completedCrop || !imgRef.current) return;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const pixelRatio = window.devicePixelRatio;
    canvas.width = Math.floor(completedCrop.width * scaleX * pixelRatio);
    canvas.height = Math.floor(completedCrop.height * scaleY * pixelRatio);

    ctx.scale(pixelRatio, pixelRatio);
    ctx.imageSmoothingQuality = 'high';

    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;
    const cropWidth = completedCrop.width * scaleX;
    const cropHeight = completedCrop.height * scaleY;

    const centerX = image.naturalWidth / 2;
    const centerY = image.naturalHeight / 2;

    ctx.save();
    ctx.translate(-cropX, -cropY);
    ctx.translate(centerX, centerY);
    ctx.scale(scale, scale);
    ctx.translate(-centerX, -centerY);
    ctx.drawImage(image, 0, 0);
    ctx.restore();

    const croppedImage = canvas.toDataURL('image/jpeg', 0.9);
    onCropComplete(croppedImage);
    onClose();
  }, [completedCrop, scale, onCropComplete, onClose]);

  const handleReset = () => {
    setScale(1);
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      setCrop(centerAspectCrop(width, height, aspectRatio));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Ajustar Foto</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-4">
          <div className="max-h-[300px] overflow-hidden rounded-lg bg-secondary/30">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectRatio}
              circularCrop
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop"
                style={{ transform: `scale(${scale})`, maxHeight: '300px' }}
                onLoad={onImageLoad}
              />
            </ReactCrop>
          </div>
          
          <div className="w-full space-y-3">
            <div className="flex items-center gap-3">
              <ZoomOut className="w-4 h-4 text-muted-foreground" />
              <Slider
                value={[scale]}
                onValueChange={(v) => setScale(v[0])}
                min={0.5}
                max={3}
                step={0.1}
                className="flex-1"
              />
              <ZoomIn className="w-4 h-4 text-muted-foreground" />
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="w-full h-8 text-[12px] gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Resetar
            </Button>
          </div>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={onClose} className="h-9 text-[13px]">
            Cancelar
          </Button>
          <Button onClick={handleCropComplete} className="h-9 text-[13px]">
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
