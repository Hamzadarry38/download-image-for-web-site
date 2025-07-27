import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { imageUrls } = await request.json();

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return NextResponse.json({ error: 'Image URLs are required' }, { status: 400 });
    }

    const downloadedImages: Array<{
      url: string;
      data: string;
      filename: string;
      success: boolean;
      error?: string;
    }> = [];

    // Download each image
    for (const imageUrl of imageUrls) {
      try {
        const response = await fetch(imageUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });

        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString('base64');
          
          // Get content type from response headers
          const contentType = response.headers.get('content-type') || 'image/jpeg';
          
          // Extract filename from URL
          const urlPath = new URL(imageUrl).pathname;
          let filename = urlPath.split('/').pop() || `image_${Date.now()}`;
          
          // Add proper extension based on content type if missing
          if (!filename.includes('.')) {
            const extension = contentType.split('/')[1] || 'jpg';
            filename += `.${extension}`;
          }
          
          // Create proper data URL
          const dataUrl = `data:${contentType};base64,${base64}`;
          
          downloadedImages.push({
            url: imageUrl,
            data: dataUrl,
            filename,
            success: true
          });
        } else {
          downloadedImages.push({
            url: imageUrl,
            data: '',
            filename: '',
            success: false,
            error: `HTTP ${response.status}: ${response.statusText}`
          });
        }
      } catch (error) {
        downloadedImages.push({
          url: imageUrl,
          data: '',
          filename: '',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const successfulDownloads = downloadedImages.filter(img => img.success);
    
    return NextResponse.json({
      images: downloadedImages,
      successful: successfulDownloads.length,
      failed: downloadedImages.length - successfulDownloads.length,
      total: downloadedImages.length
    });

  } catch (error) {
    console.error('Error downloading images:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
