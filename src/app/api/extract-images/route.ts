import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL format
    let targetUrl: string;
    try {
      const urlObj = new URL(url);
      targetUrl = urlObj.href;
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Fetch the webpage
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch the webpage' }, { status: 400 });
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const baseUrl = new URL(targetUrl);
    const images: Array<{
      src: string;
      alt: string;
      type: string;
      size?: string;
    }> = [];

    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'avif', 'tiff', 'tif'];
    
    const processImageUrl = (src: string, alt: string = '') => {
      if (!src || src.startsWith('data:')) return; // Skip data URLs and empty sources
      
      try {
        let fullUrl: string;
        // Handle relative URLs
        if (src.startsWith('//')) {
          fullUrl = `${baseUrl.protocol}${src}`;
        } else if (src.startsWith('/')) {
          fullUrl = `${baseUrl.protocol}//${baseUrl.host}${src}`;
        } else if (src.startsWith('http')) {
          fullUrl = src;
        } else {
          fullUrl = new URL(src, targetUrl).href;
        }

        // Get file extension - handle query parameters
        const urlObj = new URL(fullUrl);
        const pathname = urlObj.pathname;
        const extension = pathname.split('.').pop()?.toLowerCase().split('?')[0] || '';
        
        // Also check if URL contains image-like patterns even without extension
        const hasImagePattern = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|avif|tiff|tif)(\?|$|#)/i.test(fullUrl) ||
                               imageExtensions.includes(extension) ||
                               /\/image\//i.test(fullUrl) ||
                               /\/img\//i.test(fullUrl);
        
        if (hasImagePattern || imageExtensions.includes(extension)) {
          images.push({
            src: fullUrl,
            alt: alt || 'Image',
            type: extension || 'unknown',
          });
        }
      } catch (error) {
        console.error('Error processing image URL:', src, error);
      }
    };

    // Extract images from img tags (including src, data-src, data-lazy-src, etc.)
    $('img').each((_, element) => {
      const $img = $(element);
      const src = $img.attr('src');
      const dataSrc = $img.attr('data-src');
      const dataLazySrc = $img.attr('data-lazy-src');
      const dataOriginal = $img.attr('data-original');
      const dataSrcset = $img.attr('data-srcset');
      const srcset = $img.attr('srcset');
      const alt = $img.attr('alt') || '';
      
      // Process main src
      if (src) processImageUrl(src, alt);
      
      // Process lazy loading attributes
      if (dataSrc) processImageUrl(dataSrc, alt);
      if (dataLazySrc) processImageUrl(dataLazySrc, alt);
      if (dataOriginal) processImageUrl(dataOriginal, alt);
      
      // Process srcset attributes
      if (srcset) {
        const srcsetUrls = srcset.split(',').map(s => s.trim().split(' ')[0]);
        srcsetUrls.forEach(url => processImageUrl(url, alt));
      }
      
      if (dataSrcset) {
        const srcsetUrls = dataSrcset.split(',').map(s => s.trim().split(' ')[0]);
        srcsetUrls.forEach(url => processImageUrl(url, alt));
      }
    });

    // Extract images from CSS background-image properties (inline styles)
    $('*').each((_, element) => {
      const $el = $(element);
      const style = $el.attr('style');
      if (style && style.includes('background-image')) {
        const matches = style.match(/background-image:\s*url\(['"']?([^'"')\s]+)['"']?\)/g);
        if (matches) {
          matches.forEach(match => {
            const urlMatch = match.match(/url\(['"']?([^'"')\s]+)['"']?\)/);
            if (urlMatch && urlMatch[1]) {
              processImageUrl(urlMatch[1], 'Background Image');
            }
          });
        }
      }
    });

    // Extract images from picture and source elements
    $('picture source, source').each((_, element) => {
      const $source = $(element);
      const srcset = $source.attr('srcset');
      const src = $source.attr('src');
      
      if (srcset) {
        const srcsetUrls = srcset.split(',').map(s => s.trim().split(' ')[0]);
        srcsetUrls.forEach(url => processImageUrl(url, 'Picture Source'));
      }
      
      if (src) {
        processImageUrl(src, 'Picture Source');
      }
    });

    // Extract images from video poster attributes
    $('video').each((_, element) => {
      const poster = $(element).attr('poster');
      if (poster) {
        processImageUrl(poster, 'Video Poster');
      }
    });

    // Extract images from link rel="icon" and rel="apple-touch-icon"
    $('link[rel*="icon"]').each((_, element) => {
      const href = $(element).attr('href');
      if (href) {
        processImageUrl(href, 'Icon');
      }
    });

    // Extract images from meta property="og:image" and similar
    $('meta[property*="image"], meta[name*="image"]').each((_, element) => {
      const content = $(element).attr('content');
      if (content) {
        processImageUrl(content, 'Meta Image');
      }
    });

    // Extract images from data attributes commonly used for lazy loading
    $('[data-background-image], [data-bg], [data-background]').each((_, element) => {
      const $el = $(element);
      const bgImage = $el.attr('data-background-image') || $el.attr('data-bg') || $el.attr('data-background');
      if (bgImage) {
        processImageUrl(bgImage, 'Data Background');
      }
    });

    // Look for images in JavaScript variables (enhanced pattern matching)
    const scriptTags = $('script').toArray();
    scriptTags.forEach(script => {
      const scriptContent = $(script).html();
      if (scriptContent) {
        // Look for common image URL patterns in JavaScript
        const imageUrlPatterns = [
          // Standard quoted URLs
          /['"]([^'"]*\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|avif|tiff)[^'"]*)['"](?!\s*:)/gi,
          // CSS url() functions
          /url\s*\(['"]?([^'"\)]*\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|avif|tiff)[^'"\)]*)['"]?\)/gi,
          // Image paths in arrays or objects
          /['"]([^'"]*\/[^'"]*\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|avif|tiff))['"](?!\s*:)/gi,
          // Base64 or blob URLs that might reference images
          /['"]([^'"]*(?:image\/|img\/)[^'"]*)['"](?!\s*:)/gi,
          // Common image variable patterns
          /(?:src|image|img|photo|picture|thumbnail|avatar|banner|logo)\s*[=:]\s*['"]([^'"]+\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|avif|tiff)[^'"]*)['"](?!\s*:)/gi
        ];
        
        imageUrlPatterns.forEach(pattern => {
          const matches = scriptContent.match(pattern);
          if (matches) {
            matches.forEach(match => {
              // Extract the URL from different match patterns
              let url = '';
              if (match.includes('url(')) {
                const urlMatch = match.match(/url\s*\(['"]?([^'"\)]+)['"]?\)/);
                if (urlMatch && urlMatch[1]) url = urlMatch[1];
              } else {
                const urlMatch = match.match(/['"]([^'"]+)['"]/);
                if (urlMatch && urlMatch[1]) url = urlMatch[1];
              }
              
              if (url && !url.startsWith('data:') && !url.includes('base64')) {
                processImageUrl(url, 'Script Image');
              }
            });
          }
        });
      }
    });

    // Extract images from CSS files referenced in the page
    $('link[rel="stylesheet"]').each((_, element) => {
      const href = $(element).attr('href');
      if (href) {
        try {
          let cssUrl: string;
          if (href.startsWith('//')) {
            cssUrl = `${baseUrl.protocol}${href}`;
          } else if (href.startsWith('/')) {
            cssUrl = `${baseUrl.protocol}//${baseUrl.host}${href}`;
          } else if (href.startsWith('http')) {
            cssUrl = href;
          } else {
            cssUrl = new URL(href, targetUrl).href;
          }

          // Note: In a real implementation, you'd want to fetch and parse CSS files
          // For now, we'll add the CSS URL pattern to look for later
          console.log('CSS file found:', cssUrl);
        } catch (error) {
          console.error('Error processing CSS URL:', href, error);
        }
      }
    });

    // Look for images in inline CSS styles in style tags
    $('style').each((_, element) => {
      const styleContent = $(element).html();
      if (styleContent) {
        // Look for background-image and other image references in CSS
        const cssImagePatterns = [
          /background-image\s*:\s*url\s*\(['"]?([^'"\)]+)['"]?\)/gi,
          /background\s*:\s*[^;]*url\s*\(['"]?([^'"\)]+)['"]?\)/gi,
          /content\s*:\s*url\s*\(['"]?([^'"\)]+)['"]?\)/gi
        ];
        
        cssImagePatterns.forEach(pattern => {
          const matches = styleContent.match(pattern);
          if (matches) {
            matches.forEach(match => {
              const urlMatch = match.match(/url\s*\(['"]?([^'"\)]+)['"]?\)/);
              if (urlMatch && urlMatch[1]) {
                processImageUrl(urlMatch[1], 'CSS Image');
              }
            });
          }
        });
      }
    });

    // Look for images in noscript tags (fallbacks for lazy loading)
    $('noscript').each((_, element) => {
      const noscriptContent = $(element).html();
      if (noscriptContent) {
        const $noscript = cheerio.load(noscriptContent);
        $noscript('img').each((_, img) => {
          const src = $noscript(img).attr('src');
          const alt = $noscript(img).attr('alt') || 'Noscript Image';
          if (src) {
            processImageUrl(src, alt);
          }
        });
      }
    });

    // Look for images in data-* attributes on any element
    $('*').each((_, element) => {
      const $el = $(element);
      
      // Get all data-* attributes using cheerio's methods
      const dataAttributes = ['data-src', 'data-original', 'data-lazy', 'data-image', 'data-bg', 'data-background'];
      
      dataAttributes.forEach(attr => {
        const value = $el.attr(attr);
        if (value && /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|avif|tiff)($|\?|#)/i.test(value)) {
          processImageUrl(value, `Data Attribute: ${attr}`);
        }
      });
      
      // Also check style attribute for background images
      const style = $el.attr('style');
      if (style) {
        const bgMatches = style.match(/background(?:-image)?\s*:\s*url\(['"]?([^'"\)]+)['"]?\)/gi);
        if (bgMatches) {
          bgMatches.forEach(match => {
            const urlMatch = match.match(/url\(['"]?([^'"\)]+)['"]?\)/);
            if (urlMatch && urlMatch[1]) {
              processImageUrl(urlMatch[1], 'CSS Background');
            }
          });
        }
      }
    });

    // Remove duplicates
    const uniqueImages = images.filter((image, index, self) => 
      index === self.findIndex(img => img.src === image.src)
    );

    return NextResponse.json({ 
      images: uniqueImages,
      total: uniqueImages.length,
      url: targetUrl
    });

  } catch (error) {
    console.error('Error extracting images:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
