import { Profile1 } from "@/app/admin/components/approvedProfileRow";
import { format, isValid, parse } from "date-fns";
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { toast } from "sonner";

// Define the URL for the Noto Sans Devanagari font (freely available Google font)
const DEVANAGARI_FONT_URL = 'https://fonts.gstatic.com/s/notosansdevanagari/v25/TuGAOq5j3ru_sFpdyWl6AcYaFZtLZGdqWi3Dfg.woff2';

// Function to fetch and cache the Devanagari font data
let cachedDevanagariFont: ArrayBuffer | null = null;
const fetchDevanagariFont = async (): Promise<ArrayBuffer> => {
  if (cachedDevanagariFont) {
    return cachedDevanagariFont;
  }
  
  try {
    console.log("Fetching Devanagari font...");
    const response = await fetch(DEVANAGARI_FONT_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch font: ${response.status} ${response.statusText}`);
    }
    
    const fontData = await response.arrayBuffer();
    cachedDevanagariFont = fontData;
    console.log("Devanagari font fetched successfully");
    return fontData;
  } catch (error) {
    console.error("Error fetching Devanagari font:", error);
    throw error;
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

// Function to check if a string contains Devanagari characters
const containsDevanagari = (text: string): boolean => {
  if (!text) return false;
  // Devanagari Unicode range: \u0900-\u097F
  const devanagariPattern = /[\u0900-\u097F]/;
  return devanagariPattern.test(text);
};

// Helper function to draw text with proper alignment and script support
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
    
    const { width } = await page.getSize();
    
    // Determine which font to use
    const hasDevanagari = options.forceDevanagari || containsDevanagari(text);
    const font = hasDevanagari && devanagariFont ? devanagariFont : defaultFont;
    
    // Log which font is being used for debugging
    if (hasDevanagari) {
      console.log(`Using Devanagari font for text: "${text}"`);
    }
    
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    let actualX = x;

    if (options.align === 'center') {
      actualX = x - textWidth / 2;
    } else if (options.align === 'right') {
      actualX = x - textWidth;
    }

    // Handle text wrapping if maxWidth is provided
    if (options.maxWidth && textWidth > options.maxWidth) {
      const words = text.split(' ');
      let line = '';
      let actualY = y;
      
      for (const word of words) {
        const testLine = line + (line ? ' ' : '') + word;
        const testWidth = font.widthOfTextAtSize(testLine, fontSize);
        
        if (testWidth > options.maxWidth && line) {
          page.drawText(line, {
            x: actualX,
            y: actualY,
            font,
            size: fontSize,
            color: rgb(color.r, color.g, color.b),
          });
          line = word;
          actualY -= fontSize + 2; // Move to next line
        } else {
          line = testLine;
        }
      }
      
      // Draw remaining text
      if (line) {
        page.drawText(line, {
          x: actualX,
          y: actualY,
          font,
          size: fontSize,
          color: rgb(color.r, color.g, color.b),
        });
      }
      
      return actualY - (fontSize + 2); // Return the new Y position
    } else {
      page.drawText(text, {
        x: actualX,
        y: y,
        font,
        size: fontSize,
        color: rgb(color.r, color.g, color.b),
      });
      return y;
    }
  } catch (error) {
    console.error("Error in drawText:", error, "for text:", text);
    return y; // Return original Y position in case of error
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
    
    // Embed the standard fonts
    console.log("Embedding standard fonts");
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Fetch and embed the Devanagari font
    console.log("Fetching and embedding Devanagari font");
    let devanagariFont = null;
    try {
      const fontData = await fetchDevanagariFont();
      devanagariFont = await pdfDoc.embedFont(fontData);
      console.log("Devanagari font embedded successfully");
    } catch (fontError) {
      console.error("Failed to embed Devanagari font, falling back to standard font:", fontError);
      // Continue without Devanagari font, we'll use fallback
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
      
      // Title and header
      await drawText(
        page, 
        title, 
        helveticaBold,
        devanagariFont,
        20, 
        width / 2, 
        height - margin, 
        { r: 0, g: 0, b: 0 }, 
        { align: 'center' }
      );
      
      // Generation info
      await drawText(
        page, 
        `Generated on: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 
        helveticaFont,
        devanagariFont,
        10, 
        width / 2, 
        height - margin - 25, 
        { r: 0.4, g: 0.4, b: 0.4 }, 
        { align: 'center' }
      );
      
      // Total profiles count (only on first page)
      if (pageIndex === 0) {
        await drawText(
          page, 
          `Total Profiles: ${filteredProfiles.length}`, 
          helveticaBold,
          devanagariFont,
          12, 
          width / 2, 
          height - margin - 45, 
          { r: 0, g: 0, b: 0 }, 
          { align: 'center' }
        );
      }
      
      // Get profiles for this page
      const startIdx = pageIndex * pageSize;
      const endIdx = Math.min(startIdx + pageSize, profilesToExport.length);
      const pageProfiles = profilesToExport.slice(startIdx, endIdx);
      
      console.log(`Page ${pageIndex + 1} contains ${pageProfiles.length} profiles`);
      
      // Calculate starting Y position (after the header)
      let yPos = height - margin - 80;
      
      // Draw each profile card (max 2 per page)
      for (let i = 0; i < pageProfiles.length; i++) {
        console.log(`Processing profile ${i + 1} on page ${pageIndex + 1}`);
        const profile = pageProfiles[i];
        
        // First, draw the card outline
        const cardHeight = 320; // Fixed card height for 2 profiles per page
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
          devanagariFont,
          16, 
          margin + 20, 
          nameY, 
          { r: 0, g: 0, b: 0 }
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
          devanagariFont,
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
          { label: "6. Education:", value: getProfileProperty(profile, 'education') },
          { label: "7. Annual Income:", value: getProfileProperty(profile, 'annualIncome') },
          { label: "8. Mobile Number:", value: getProfileProperty(profile, 'mobileNumber') }
        ];
        
        // Draw each detail
        for (const detail of details) {
          await drawText(
            page, 
            detail.label, 
            helveticaBold,
            devanagariFont,
            12, 
            labelX, 
            detailsY, 
            { r: 0.3, g: 0.3, b: 0.3 },
            { forceDevanagari: containsDevanagari(detail.label) }
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
              forceDevanagari: detail.forceDevanagari || containsDevanagari(detail.value)
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
        
        // 9. Address (special handling for long text)
        await drawText(
          page, 
          "9. Address:", 
          helveticaBold,
          devanagariFont,
          12, 
          labelX, 
          detailsY, 
          { r: 0.3, g: 0.3, b: 0.3 }
        );
        
        // Draw address with wrapping
        const addressY = await drawText(
          page, 
          addressToShow, 
          helveticaFont,
          devanagariFont,
          12, 
          valueX, 
          detailsY, 
          { r: 0, g: 0, b: 0 }, 
          { 
            maxWidth: width - valueX - margin - 20,
            forceDevanagari: containsDevanagari(addressToShow)
          }
        );
        
        // 10. Anubandh ID (at the bottom)
        detailsY = addressY - lineHeight;
        await drawText(
          page, 
          "10. Anubandh ID:", 
          helveticaBold,
          devanagariFont,
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
        yPos -= cardHeight + 30; // Add some space between cards
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
    
    // Embed the standard fonts
    console.log("Embedding standard fonts");
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Fetch and embed the Devanagari font
    console.log("Fetching and embedding Devanagari font");
    let devanagariFont = null;
    try {
      const fontData = await fetchDevanagariFont();
      devanagariFont = await pdfDoc.embedFont(fontData);
      console.log("Devanagari font embedded successfully");
    } catch (fontError) {
      console.error("Failed to embed Devanagari font, falling back to standard font:", fontError);
      // Continue without Devanagari font, we'll use fallback
    }
    
    // Set page dimensions
    const pageWidth = 595.28; // A4 width in points
    const pageHeight = 841.89; // A4 height in points
    const margin = 50;
    
    // Add a new page
    console.log("Adding page to document");
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    const { width, height } = page.getSize();
    
    // Title and header
    await drawText(
      page, 
      title, 
      helveticaBold,
      devanagariFont,
      18, 
      width / 2, 
      height - margin, 
      { r: 0, g: 0, b: 0 }, 
      { align: 'center' }
    );
    
    // Generation info
    await drawText(
      page, 
      `Generated on: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 
      helveticaFont,
      devanagariFont,
      10, 
      width / 2, 
      height - margin - 25, 
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
        const forceDevanagari = i === 1 && marathiName ? true : containsDevanagari(rowData[i]);
        
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
      drawLine(page, startX, yPos - 10, startX + tableWidth, yPos - 10, 0.5, { r: 0.8, g: 0.8, b: 0.8 });
      
      // Move to next row
      yPos -= 25;
      rowCount++;
    }
    
    // Draw table border
    drawRect(page, startX, height - margin - 60 - 5, tableWidth, (rowCount + 1) * 25 + 10);
    
    // Add page numbers at the bottom
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
    toast.error("Failed to generate PDF: " + (error instanceof Error ? error.message : String(error)), { id: toastId });
    return false;
  }
}; 