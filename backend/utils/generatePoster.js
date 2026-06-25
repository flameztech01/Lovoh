import sharp from 'sharp';
import axios from 'axios';
import { v2 as cloudinary } from 'cloudinary';

/**
 * Generate a personalised "I'm attending" poster
 */
export const generatePoster = async (templateUrl, userPhotoUrl, userName, placeholders) => {
  try {
    console.log('🔍 generatePoster called with:', {
      templateUrl,
      userPhotoUrl,
      userName,
      placeholders,
    });

    const templateRes = await axios.get(templateUrl, { responseType: 'arraybuffer' });
    const templateBuffer = Buffer.from(templateRes.data);

    const metadata = await sharp(templateBuffer).metadata();
    const { width: templateWidth, height: templateHeight } = metadata;
    console.log('📐 Template dimensions:', templateWidth, 'x', templateHeight);

    const compositeLayers = [];

    if (userPhotoUrl) {
      console.log('📷 Downloading user photo from:', userPhotoUrl);
      try {
        const photoRes = await axios.get(userPhotoUrl, { responseType: 'arraybuffer' });
        const photoBuffer = Buffer.from(photoRes.data);

        let { x, y, width, height, borderRadius } = placeholders.photo || { x: 0, y: 0, width: 200, height: 200, borderRadius: 0 };

        x = Math.round(x);
        y = Math.round(y);
        width = Math.round(width);
        height = Math.round(height);
        borderRadius = Math.round(borderRadius || 0);

        x = Math.max(0, Math.min(x, templateWidth - width));
        y = Math.max(0, Math.min(y, templateHeight - height));
        width = Math.min(width, templateWidth - x);
        height = Math.min(height, templateHeight - y);

        console.log('📐 Photo placeholder after clamp:', { x, y, width, height, borderRadius });

        let resizedPhoto = await sharp(photoBuffer)
          .resize(width, height, { fit: 'cover' })
          .png()
          .toBuffer();

        if (borderRadius > 0) {
          const maskSvg = `
            <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
              <rect width="100%" height="100%" rx="${borderRadius}" fill="white" />
            </svg>
          `;
          const maskBuffer = await sharp(Buffer.from(maskSvg))
            .png()
            .toBuffer();

          resizedPhoto = await sharp(resizedPhoto)
            .composite([{ input: maskBuffer, blend: 'dest-in' }])
            .png()
            .toBuffer();

          console.log('📷 Applied border radius:', borderRadius);
        }

        compositeLayers.push({
          input: resizedPhoto,
          left: x,
          top: y,
          blend: 'over',
        });
      } catch (photoErr) {
        console.error('❌ Error processing photo:', photoErr.message);
      }
    }

    // ---------- NAME PLACEHOLDER (fixed alignment) ----------
    let { x, y, fontSize, color, fontFamily } = placeholders.name || {
      x: 100,
      y: 400,
      fontSize: 48,
      color: '#FFFFFF',
      fontFamily: 'Arial',
    };

    x = Math.round(x);
    y = Math.round(y);
    fontSize = Math.round(fontSize);

    x = Math.max(0, Math.min(x, templateWidth));
    y = Math.max(0, Math.min(y, templateHeight));

    // SVG with transparent background, left-aligned and top-aligned (hanging baseline)
    const svg = `
      <svg width="${templateWidth}" height="${templateHeight}" xmlns="http://www.w3.org/2000/svg">
        <text 
          x="${x}" 
          y="${y}" 
          font-family="${fontFamily}" 
          font-size="${fontSize}" 
          fill="${color}" 
          font-weight="bold"
          dominant-baseline="hanging"
          text-anchor="start"
        >
          ${userName}
        </text>
      </svg>
    `;

    console.log('✏️ SVG text preview:', svg.substring(0, 150) + '...');

    const svgBuffer = await sharp(Buffer.from(svg))
      .png()
      .toBuffer();

    compositeLayers.push({
      input: svgBuffer,
      left: 0,
      top: 0,
      blend: 'over',
    });

    let image = sharp(templateBuffer);
    if (compositeLayers.length > 0) {
      image = image.composite(compositeLayers);
    }

    const finalBuffer = await image.png().toBuffer();

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'event_posters', public_id: `poster_${Date.now()}` },
        (err, result) => (err ? reject(err) : resolve(result))
      ).end(finalBuffer);
    });

    console.log('✅ Poster uploaded to Cloudinary:', result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error('❌ Poster generation error:', error);
    throw new Error('Could not generate poster');
  }
};