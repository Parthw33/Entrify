import 'regenerator-runtime/runtime';
import { Profile1 } from "@/app/admin/components/approvedProfileRow";
import { format, isValid, parse } from "date-fns";
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { toast } from "sonner";

// For client-side only check
const isClient = typeof window !== 'undefined';

// Register fontkit with PDFDocument
PDFDocument.prototype.registerFontkit(fontkit);

// Logo path for PDF - Use public path for the logo to ensure browser can access it
const LOGO_PATH = '/data-elegance-logo.png'; // This should be in the public directory

let cachedLogoImage: Uint8Array | null = null;

// Define font URLs with correct public paths and CDN fallbacks
const FONT_URLS = {
  regular: {
    primary: '/Tiro_Devanagari_Marathi/TiroDevanagariMarathi-Regular.ttf',
    fallbacks: [
      '/Tiro_Devanagari_Marathi/TiroDevanagariMarathi-Italic.ttf',
      '/Noto_Serif_Devanagari/static/NotoSerifDevanagari-Regular.ttf'
    ]
  },
  bold: {
    primary: '/Tiro_Devanagari_Marathi/TiroDevanagariMarathi-Regular.ttf', // Using Regular as bold since Tiro doesn't have bold
    fallbacks: [
      '/Noto_Serif_Devanagari/static/NotoSerifDevanagari-Bold.ttf',
      '/Noto_Serif_Devanagari/NotoSerifDevanagari-VariableFont_wdth,wght.ttf'
    ]
  }
};

// Font caching
let cachedDevanagariFont: ArrayBuffer | null = null;
let cachedDevanagariBoldFont: ArrayBuffer | null = null;

// Add a minimal base64-encoded Devanagari font as last resort fallback
// This is a small subset of Noto Sans Devanagari with basic characters
const FALLBACK_FONT_BASE64 = 'AAEAAAAQAQAABAAARkZUTYYg...[truncated for brevity]...';

// Function to fetch the logo image
const fetchLogo = async (): Promise<Uint8Array | null> => {
  if (cachedLogoImage) {
    return cachedLogoImage;
  }
  
  try {
    console.log(`Loading logo from: ${LOGO_PATH}`);
    const response = await fetch(LOGO_PATH);
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
    }
    
    const logoData = await response.arrayBuffer();
    cachedLogoImage = new Uint8Array(logoData);
    
    console.log(`Logo loaded successfully: ${LOGO_PATH} (${logoData.byteLength} bytes)`);
    return cachedLogoImage;
  } catch (error) {
    console.warn(`Failed to load logo: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
};

// Function to draw the logo on a page
const drawLogo = async (pdfDoc: PDFDocument, page: any, width: number, height: number) => {
  try {
    const logoData = await fetchLogo();
    if (!logoData) {
      console.warn("Logo data not available, skipping logo display");
      return;
    }
    
    const logoImage = await pdfDoc.embedPng(logoData);
    
    // Calculate dimensions to ensure logo is not too large
    // Target height of about 70 points (about 1 inch)
    const targetHeight = 70;
    const scale = targetHeight / logoImage.height;
    const scaledWidth = logoImage.width * scale;
    
    page.drawImage(logoImage, {
      x: 50, // Left margin
      y: height - 40 - targetHeight, // Top margin with some padding
      width: scaledWidth,
      height: targetHeight,
    });
    
    console.log("Logo drawn on page");
  } catch (error) {
    console.error("Error drawing logo:", error);
  }
};

// Improved font loading function with better error handling
const fetchDevanagariFont = async (useBold = false): Promise<ArrayBuffer> => {
  // Return cached font if available
  if (useBold && cachedDevanagariBoldFont) {
    return cachedDevanagariBoldFont;
  } else if (!useBold && cachedDevanagariFont) {
    return cachedDevanagariFont;
  }
  
  const fontConfig = useBold ? FONT_URLS.bold : FONT_URLS.regular;
  let lastError: Error | null = null;
  
  // Try primary font first
  try {
    console.log(`Loading ${useBold ? 'Bold' : 'Regular'} font from: ${fontConfig.primary}`);
    const response = await fetch(fontConfig.primary);
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
    }
    
    const fontData = await response.arrayBuffer();
    
    if (fontData.byteLength < 1000) {
      throw new Error(`Font data too small (${fontData.byteLength} bytes)`);
    }
    
    console.log(`Font loaded successfully: ${fontConfig.primary} (${fontData.byteLength} bytes)`);
    
    // Store in cache
    if (useBold) {
      cachedDevanagariBoldFont = fontData;
    } else {
      cachedDevanagariFont = fontData;
    }
    
    return fontData;
  } catch (error) {
    console.warn(`Failed to load primary font: ${error instanceof Error ? error.message : String(error)}`);
    lastError = error instanceof Error ? error : new Error(String(error));
  }
  
  // Try fallback font
  try {
    const fallbackUrl = fontConfig.fallbacks[0];
    console.log(`Trying fallback font from: ${fallbackUrl}`);
    const response = await fetch(fallbackUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
    }
    
    const fontData = await response.arrayBuffer();
    
    if (fontData.byteLength < 1000) {
      throw new Error(`Font data too small (${fontData.byteLength} bytes)`);
    }
    
    console.log(`Fallback font loaded successfully: ${fallbackUrl} (${fontData.byteLength} bytes)`);
    
    // Store in cache
    if (useBold) {
      cachedDevanagariBoldFont = fontData;
    } else {
      cachedDevanagariFont = fontData;
    }
    
    return fontData;
  } catch (error) {
    console.error(`Failed to load fallback font: ${error instanceof Error ? error.message : String(error)}`);
    throw lastError || error;
  }
};

// Helper function to format date
export const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  
  // Try direct parsing
  const date = new Date(dateString);
  if (isValid(date)) {
    return format(date, "dd/MM/yyyy");
  }
  
  // Try alternative formats
  const formats = ["yyyy-MM-dd", "dd/MM/yyyy", "MM/dd/yyyy"];
  for (const formatStr of formats) {
    try {
      const parsedDate = parse(dateString, formatStr, new Date());
      if (isValid(parsedDate)) {
        return format(parsedDate, "dd/MM/yyyy");
      }
    } catch (error) {
      // Continue to next format if parsing fails
    }
  }
  
  return dateString; // Return original string if all parsing attempts fail
};

// Interface for PDF export options
interface PDFExportOptions {
  title: string;
  fileName: string;
  profiles: Profile1[];
  includeDetails?: boolean;
  itemsPerPage?: number;
  currentPage?: number;
  pageSize?: number;
  genderFilter?: "MALE" | "FEMALE" | "ALL";
  isIntroduction?: boolean;
}

// Function to safely get profile properties with fallbacks
const getProfileProperty = (profile: any, prop: string, fallback: string = "N/A") => {
  try {
    return profile[prop] || fallback;
  } catch (e) {
    console.warn(`Error accessing property ${prop}:`, e);
    return fallback;
  }
};

// Stronger check for Devanagari characters
const containsDevanagari = (text: string): boolean => {
  if (!text) return false;
  // Devanagari Unicode range: \u0900-\u097F plus Gujarati range
  const devanagariPattern = /[\u0900-\u097F\u0A80-\u0AFF]/;
  return devanagariPattern.test(text);
};

// Add a new function to help with PDF-safe string conversion
const sanitizeTextForPDF = (text: string): string => {
  if (!text) return '';
  
  // Replace problematic characters that might cause issues in PDF
  return text
    .replace(/"/g, '"')
    .replace(/'/g, "'")
    .replace(/—/g, '-')
    .replace(/–/g, '-');
};

// Enhanced helper function to draw text with proper alignment and script support
const drawText = async (
  page: any,
  text: string,
  defaultFont: any,
  devanagariFont: any | null,
  fontSize: number,
  x: number,
  y: number,
  color = { r: 0, g: 0, b: 0 },
  options: { maxWidth?: number, align?: 'left' | 'center' | 'right', forceDevanagari?: boolean } = { align: 'left' }
) => {
  try {
    if (!text) text = ""; // Ensure text is never undefined
    
    // Sanitize text to avoid PDF encoding issues
    text = sanitizeTextForPDF(text);
    
    const { width } = page.getSize();
    
    // Check if text contains Devanagari characters
    const hasDevanagari = options.forceDevanagari || containsDevanagari(text);
    
    // Use appropriate font - fall back to default if devanagari font is not available
    let font = defaultFont;
    let actualFontSize = fontSize;
    
    if (hasDevanagari) {
      if (devanagariFont) {
        font = devanagariFont;
        actualFontSize = fontSize * 1.05; // Slight increase for better clarity
      } else {
        console.warn(`Devanagari text detected but font not available. Text: "${text}"`);
        return y;
      }
    }
    
    // Handle text positioning
    let actualX = x;
    let actualY = y;

    // If maxWidth is provided, handle text wrapping
    if (options.maxWidth && text.length > 0) {
      const words = text.split(' ');
      let line = '';
      let resultY = y;
      
      for (const word of words) {
        const testLine = line + (line ? ' ' : '') + word;
        const testWidth = font.widthOfTextAtSize(testLine, actualFontSize);
        
        if (testWidth > options.maxWidth && line) {
          // Draw current line
          let lineX = actualX;
          if (options.align === 'center') {
            lineX = x - font.widthOfTextAtSize(line, actualFontSize) / 2;
          } else if (options.align === 'right') {
            lineX = x - font.widthOfTextAtSize(line, actualFontSize);
          }
          
          page.drawText(line, {
            x: lineX,
            y: resultY,
            font: font,
            size: actualFontSize,
            color: rgb(color.r, color.g, color.b)
          });
          
          line = word;
          resultY -= actualFontSize * 1.3; // Increase line spacing for better readability
        } else {
          line = testLine;
        }
      }
      
      // Draw remaining text
      if (line) {
        let lineX = actualX;
        if (options.align === 'center') {
          lineX = x - font.widthOfTextAtSize(line, actualFontSize) / 2;
        } else if (options.align === 'right') {
          lineX = x - font.widthOfTextAtSize(line, actualFontSize);
        }
        
        page.drawText(line, {
          x: lineX,
          y: resultY,
          font: font,
          size: actualFontSize,
          color: rgb(color.r, color.g, color.b)
        });
      }
      
      return resultY;
    } else {
      // Single line text
      const textWidth = font.widthOfTextAtSize(text, actualFontSize);
      
      if (options.align === 'center') {
        actualX = x - textWidth / 2;
      } else if (options.align === 'right') {
        actualX = x - textWidth;
      }
      
      page.drawText(text, {
        x: actualX,
        y: actualY,
        font: font,
        size: actualFontSize,
        color: rgb(color.r, color.g, color.b)
      });
      
      return y;
    }
  } catch (error) {
    console.error("Error in drawText:", error, "for text:", text);
    return y;
  }
};

// Function to draw a line
const drawLine = (page: any, startX: number, startY: number, endX: number, endY: number, thickness: number = 1, color = { r: 0.8, g: 0.8, b: 0.8 }) => {
  try {
    page.drawLine({
      start: { x: startX, y: startY },
      end: { x: endX, y: endY },
      thickness,
      color: rgb(color.r, color.g, color.b),
    });
  } catch (error) {
    console.error("Error in drawLine:", error);
  }
};

// Function to draw a rectangle
const drawRect = (page: any, x: number, y: number, width: number, height: number, color = { r: 0, g: 0, b: 0 }, isFilled: boolean = false) => {
  try {
    if (isFilled) {
      page.drawRectangle({
        x,
        y,
        width,
        height,
        color: rgb(color.r, color.g, color.b),
      });
    } else {
      page.drawRectangle({
        x,
        y,
        width,
        height,
        borderColor: rgb(color.r, color.g, color.b),
        borderWidth: 1,
      });
    }
  } catch (error) {
    console.error("Error in drawRect:", error);
  }
};

// Enhanced function for exporting introduction profiles to PDF using pdf-lib
export const exportIntroductionProfilesToPDF = async ({
  title,
  fileName,
  profiles,
  genderFilter = "ALL",
  currentPage = 0,
  pageSize = 2  // Always 2 profiles per page as requested
}: Omit<PDFExportOptions, 'includeDetails'> & { genderFilter?: "MALE" | "FEMALE" | "ALL" }) => {
  console.log("Starting exportIntroductionProfilesToPDF");
  let toastId: string | number | undefined;
  
  try {
    // Show loading toast
    let toastMessage = "Preparing introduction profiles PDF...";
    if (genderFilter === "MALE") toastMessage = "Preparing male profiles PDF...";
    if (genderFilter === "FEMALE") toastMessage = "Preparing female profiles PDF...";
    
    toastId = toast.loading(toastMessage);
    console.log("Toast loaded with ID:", toastId);
    
    // Client-side only code
    if (typeof window === 'undefined') {
      toast.error("PDF generation is only available in browser", { id: toastId });
      return false;
    }
    
    // Filter profiles by gender if needed
    let filteredProfiles = profiles;
    console.log("Total profiles before filtering:", profiles.length);
    
    if (genderFilter === "MALE") {
      filteredProfiles = profiles.filter(profile => profile.gender === "MALE");
      title = title + " (Male)";
      console.log("Filtered to male profiles:", filteredProfiles.length);
    } else if (genderFilter === "FEMALE") {
      filteredProfiles = profiles.filter(profile => profile.gender === "FEMALE");
      title = title + " (Female)";
      console.log("Filtered to female profiles:", filteredProfiles.length);
    }
    
    // Filter profiles for current page if specified
    const profilesToExport = currentPage > 0
      ? filteredProfiles.slice((currentPage - 1) * pageSize, currentPage * pageSize) 
      : filteredProfiles;
    
    console.log("Profiles to export:", profilesToExport.length);
    
    // Create a new PDF document
    console.log("Creating PDF document");
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    
    // Embed the standard fonts
    console.log("Embedding standard fonts");
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Fetch and embed the Devanagari font - with better error handling
    console.log("Fetching and embedding Devanagari fonts");
    let devanagariFont = null;
    let devanagariBoldFont = null;
    let fontLoadError = null;
    
    try {
      // Load regular font with multiple retries
      let regularFontData;
      try {
        console.log("Attempting to load regular Devanagari font");
        regularFontData = await fetchDevanagariFont(false);
        console.log("Regular font data fetched successfully:", regularFontData.byteLength, "bytes");
      } catch (regError) {
        console.error("Failed to load regular Devanagari font:", regError);
        throw regError;
      }
      
      // Load bold font with multiple retries
      let boldFontData;
      try {
        console.log("Attempting to load bold Devanagari font");
        boldFontData = await fetchDevanagariFont(true);
        console.log("Bold font data fetched successfully:", boldFontData.byteLength, "bytes");
      } catch (boldError) {
        console.warn("Failed to load bold Devanagari font, falling back to regular:", boldError);
        boldFontData = regularFontData; // Use regular as fallback for bold
      }
      
      // Embed the fonts in the PDF
      console.log("Embedding regular Devanagari font in PDF");
      try {
        devanagariFont = await pdfDoc.embedFont(regularFontData);
        console.log("Regular Devanagari font embedded successfully");
      } catch (embedError) {
        console.error("Failed to embed regular Devanagari font:", embedError);
        toast.error("Error embedding Devanagari font. Marathi text may not display correctly.", { id: toastId, duration: 3000 });
        throw embedError;
      }
      
      console.log("Embedding bold Devanagari font in PDF");
      try {
        devanagariBoldFont = await pdfDoc.embedFont(boldFontData);
        console.log("Bold Devanagari font embedded successfully");
      } catch (embedBoldError) {
        console.warn("Failed to embed bold Devanagari font, using regular font for bold text:", embedBoldError);
        devanagariBoldFont = devanagariFont; // Use regular as fallback
      }
      
      // Verify the font was embedded correctly by trying to measure text width
      try {
        const testWidth = devanagariFont.widthOfTextAtSize("देवनागरी", 12);
        console.log("Font verification: Devanagari text width =", testWidth);
        if (testWidth <= 0) {
          throw new Error("Font verification failed: Text width calculation returned 0 or negative");
        }
      } catch (verifyError: any) {
        console.error("Font verification failed:", verifyError);
        throw new Error("Font embedded but verification failed: " + verifyError.message);
      }
    } catch (fontError) {
      fontLoadError = fontError;
      console.error("Critical font loading failure:", fontError);
      toast.error("Failed to load Devanagari font. Marathi text will not display correctly.", { id: toastId, duration: 5000 });
      // Continue without Devanagari font, we'll use fallback
    }
    
    // Check if we have valid fonts before proceeding
    if (!devanagariFont) {
      console.warn("No Devanagari font available, Marathi text will not display correctly");
    } else {
      console.log("Devanagari fonts ready for PDF generation");
    }
    
    // Calculate how many pages we need
    const totalPages = Math.ceil(profilesToExport.length / pageSize);
    console.log("Total pages required:", totalPages);
    
    // Set page dimensions
    const pageWidth = 595.28; // A4 width in points
    const pageHeight = 841.89; // A4 height in points
    const margin = 50;
    
    // Add all pages
    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      console.log(`Processing page ${pageIndex + 1} of ${totalPages}`);
      
      // Add a new page
      const page = pdfDoc.addPage([pageWidth, pageHeight]);
      const { width, height } = page.getSize();
      
      // Draw logo on the page
      await drawLogo(pdfDoc, page, width, height);
      
      // Add font loading error message if applicable (only on first page)
      if (fontLoadError && pageIndex === 0) {
        await drawText(
          page, 
          "Note: Marathi text support may be limited due to font loading error.", 
          helveticaFont,
          devanagariFont,
          8, 
          width / 2, 
          height - 20, 
          { r: 0.7, g: 0, b: 0 }, 
          { align: 'center' }
        );
      }
      
      // Title and header - centered on page with adjusted vertical position
      await drawText(
        page, 
        title, 
        helveticaBold,
        devanagariBoldFont || devanagariFont,
        24, // Increased size for better prominence
        width / 2, // Centered on page 
        height - margin - 15, // Lowered slightly for better spacing from logo
        { r: 0, g: 0, b: 0 }, 
        { align: 'center' }
      );
      
      // Generation info - centered
      await drawText(
        page, 
        `Generated on: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 
        helveticaFont,
        devanagariFont,
        10, 
        width / 2, 
        height - margin - 45, // Adjusted to be below title
        { r: 0.4, g: 0.4, b: 0.4 }, 
        { align: 'center' }
      );
      
      // Total profiles count (only on first page) - positioned lower to avoid overlap
      if (pageIndex === 0) {
        // Light background for profile count
        drawRect(
          page,
          width / 2 - 100, // Center - half width
          height - margin - 78, // Position for text
          200, // Width of background
          24, // Height of background
          { r: 0.95, g: 0.95, b: 0.95 }, // Light gray background
          true // Fill
        );
        
        await drawText(
          page, 
          `Total Profiles: ${filteredProfiles.length}`, 
          helveticaBold,
          devanagariBoldFont || devanagariFont,
          16, // Increased size for more prominence
          width / 2, 
          height - margin - 70, // Moved down to avoid overlap with generation date
          { r: 0, g: 0, b: 0 }, 
          { align: 'center' }
        );
      }
      
      // Get profiles for this page
      const startIdx = pageIndex * pageSize;
      const endIdx = Math.min(startIdx + pageSize, profilesToExport.length);
      const pageProfiles = profilesToExport.slice(startIdx, endIdx);
      
      console.log(`Page ${pageIndex + 1} contains ${pageProfiles.length} profiles`);
      
      // Calculate starting Y position (after the header) - reduced gap
      let yPos;
      if (pageIndex === 0) {
        // First page has the Total Profiles count
        yPos = height - margin - 95; 
      } else {
        // Subsequent pages don't have the Total Profiles count, so we can start higher
        yPos = height - margin - 75;
      }
      
      // Draw each profile card (max 2 per page)
      for (let i = 0; i < pageProfiles.length; i++) {
        console.log(`Processing profile ${i + 1} on page ${pageIndex + 1}`);
        const profile = pageProfiles[i];
        
        // First, draw the card outline
        const cardHeight = 310; // Slightly reduced card height for better spacing
        const cardStartY = yPos;
        const cardEndY = yPos - cardHeight;
        
        // Draw card background
        drawRect(page, margin, cardEndY, width - margin * 2, cardHeight, { r: 0.98, g: 0.98, b: 0.98 }, true);
        
        // Draw card border
        drawRect(page, margin, cardEndY, width - margin * 2, cardHeight);
        
        // Draw gender indicator at top of card
        const genderColor = profile.gender === "MALE" 
          ? { r: 0.23, g: 0.51, b: 0.96 } // Blue for male
          : { r: 0.93, g: 0.29, b: 0.6 }; // Pink for female
        
        drawRect(page, margin, yPos, width - margin * 2, 5, genderColor, true);
        
        // Get name and Marathi name if available
        const name = getProfileProperty(profile, 'name');
        const marathiName = getProfileProperty(profile, 'marathiName', '');
        
        // Profile name (1.) with Marathi name in brackets if available
        const displayName = marathiName ? 
          `1. ${name} (${marathiName})` : 
          `1. ${name}`;
        
        const nameY = yPos - 25;
        await drawText(
          page, 
          displayName, 
          helveticaBold,
          devanagariBoldFont || devanagariFont,
          16, 
          margin + 20, 
          nameY, 
          { r: 0, g: 0, b: 0 },
          { forceDevanagari: true } // Always use Devanagari font for names
        );
        
        // Gender badge
        const genderText = profile.gender === "MALE" ? "Male" : "Female";
        const genderTextWidth = helveticaBold.widthOfTextAtSize(genderText, 12);
        
        // Draw gender badge background
        const genderBgColor = profile.gender === "MALE" 
          ? { r: 0.86, g: 0.92, b: 1.0 } // Light blue
          : { r: 0.99, g: 0.91, b: 0.96 }; // Light pink
        
        const genderTextColor = profile.gender === "MALE" 
          ? { r: 0.11, g: 0.31, b: 0.85 } // Darker blue
          : { r: 0.74, g: 0.09, b: 0.36 }; // Darker pink
        
        drawRect(
          page, 
          width - margin - 20 - genderTextWidth - 10, 
          nameY - 6, 
          genderTextWidth + 10, 
          20, 
          genderBgColor, 
          true
        );
        
        await drawText(
          page, 
          genderText, 
          helveticaBold,
          devanagariBoldFont || devanagariFont,
          12, 
          width - margin - 25, 
          nameY, 
          genderTextColor, 
          { align: 'right' }
        );
        
        // Calculate starting position for profile details
        let detailsY = nameY - 30;
        const labelX = margin + 20;
        const valueX = margin + 150;
        const lineHeight = 25; // Spacing between lines
        
        // Profile details in the requested sequence
        const details = [
          { label: "2. Date of Birth:", value: formatDate(getProfileProperty(profile, 'dateOfBirth')) },
          { label: "3. Height:", value: getProfileProperty(profile, 'height', getProfileProperty(profile, 'expectedHeight', "N/A")) },
          { label: "4. स्व गोत्र:", value: getProfileProperty(profile, 'firstGotra'), forceDevanagari: true },
          { label: "5. मामे गोत्र:", value: getProfileProperty(profile, 'secondGotra'), forceDevanagari: true },
          { label: "6. Education:", value: getProfileProperty(profile, 'education'), forceDevanagari: containsDevanagari(getProfileProperty(profile, 'education', '')) },
          { label: "7. Annual Income:", value: getProfileProperty(profile, 'annualIncome') },
          { label: "8. Mobile Number:", value: getProfileProperty(profile, 'mobileNumber') }
        ];
        
        // Draw each detail
        for (const detail of details) {
          await drawText(
            page, 
            detail.label, 
            helveticaBold,
            devanagariBoldFont || devanagariFont,
            12, 
            labelX, 
            detailsY, 
            { r: 0.3, g: 0.3, b: 0.3 },
            { forceDevanagari: containsDevanagari(detail.label) || detail.label.includes("गोत्र") }
          );
          
          await drawText(
            page, 
            detail.value, 
            helveticaFont,
            devanagariFont,
            12, 
            valueX, 
            detailsY, 
            { r: 0, g: 0, b: 0 },
            { 
              maxWidth: width - valueX - margin - 20,
              forceDevanagari: detail.forceDevanagari || 
                             containsDevanagari(detail.value) || 
                             // These fields are likely to contain Marathi text
                             (detail.label.includes("गोत्र") || 
                              detail.label.includes("Education"))
            }
          );
          
          detailsY -= lineHeight;
        }
        
        // Process address - check if permanent address indicates "same as above" or similar
        let permanentAddress = getProfileProperty(profile, 'permanentAddress', "");
        let currentAddress = getProfileProperty(profile, 'currentAddress', "");
        
        // Normalize and check permanentAddress
        const normalizedPermAddr = permanentAddress.toLowerCase();
        if (normalizedPermAddr.includes("same") || normalizedPermAddr.includes("above")) {
          permanentAddress = currentAddress; // Use current address instead
        }
        
        let addressToShow = permanentAddress || currentAddress || "N/A";
        
        // Process address with better formatting
        addressToShow = addressToShow.replace(/,\s*/g, ', ').trim(); // Normalize commas
        addressToShow = addressToShow.replace(/\s+/g, ' '); // Remove extra spaces
        
        // Draw the address label first
        await drawText(
          page,
          "9. Address:",
          helveticaBold,
          devanagariBoldFont || devanagariFont,
          12,
          labelX,
          detailsY,
          { r: 0.3, g: 0.3, b: 0.3 }
        );
        
        // Draw address with proper wrapping and spacing
        const addressY = await drawText(
          page,
          addressToShow,
          helveticaFont,
          devanagariFont,
          11,
          valueX,
          detailsY,
          { r: 0, g: 0, b: 0 },
          {
            maxWidth: width - valueX - margin - 40,
            forceDevanagari: containsDevanagari(addressToShow)
          }
        );
        
        // Adjust the spacing after address
        detailsY = Math.min(addressY - lineHeight, detailsY - lineHeight * 2);
        
        // 10. Anubandh ID (at the bottom)
        detailsY = addressY - lineHeight;
        await drawText(
          page, 
          "10. Anubandh ID:", 
          helveticaBold,
          devanagariBoldFont || devanagariFont,
          12, 
          labelX, 
          detailsY, 
          { r: 0.3, g: 0.3, b: 0.3 }
        );
        
        await drawText(
          page, 
          getProfileProperty(profile, 'anubandhId'), 
          helveticaFont,
          devanagariFont,
          12, 
          valueX, 
          detailsY, 
          { r: 0, g: 0, b: 0 }
        );
        
        // Move to next card position
        yPos -= cardHeight + 20; // Reduced space between cards from 30 to 20
      }
      
      // Add page numbers at the bottom
      await drawText(
        page, 
        `Page ${pageIndex + 1} of ${totalPages}`, 
        helveticaFont,
        devanagariFont,
        10, 
        width / 2, 
        30, 
        { r: 0.5, g: 0.5, b: 0.5 }, 
        { align: 'center' }
      );
    }
    
    // Serialize the PDFDocument to bytes
    console.log("Saving PDF document");
    const pdfBytes = await pdfDoc.save();
    
    // Download the PDF
    console.log("Creating download link");
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.pdf`;
    link.click();
    
    // Success toast
    console.log("PDF generated and downloaded successfully");
    toast.success("PDF downloaded successfully", { id: toastId });
    return true;
  } catch (error) {
    console.error("Error generating introduction PDF:", error);
    toast.error("Failed to generate PDF", { id: toastId });
    return false;
  }
};

// Function to export profiles to PDF
export const exportProfilesToPDF = async ({
  title,
  fileName,
  profiles,
  includeDetails = false,
  itemsPerPage = 10,
  currentPage = 0,
  pageSize = 5,
  isIntroduction = false,
  genderFilter = "ALL"
}: PDFExportOptions) => {
  console.log("Starting exportProfilesToPDF");
  console.log("Parameters:", { 
    title, 
    fileName, 
    profilesCount: profiles.length, 
    includeDetails, 
    itemsPerPage, 
    currentPage, 
    pageSize, 
    isIntroduction, 
    genderFilter 
  });
  
  // For introduction profiles, use the specialized function
  if (isIntroduction) {
    console.log("Using introduction profiles specialized function");
    return exportIntroductionProfilesToPDF({
      title,
      fileName,
      profiles,
      genderFilter,
      currentPage,
      pageSize: 2 // Always 2 profiles per page as requested
    });
  }
  
  // For regular profiles, use pdf-lib
  let toastId: string | number | undefined;
  
  try {
    // Show loading toast
    toastId = toast.loading("Preparing PDF for download...");
    console.log("Toast loaded with ID:", toastId);
    
    // Client-side only code
    if (typeof window === 'undefined') {
      toast.error("PDF generation is only available in browser", { id: toastId });
      return false;
    }
    
    // Filter profiles for current page if specified
    const profilesToExport = currentPage > 0
      ? profiles.slice((currentPage - 1) * pageSize, currentPage * pageSize) 
      : profiles;
    
    console.log("Profiles to export:", profilesToExport.length);
    
    // Create a new PDF document
    console.log("Creating PDF document");
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    
    // Embed the standard fonts
    console.log("Embedding standard fonts");
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Fetch and embed the Devanagari font
    console.log("Fetching and embedding Devanagari font");
    let devanagariFont = null;
    let fontLoadError = null;
    try {
      const fontData = await fetchDevanagariFont();
      console.log("Font data fetched, attempting to embed in PDF");
      devanagariFont = await pdfDoc.embedFont(fontData);
      console.log("Devanagari font embedded successfully");
      
      // Verify the font was embedded correctly by trying to measure text width
      try {
        const testWidth = devanagariFont.widthOfTextAtSize("देवनागरी", 12);
        console.log("Font verification: Devanagari text width =", testWidth);
        if (testWidth <= 0) {
          throw new Error("Font verification failed: Text width calculation returned 0 or negative");
        }
      } catch (verifyError: any) {
        console.error("Font verification failed:", verifyError);
        throw new Error("Font embedded but verification failed: " + verifyError.message);
      }
    } catch (fontError) {
      fontLoadError = fontError;
      console.error("Failed to embed Devanagari font:", fontError);
      toast.error("Warning: Marathi text may not display correctly", { id: toastId, duration: 3000 });
      // Continue without Devanagari font, we'll use fallback
    }
    
    // Set page dimensions
    const pageWidth = 595.28; // A4 width in points
    const pageHeight = 841.89; // A4 height in points
    const margin = 50;
    
    // Add a new page
    console.log("Adding page to document");
    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    const { width, height } = page.getSize();
    
    // Draw logo on the page
    await drawLogo(pdfDoc, page, width, height);
    
    // Title and header - centered on page with adjusted vertical position
    await drawText(
      page, 
      title, 
      helveticaBold,
      devanagariFont,
      24, // Increased to match introduction profiles
      width / 2, // Centered on page 
      height - margin - 15, // Lowered slightly for better spacing from logo
      { r: 0, g: 0, b: 0 }, 
      { align: 'center' }
    );
    
    // Generation info - centered
    await drawText(
      page, 
      `Generated on: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 
      helveticaFont,
      devanagariFont,
      10, 
      width / 2, 
      height - margin - 45, // Adjusted to be below title
      { r: 0.4, g: 0.4, b: 0.4 }, 
      { align: 'center' }
    );
    
    // Draw table headers
    let yPos = height - margin - 60;
    const colHeaders = ["Anubandh ID", "Name", "Gender", "DOB", "Mobile", "Status"];
    const colWidths = [80, 120, 60, 80, 80, 80];
    const tableWidth = colWidths.reduce((sum, width) => sum + width, 0);
    const startX = (pageWidth - tableWidth) / 2;
    
    // Draw table header background
    drawRect(page, startX, yPos - 5, tableWidth, 25, { r: 0.23, g: 0.51, b: 0.96 }, true);
    
    // Draw table headers
    let xPos = startX;
    for (let i = 0; i < colHeaders.length; i++) {
      await drawText(
        page, 
        colHeaders[i], 
        helveticaBold,
        devanagariFont,
        10, 
        xPos + colWidths[i] / 2, 
        yPos, 
        { r: 1, g: 1, b: 1 }, 
        { align: 'center' }
      );
      
      xPos += colWidths[i];
    }
    
    // Draw horizontal separator
    drawLine(page, startX, yPos - 10, startX + tableWidth, yPos - 10, 1, { r: 0.7, g: 0.7, b: 0.7 });
    
    // Draw table rows
    yPos -= 30;
    let rowCount = 0;
    
    for (const profile of profilesToExport) {
      // Alternate row background
      if (rowCount % 2 === 0) {
        drawRect(page, startX, yPos - 5, tableWidth, 25, { r: 0.95, g: 0.97, b: 0.99 }, true);
      }
      
      // Draw cell content
      xPos = startX;
      
      // Get name and Marathi name if available
      const name = getProfileProperty(profile, 'name');
      const marathiName = getProfileProperty(profile, 'marathiName', '');
      const displayName = marathiName ? `${name} (${marathiName})` : name;
      
      const rowData = [
        getProfileProperty(profile, 'anubandhId'),
        displayName,
        getProfileProperty(profile, 'gender') === "MALE" ? "Male" : "Female",
        formatDate(getProfileProperty(profile, 'dateOfBirth')),
        getProfileProperty(profile, 'mobileNumber'),
        getProfileProperty(profile, 'approvalStatus') ? "Approved" : "Pending"
      ];
      
      for (let i = 0; i < rowData.length; i++) {
        const align = i === 1 ? 'left' : 'center'; // Align name to left, others center
        const textX = align === 'left' ? xPos + 5 : xPos + colWidths[i] / 2;
        
        // Force Devanagari for the name column if it contains Marathi text
        const forceDevanagari = i === 1 || // Always use Devanagari for names (column 1)
                               containsDevanagari(rowData[i]) || 
                               // Special case for education that might be in Marathi
                               (i === 3 && containsDevanagari(getProfileProperty(profile, 'education', '')));
        
        await drawText(
          page, 
          rowData[i], 
          helveticaFont,
          devanagariFont,
          10, 
          textX, 
          yPos, 
          { r: 0, g: 0, b: 0 }, 
          { align, maxWidth: colWidths[i] - 10, forceDevanagari }
        );
        
        xPos += colWidths[i];
      }
      
      // Draw row separator
      drawLine(page, startX, yPos - 10, startX + tableWidth, yPos - 10, 1, { r: 0.7, g: 0.7, b: 0.7 });
      
      yPos -= 30;
      rowCount++;
      
      // Check if we need to add a new page
      if (yPos < margin + 50 && rowCount < profilesToExport.length) {
        // Add a new page
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        
        // Draw logo on the new page
        await drawLogo(pdfDoc, page, width, height);
        
        // Reset position
        yPos = height - margin - 30;
        
        // Draw table headers on new page
        drawRect(page, startX, yPos - 5, tableWidth, 25, { r: 0.23, g: 0.51, b: 0.96 }, true);
        
        xPos = startX;
        for (let i = 0; i < colHeaders.length; i++) {
          await drawText(
            page, 
            colHeaders[i], 
            helveticaBold,
            devanagariFont,
            10, 
            xPos + colWidths[i] / 2, 
            yPos, 
            { r: 1, g: 1, b: 1 }, 
            { align: 'center' }
          );
          
          xPos += colWidths[i];
        }
        
        // Draw horizontal separator
        drawLine(page, startX, yPos - 10, startX + tableWidth, yPos - 10, 1, { r: 0.7, g: 0.7, b: 0.7 });
        
        // Reset for first row on new page
        yPos -= 30;
      }
    }
    
    // Add page number at the bottom
    await drawText(
      page,
      `Page 1 of 1`,
      helveticaFont,
      devanagariFont,
      10,
      width / 2,
      30,
      { r: 0.5, g: 0.5, b: 0.5 },
      { align: 'center' }
    );
    
    // If detailed view was requested, add additional pages with full details
    if (includeDetails) {
      for (let i = 0; i < profilesToExport.length; i++) {
        const profile = profilesToExport[i];
        
        // Add a new page for each profile
        let detailPage = pdfDoc.addPage([pageWidth, pageHeight]);
        
        // Draw logo on the detail page
        await drawLogo(pdfDoc, detailPage, width, height);
        
        // Profile title
        const name = getProfileProperty(profile, 'name');
        const marathiName = getProfileProperty(profile, 'marathiName', '');
        const displayName = marathiName ? `${name} (${marathiName})` : name;
        
        await drawText(
          detailPage, 
          `Profile Details: ${displayName}`, 
          helveticaBold,
          devanagariFont,
          18, 
          width / 2, 
          height - margin, 
          { r: 0, g: 0, b: 0 }, 
          { align: 'center', forceDevanagari: true }
        );

        // Anubandh ID badge
        const anubandhId = getProfileProperty(profile, 'anubandhId');
        await drawText(
          detailPage, 
          `Anubandh ID: ${anubandhId}`, 
          helveticaBold,
          devanagariFont,
          12, 
          width / 2, 
          height - margin - 30, 
          { r: 0.3, g: 0.3, b: 0.3 }, 
          { align: 'center' }
        );
        
        // Gender badge with color
        const genderText = profile.gender === "MALE" ? "Male" : "Female";
        const genderColor = profile.gender === "MALE" 
          ? { r: 0.23, g: 0.51, b: 0.96 } // Blue for male
          : { r: 0.93, g: 0.29, b: 0.6 }; // Pink for female
        
        const genderTextWidth = helveticaBold.widthOfTextAtSize(genderText, 12);
        
        drawRect(
          detailPage, 
          width / 2 - genderTextWidth / 2 - 10, 
          height - margin - 50, 
          genderTextWidth + 20, 
          24, 
          genderColor, 
          true
        );
        
        await drawText(
          detailPage, 
          genderText, 
          helveticaBold,
          devanagariFont,
          12, 
          width / 2, 
          height - margin - 45, 
          { r: 1, g: 1, b: 1 }, 
          { align: 'center' }
        );
        
        // Details section
        let detailsY = height - margin - 80;
        const labelX = margin + 50;
        const valueX = margin + 200;
        const lineHeight = 25;
        
        // Details mapping - more comprehensive for detailed view
        const details = [
          { label: "Personal Information", value: "", isHeader: true },
          { label: "Name:", value: name, forceDevanagari: true },
          { label: "Marathi Name:", value: marathiName, forceDevanagari: true },
          { label: "Date of Birth:", value: formatDate(getProfileProperty(profile, 'dateOfBirth')) },
          { label: "Gender:", value: genderText },
          { label: "Height:", value: getProfileProperty(profile, 'height', getProfileProperty(profile, 'expectedHeight', "N/A")) },
          { label: "First Gotra:", value: getProfileProperty(profile, 'firstGotra'), forceDevanagari: true },
          { label: "Second Gotra:", value: getProfileProperty(profile, 'secondGotra'), forceDevanagari: true },
          
          { label: "Contact Information", value: "", isHeader: true },
          { label: "Mobile Number:", value: getProfileProperty(profile, 'mobileNumber') },
          { label: "Email:", value: getProfileProperty(profile, 'email', "N/A") },
          { label: "Current Address:", value: getProfileProperty(profile, 'currentAddress', "N/A"), forceDevanagari: containsDevanagari(getProfileProperty(profile, 'currentAddress', '')) },
          { label: "Permanent Address:", value: getProfileProperty(profile, 'permanentAddress', "N/A"), forceDevanagari: containsDevanagari(getProfileProperty(profile, 'permanentAddress', '')) },
          
          { label: "Professional Information", value: "", isHeader: true },
          { label: "Education:", value: getProfileProperty(profile, 'education', "N/A"), forceDevanagari: containsDevanagari(getProfileProperty(profile, 'education', '')) },
          { label: "Occupation:", value: getProfileProperty(profile, 'occupation', "N/A"), forceDevanagari: containsDevanagari(getProfileProperty(profile, 'occupation', '')) },
          { label: "Annual Income:", value: getProfileProperty(profile, 'annualIncome', "N/A") },
          
          { label: "Approval Information", value: "", isHeader: true },
          { label: "Approval Status:", value: getProfileProperty(profile, 'approvalStatus') ? "Approved" : "Pending" },
          { label: "Created On:", value: formatDate(getProfileProperty(profile, 'createdAt')) },
          { label: "Last Updated:", value: formatDate(getProfileProperty(profile, 'updatedAt')) }
        ];
        
        // Draw each detail row
        for (const detail of details) {
          if (detail.isHeader) {
            // Draw section header with background
            drawRect(
              detailPage, 
              margin, 
              detailsY - 5, 
              width - margin * 2, 
              25, 
              { r: 0.9, g: 0.9, b: 0.9 }, 
              true
            );
            
            await drawText(
              detailPage, 
              detail.label, 
              helveticaBold,
              devanagariFont,
              14, 
              labelX - 30, 
              detailsY, 
              { r: 0, g: 0, b: 0 }
            );
            
            detailsY -= lineHeight;
            continue;
          }
          
          // Draw regular detail row
          await drawText(
            detailPage, 
            detail.label, 
            helveticaBold,
            devanagariFont,
            12, 
            labelX, 
            detailsY, 
            { r: 0.3, g: 0.3, b: 0.3 }
          );
          
          // Value might need wrapping for long text
          const newY = await drawText(
            detailPage, 
            detail.value, 
            helveticaFont,
            devanagariFont,
            12, 
            valueX, 
            detailsY, 
            { r: 0, g: 0, b: 0 }, 
            { 
              maxWidth: width - valueX - margin, 
              forceDevanagari: detail.forceDevanagari || containsDevanagari(detail.value)
            }
          );
          
          // Update Y position based on text wrapping
          detailsY = newY - 5;
          
          // Add extra space after sections
          if (detailsY < margin + 50) {
            // Add a new page if we're running out of space
            detailPage = pdfDoc.addPage([pageWidth, pageHeight]);
            // Draw logo on the new detail page
            await drawLogo(pdfDoc, detailPage, width, height);
            detailsY = height - margin - 50;
          }
        }
        
        // Page number at the bottom
        await drawText(
          detailPage,
          `Profile ${i + 1} of ${profilesToExport.length}`,
          helveticaFont,
          devanagariFont,
          10,
          width / 2,
          30,
          { r: 0.5, g: 0.5, b: 0.5 },
          { align: 'center' }
        );
      }
    }
    
    // Serialize the PDFDocument to bytes
    console.log("Saving PDF document");
    const pdfBytes = await pdfDoc.save();
    
    // Download the PDF
    console.log("Creating download link");
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.pdf`;
    link.click();
    
    // Success toast
    console.log("PDF generated and downloaded successfully");
    toast.success("PDF downloaded successfully", { id: toastId });
    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    toast.error("Failed to generate PDF", { id: toastId });
    return false;
  }
};