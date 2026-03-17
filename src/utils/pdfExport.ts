import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ContactRequest {
  id: string;
  contact_method: string;
  created_at: string;
  visitor_name: string | null;
  visitor_phone: string | null;
  visitor_email: string | null;
  agent_name: string | null;
  is_registered: boolean;
  listing_title: string | null;
  listing_id: string | null;
}

interface ContactStats {
  total: number;
  byPhone: number;
  byWhatsApp: number;
  byEmail: number;
}

interface ExportOptions {
  contactRequests: ContactRequest[];
  stats: ContactStats;
  userRole: string;
  searchQuery?: string;
  startDate?: string;
  endDate?: string;
  registrationFilter?: 'all' | 'registered' | 'unregistered';
}

export async function exportContactRequestsToPDF(options: ExportOptions): Promise<void> {
  const { contactRequests, stats, userRole, searchQuery, startDate, endDate, registrationFilter } = options;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  let yPosition = 20;

  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0);
  doc.text('Contact Requests Report', 15, yPosition);
  yPosition += 10;

  try {
    const logoPath = '/placesi-logo-dark copy copy copy.png';
    const img = new Image();
    img.crossOrigin = 'anonymous';

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load logo'));
      img.src = logoPath;
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(img, 0, 0);
      const imgData = canvas.toDataURL('image/png');

      const logoWidth = 50;
      const logoHeight = 15;
      const logoX = pageWidth - logoWidth - 15;
      const logoY = 15;

      doc.addImage(imgData, 'PNG', logoX, logoY, logoWidth, logoHeight);
    }
  } catch (error) {
    console.warn('Could not load logo, continuing without it:', error);
  }

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const exportDate = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  doc.text(`Generated: ${exportDate}`, 15, yPosition);
  yPosition += 6;

  const activeFilters: string[] = [];
  if (searchQuery) activeFilters.push(`Search: "${searchQuery}"`);
  if (startDate || endDate) {
    const dateRange = `Date Range: ${startDate || 'Beginning'} to ${endDate || 'Now'}`;
    activeFilters.push(dateRange);
  }
  if (registrationFilter && registrationFilter !== 'all') {
    const filterLabel = registrationFilter === 'registered' ? 'Registered Users Only' : 'Unregistered Users Only';
    activeFilters.push(filterLabel);
  }

  if (activeFilters.length > 0) {
    doc.text(`Filters: ${activeFilters.join(' | ')}`, 15, yPosition);
    yPosition += 8;
  } else {
    yPosition += 2;
  }

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Summary Statistics', 15, yPosition);
  yPosition += 8;

  const summaryData = [
    ['Total Contact Requests', stats.total.toString()],
    ['by Phone', stats.byPhone.toString()],
    ['by WhatsApp', stats.byWhatsApp.toString()],
    ['by Email', stats.byEmail.toString()],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [['Metric', 'Count']],
    body: summaryData,
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [34, 197, 94] },
    margin: { left: 15, right: 15 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  doc.setFontSize(12);
  doc.text(`Contact Requests (${contactRequests.length} records)`, 15, yPosition);
  yPosition += 6;

  const tableHeaders = userRole === 'agency'
    ? ['Date & Time', 'Visitor', 'Contact Info', 'Agent', 'Property', 'Method']
    : ['Date & Time', 'Visitor', 'Contact Info', 'Property', 'Method'];

  const tableData = contactRequests.map((request) => {
    const dateTime = new Date(request.created_at).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const visitorName = request.is_registered && request.visitor_name
      ? `${request.visitor_name} (Registered)`
      : request.visitor_name
      ? `${request.visitor_name} (Verified)`
      : 'Unregistered User';

    const contactInfo = [
      request.visitor_phone ? `Phone: ${request.visitor_phone}` : null,
      request.visitor_email ? `Email: ${request.visitor_email}` : null,
    ].filter(Boolean).join('\n') || 'Not provided';

    const property = request.listing_title || 'General Inquiry';
    const method = request.contact_method.charAt(0).toUpperCase() + request.contact_method.slice(1);

    if (userRole === 'agency') {
      return [dateTime, visitorName, contactInfo, request.agent_name || 'N/A', property, method];
    } else {
      return [dateTime, visitorName, contactInfo, property, method];
    }
  });

  autoTable(doc, {
    startY: yPosition,
    head: [tableHeaders],
    body: tableData,
    theme: 'striped',
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [34, 197, 94],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { left: 15, right: 15 },
    didDrawPage: (data) => {
      doc.setFontSize(8);
      doc.setTextColor(150);
      const pageNumber = (doc as any).internal.getNumberOfPages();
      doc.text(
        `Page ${data.pageNumber} of ${pageNumber}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
      doc.text('Placesi.ai - Real Estate Platform', 15, pageHeight - 10);
    },
  });

  const fileName = `contact-requests-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
