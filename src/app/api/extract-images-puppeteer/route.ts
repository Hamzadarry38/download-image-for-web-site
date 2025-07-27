import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(request: NextRequest) {
  let browser = null;
  
  try {
    const { url, scrollDelay = 2000, maxScrolls = 5, waitAfterScroll = 1000 } = await request.json();

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

    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    
    // Set viewport and user agent
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Navigate to the page
    await page.goto(targetUrl, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    // Wait for initial load
    await new Promise(resolve => setTimeout(resolve, 2000));

    const images: Array<{
      src: string;
      alt: string;
      type: string;
      source: string;
      scrollPosition: number;
    }> = [];

    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'avif', 'tiff', 'tif'];
    const baseUrl = new URL(targetUrl);

    const processImageUrl = (src: string, alt: string = '', source: string = 'unknown', scrollPos: number = 0) => {
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
                               /\/pictures?\//i.test(fullUrl) ||
                               /\/media\//i.test(fullUrl) ||
                               /\/assets\//i.test(fullUrl) ||
                               /\/uploads?\//i.test(fullUrl);
        
        if (hasImagePattern || imageExtensions.includes(extension)) {
          const exists = images.some(img => img.src === fullUrl);
          if (!exists) {
            images.push({
              src: fullUrl,
              alt: alt || 'Image',
              type: extension || 'unknown',
              source: source,
              scrollPosition: scrollPos
            });
          }
        }
      } catch (error) {
        console.error('Error processing image URL:', src, error);
      }
    };

    // Function to extract images from current page state
    const extractImagesFromPage = async (scrollPosition: number) => {
      const pageImages = await page.evaluate(() => {
        const images: Array<{
          src: string;
          alt: string;
          source: string;
        }> = [];

        // Extract from img tags with all lazy loading attributes
        const imgElements = document.querySelectorAll('img');
        imgElements.forEach(img => {
          const attributes = [
            'src', 'data-src', 'data-lazy-src', 'data-original', 'data-srcset', 
            'data-lazy', 'data-echo', 'data-img', 'data-lazy-img', 'data-defer-src',
            'data-actual', 'data-hi-res-src', 'data-low-res-src', 'data-medium-res-src',
            'data-retina-src', 'data-2x', 'data-1x', 'data-mobile-src', 'data-desktop-src',
            'data-tablet-src', 'data-phone-src', 'data-full-src', 'data-thumb-src',
            'data-preview-src', 'data-zoom-src', 'data-large-src', 'data-small-src'
          ];
          
          attributes.forEach(attr => {
            const value = img.getAttribute(attr);
            if (value) {
              if (attr.includes('srcset')) {
                const srcsetUrls = value.split(',').map(s => s.trim().split(' ')[0]);
                srcsetUrls.forEach(url => {
                  if (url) {
                    images.push({
                      src: url,
                      alt: img.getAttribute('alt') || '',
                      source: `img-${attr}`
                    });
                  }
                });
              } else {
                images.push({
                  src: value,
                  alt: img.getAttribute('alt') || '',
                  source: `img-${attr}`
                });
              }
            }
          });
        });

        // Extract from background images
        const allElements = document.querySelectorAll('*');
        allElements.forEach(element => {
          const style = window.getComputedStyle(element);
          const backgroundImage = style.backgroundImage;
          
          if (backgroundImage && backgroundImage !== 'none') {
            const urlMatch = backgroundImage.match(/url\(['"]?([^'")]+)['"]?\)/);
            if (urlMatch && urlMatch[1]) {
              images.push({
                src: urlMatch[1],
                alt: 'Background Image',
                source: 'css-background'
              });
            }
          }

          // Check inline styles
          const inlineStyle = element.getAttribute('style');
          if (inlineStyle && inlineStyle.includes('background')) {
            const urlMatches = inlineStyle.match(/url\(['"]?([^'")]+)['"]?\)/g);
            if (urlMatches) {
              urlMatches.forEach(match => {
                const urlMatch = match.match(/url\(['"]?([^'")]+)['"]?\)/);
                if (urlMatch && urlMatch[1]) {
                  images.push({
                    src: urlMatch[1],
                    alt: 'Inline Background',
                    source: 'inline-background'
                  });
                }
              });
            }
          }

          // Check data attributes
          Array.from(element.attributes).forEach(attr => {
            if (attr.name.startsWith('data-') && attr.value) {
              if (/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|avif|tiff)($|\?|#)/i.test(attr.value) ||
                  attr.value.includes('/image/') || attr.value.includes('/img/') || attr.value.includes('/photo/')) {
                images.push({
                  src: attr.value,
                  alt: `Data: ${attr.name}`,
                  source: `data-${attr.name}`
                });
              }
            }
          });
        });

        // Extract from picture and source elements
        const sources = document.querySelectorAll('picture source, source');
        sources.forEach(source => {
          ['srcset', 'src', 'data-srcset', 'data-src'].forEach(attr => {
            const value = source.getAttribute(attr);
            if (value) {
              if (attr.includes('srcset')) {
                const srcsetUrls = value.split(',').map(s => s.trim().split(' ')[0]);
                srcsetUrls.forEach(url => {
                  if (url) {
                    images.push({
                      src: url,
                      alt: 'Picture Source',
                      source: `picture-${attr}`
                    });
                  }
                });
              } else {
                images.push({
                  src: value,
                  alt: 'Picture Source',
                  source: `picture-${attr}`
                });
              }
            }
          });
        });

        // Extract from video posters
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
          ['poster', 'data-poster'].forEach(attr => {
            const value = video.getAttribute(attr);
            if (value) {
              images.push({
                src: value,
                alt: 'Video Poster',
                source: `video-${attr}`
              });
            }
          });
        });

        return images;
      });

      // Process extracted images
      pageImages.forEach(img => {
        processImageUrl(img.src, img.alt, img.source, scrollPosition);
      });
    };

    // Extract images before scrolling
    await extractImagesFromPage(0);

    // Perform scrolling and extract images at each position
    for (let i = 0; i < maxScrolls; i++) {
      // Get current scroll position
      const scrollPosition = await page.evaluate(() => window.pageYOffset);
      
      // Scroll down
      await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight);
      });

      // Wait for lazy loading
      await new Promise(resolve => setTimeout(resolve, waitAfterScroll));

      // Try to trigger lazy loading by scrolling a bit more
      await page.evaluate(() => {
        window.scrollBy(0, 100);
      });

      await new Promise(resolve => setTimeout(resolve, scrollDelay));

      // Extract images at this scroll position
      const viewportHeight = await page.evaluate(() => window.innerHeight);
      await extractImagesFromPage(scrollPosition + viewportHeight * (i + 1));

      // Check if we've reached the bottom
      const isAtBottom = await page.evaluate(() => {
        return window.innerHeight + window.pageYOffset >= document.body.offsetHeight - 100;
      });

      if (isAtBottom) {
        console.log('Reached bottom of page');
        break;
      }
    }

    // Final extraction after all scrolling
    await new Promise(resolve => setTimeout(resolve, 2000));
    await extractImagesFromPage(-1); // -1 indicates final extraction

    // Group images by scroll position for analysis
    const scrollStats = images.reduce((acc: Record<number, number>, img) => {
      acc[img.scrollPosition] = (acc[img.scrollPosition] || 0) + 1;
      return acc;
    }, {});

    // Group by source
    const sourceStats = images.reduce((acc: Record<string, number>, img) => {
      acc[img.source] = (acc[img.source] || 0) + 1;
      return acc;
    }, {});

    await browser.close();

    return NextResponse.json({ 
      images: images,
      total: images.length,
      url: targetUrl,
      scrollDelay: scrollDelay,
      maxScrolls: maxScrolls,
      waitAfterScroll: waitAfterScroll,
      scrollStats: scrollStats,
      sourceStats: sourceStats,
      method: 'puppeteer-real-scroll'
    });

  } catch (error) {
    if (browser) {
      await browser.close();
    }
    
    console.error('Error extracting images with Puppeteer:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error',
      details: 'Failed to extract images using browser automation'
    }, { status: 500 });
  }
}
