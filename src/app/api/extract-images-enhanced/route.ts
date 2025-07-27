import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(request: NextRequest) {
  try {
    const { url, waitTime = 5000 } = await request.json();

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

    const images: Array<{
      src: string;
      alt: string;
      type: string;
      source: string;
    }> = [];

    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'avif', 'tiff', 'tif'];
    const baseUrl = new URL(targetUrl);

    const processImageUrl = (src: string, alt: string = '', source: string = 'unknown') => {
      if (!src || src.startsWith('data:') || src.length < 4) return;
      
      try {
        let fullUrl: string;
        if (src.startsWith('//')) {
          fullUrl = `${baseUrl.protocol}${src}`;
        } else if (src.startsWith('/')) {
          fullUrl = `${baseUrl.protocol}//${baseUrl.host}${src}`;
        } else if (src.startsWith('http')) {
          fullUrl = src;
        } else {
          fullUrl = new URL(src, targetUrl).href;
        }

        const urlObj = new URL(fullUrl);
        const pathname = urlObj.pathname;
        const extension = pathname.split('.').pop()?.toLowerCase().split('?')[0] || '';
        
        const hasImagePattern = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|avif|tiff|tif)(\?|$|#)/i.test(fullUrl) ||
                               imageExtensions.includes(extension) ||
                               /\/image\//i.test(fullUrl) ||
                               /\/img\//i.test(fullUrl) ||
                               /\/photos?\//i.test(fullUrl) ||
                               /\/pictures?\//i.test(fullUrl);
        
        if (hasImagePattern || imageExtensions.includes(extension)) {
          // Check for duplicates
          const exists = images.some(img => img.src === fullUrl);
          if (!exists) {
            images.push({
              src: fullUrl,
              alt: alt || 'Image',
              type: extension || 'unknown',
              source: source
            });
          }
        }
      } catch (error) {
        console.error('Error processing image URL:', src, error);
      }
    };

    // Function to fetch and parse the page multiple times with delays
    const fetchAndParse = async (delay: number = 0): Promise<void> => {
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      try {
        const response = await fetch(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Extract from img tags with all possible attributes
        $('img').each((_, element) => {
          const $img = $(element);
          const attributes = ['src', 'data-src', 'data-lazy-src', 'data-original', 'data-srcset', 'data-lazy', 'data-echo', 'data-img'];
          
          attributes.forEach(attr => {
            const value = $img.attr(attr);
            if (value) {
              if (attr === 'data-srcset' || attr === 'srcset') {
                const srcsetUrls = value.split(',').map(s => s.trim().split(' ')[0]);
                srcsetUrls.forEach(url => processImageUrl(url, $img.attr('alt') || '', `img-${attr}`));
              } else {
                processImageUrl(value, $img.attr('alt') || '', `img-${attr}`);
              }
            }
          });
        });

        // Extract from picture and source elements
        $('picture source, source').each((_, element) => {
          const $source = $(element);
          const srcset = $source.attr('srcset');
          const src = $source.attr('src');
          
          if (srcset) {
            const srcsetUrls = srcset.split(',').map(s => s.trim().split(' ')[0]);
            srcsetUrls.forEach(url => processImageUrl(url, 'Picture Source', 'picture-srcset'));
          }
          
          if (src) {
            processImageUrl(src, 'Picture Source', 'picture-src');
          }
        });

        // Extract from background images in style attributes
        $('*[style*="background"]').each((_, element) => {
          const style = $(element).attr('style');
          if (style) {
            const matches = style.match(/background(?:-image)?\s*:\s*url\s*\(['"]?([^'")]+)['"]?\)/gi);
            if (matches) {
              matches.forEach(match => {
                const urlMatch = match.match(/url\s*\(['"]?([^'")]+)['"]?\)/);
                if (urlMatch && urlMatch[1]) {
                  processImageUrl(urlMatch[1], 'Background Image', 'style-background');
                }
              });
            }
          }
        });

        // Extract from CSS in style tags
        $('style').each((_, element) => {
          const styleContent = $(element).html();
          if (styleContent) {
            const cssImagePatterns = [
              /background-image\s*:\s*url\s*\(['"]?([^'")]+)['"]?\)/gi,
              /background\s*:\s*[^;]*url\s*\(['"]?([^'")]+)['"]?\)/gi,
              /content\s*:\s*url\s*\(['"]?([^'")]+)['"]?\)/gi
            ];
            
            cssImagePatterns.forEach(pattern => {
              const matches = styleContent.match(pattern);
              if (matches) {
                matches.forEach(match => {
                  const urlMatch = match.match(/url\s*\(['"]?([^'")]+)['"]?\)/);
                  if (urlMatch && urlMatch[1]) {
                    processImageUrl(urlMatch[1], 'CSS Image', 'css-style');
                  }
                });
              }
            });
          }
        });

        // Extract from JavaScript content
        $('script').each((_, element) => {
          const scriptContent = $(element).html();
          if (scriptContent) {
            const imageUrlPatterns = [
              /['"]([^'"]*\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|avif|tiff)[^'"]*)['"](?!\s*:)/gi,
              /(?:src|image|img|photo|picture|thumbnail|avatar|banner|logo)\s*[=:]\s*['"]([^'"]+\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|avif|tiff)[^'"]*)['"](?!\s*:)/gi
            ];
            
            imageUrlPatterns.forEach(pattern => {
              const matches = scriptContent.match(pattern);
              if (matches) {
                matches.forEach(match => {
                  const urlMatch = match.match(/['"]([^'"]+)['"]/);
                  if (urlMatch && urlMatch[1] && !urlMatch[1].startsWith('data:')) {
                    processImageUrl(urlMatch[1], 'Script Image', 'javascript');
                  }
                });
              }
            });
          }
        });

        // Extract from meta tags
        $('meta[property*="image"], meta[name*="image"]').each((_, element) => {
          const content = $(element).attr('content');
          if (content) {
            processImageUrl(content, 'Meta Image', 'meta-tag');
          }
        });

        // Extract from video posters
        $('video[poster]').each((_, element) => {
          const poster = $(element).attr('poster');
          if (poster) {
            processImageUrl(poster, 'Video Poster', 'video-poster');
          }
        });

        // Extract from link icons
        $('link[rel*="icon"]').each((_, element) => {
          const href = $(element).attr('href');
          if (href) {
            processImageUrl(href, 'Icon', 'link-icon');
          }
        });

        // Extract from all data attributes
        $('*').each((_, element) => {
          const attributes = (element as any).attribs || {};
          Object.keys(attributes).forEach(attr => {
            if (attr.startsWith('data-') && attributes[attr]) {
              const value = attributes[attr];
              if (/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|avif|tiff)($|\?|#)/i.test(value)) {
                processImageUrl(value, `Data Attribute: ${attr}`, `data-${attr}`);
              }
            }
          });
        });

        // Extract from noscript fallbacks
        $('noscript').each((_, element) => {
          const noscriptContent = $(element).html();
          if (noscriptContent) {
            const $noscript = cheerio.load(noscriptContent);
            $noscript('img').each((_, img) => {
              const src = $noscript(img).attr('src');
              if (src) {
                processImageUrl(src, $noscript(img).attr('alt') || 'Noscript Image', 'noscript');
              }
            });
          }
        });

      } catch (error) {
        console.error('Error in fetch and parse:', error);
      }
    };

    // Initial fetch
    await fetchAndParse(0);
    
    // Wait and fetch again to catch lazy-loaded images
    if (waitTime > 0) {
      await fetchAndParse(waitTime);
    }

    // Group images by source for better debugging
    const sourceStats = images.reduce((acc: Record<string, number>, img) => {
      acc[img.source] = (acc[img.source] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({ 
      images: images,
      total: images.length,
      url: targetUrl,
      sourceStats: sourceStats,
      waitTime: waitTime
    });

  } catch (error) {
    console.error('Error extracting images:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error',
      details: 'Failed to extract images from the provided URL'
    }, { status: 500 });
  }
}
