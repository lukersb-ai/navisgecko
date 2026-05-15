export async function compressImage(file: File): Promise<File> {
  // Jeśli to nie obrazek, zwróć oryginał
  if (!file.type.startsWith('image/')) return file;

  const MAX_FILE_SIZE = 800 * 1024; // 800KB - celujemy w znacznie mniej, ale to jest "bezpiecznik"

  const compress = async (targetFile: File, quality: number, maxWidth: number): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(targetFile);
      reader.onload = (event) => {
        const img = new (window as any).Image();
        img.src = event.target?.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Skalowanie proporcjonalne
          if (width > maxWidth || height > maxWidth) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxWidth) / height);
              height = maxWidth;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(targetFile);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(async (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                type: 'image/webp',
                lastModified: Date.now(),
              });

              // Jeśli nadal za duże i możemy jeszcze zejść z jakości/rozmiaru
              if (compressedFile.size > MAX_FILE_SIZE && (quality > 0.3 || maxWidth > 800)) {
                console.log(`[Compression] File still too large (${(compressedFile.size / 1024).toFixed(1)}KB). Retrying with lower settings...`);
                const nextQuality = quality > 0.5 ? 0.5 : 0.3;
                const nextWidth = maxWidth > 1080 ? 1080 : 800;
                resolve(await compress(targetFile, nextQuality, nextWidth));
              } else {
                console.log(`[Compression] ${file.name}: ${(file.size / 1024).toFixed(1)}KB -> ${(compressedFile.size / 1024).toFixed(1)}KB (Quality: ${quality}, Width: ${maxWidth}px)`);
                resolve(compressedFile);
              }
            } else {
              console.warn(`[Compression] Failed to create blob for ${file.name}`);
              resolve(targetFile);
            }
          }, 'image/webp', quality);
        };
      };
      reader.onerror = () => resolve(targetFile);
    });
  };

  return await compress(file, 0.8, 1440);
}
