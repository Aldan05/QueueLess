import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Helper to parse time string like "09:00 AM" into minutes from midnight
const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return null;
  try {
    const clean = timeStr.trim();
    if (clean.includes(':')) {
      const parts = clean.split(' ');
      const timeParts = parts[0].split(':');
      let hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1], 10);
      if (parts[1] && parts[1].toUpperCase() === 'PM' && hours < 12) hours += 12;
      else if (parts[1] && parts[1].toUpperCase() === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    }
  } catch (e) {}
  return null;
};

// Check if current time is within business opening and closing hours
const getBusinessScheduleStatus = (openingTime, closingTime) => {
  if (!openingTime || !closingTime) {
    return 'Standard Hours';
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMins = parseTimeToMinutes(openingTime);
  const closeMins = parseTimeToMinutes(closingTime);

  if (openMins === null || closeMins === null) {
    return `${openingTime} - ${closingTime}`;
  }

  let isWithinHours = false;
  if (closeMins > openMins) {
    isWithinHours = currentMinutes >= openMins && currentMinutes <= closeMins;
  } else {
    isWithinHours = currentMinutes >= openMins || currentMinutes <= closeMins;
  }

  return isWithinHours ? 'Open Now (In Hours)' : 'Off Hours';
};

export const generateBusinessQueueReport = (businesses = [], adminUser = null) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const generatedDate = new Date();
  const formattedDate = generatedDate.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  const formattedTime = generatedDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // Aggregate Calculations
  const totalBusinesses = businesses.length;
  const openBusinesses = businesses.filter(b => (b.queueStatus === 'open') || (b.queueActive && b.queueStatus !== 'closed' && b.queueStatus !== 'paused')).length;
  const pausedBusinesses = businesses.filter(b => b.queueStatus === 'paused').length;
  const closedBusinesses = businesses.filter(b => b.queueStatus === 'closed' || (!b.queueActive && b.queueStatus !== 'paused' && b.queueStatus !== 'open')).length;
  const totalWaiting = businesses.reduce((acc, b) => acc + (Number(b.waiting) || 0), 0);
  const totalCompletedToday = businesses.reduce((acc, b) => acc + (Number(b.completedToday) || 0), 0);

  // 1. Header Banner
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Decorative Accent Strip
  doc.setFillColor(37, 99, 235); // Blue 600
  doc.rect(0, 28, pageWidth, 2, 'F');

  // Title & Logo
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('QueueLess | Executive Business & Queue Monitoring Report', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text(`Real-Time Operating Timings, Opening/Closing Schedules & Queue Performance Data`, 14, 18);
  doc.text(`Generated: ${formattedDate} at ${formattedTime} | Authorized by: ${adminUser?.name || 'Super Admin'}`, 14, 23);

  // Status Badge in Header
  doc.setFillColor(16, 185, 129); // Emerald 500
  doc.roundedRect(pageWidth - 48, 8, 34, 12, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('LIVE REAL-TIME', pageWidth - 46, 15);

  // 2. Summary KPI Metric Boxes
  const startY = 36;
  const boxWidth = (pageWidth - 28 - 20) / 5; // 5 boxes
  const boxHeight = 18;

  const kpis = [
    { label: 'TOTAL BUSINESSES', value: `${totalBusinesses}`, color: [30, 58, 138], bg: [239, 246, 255], border: [191, 219, 254] },
    { label: 'LIVE OPEN QUEUES', value: `${openBusinesses}`, color: [6, 95, 70], bg: [236, 253, 245], border: [167, 243, 208] },
    { label: 'PAUSED QUEUES', value: `${pausedBusinesses}`, color: [146, 64, 14], bg: [254, 243, 199], border: [253, 230, 138] },
    { label: 'CLOSED QUEUES', value: `${closedBusinesses}`, color: [159, 18, 57], bg: [255, 241, 242], border: [254, 205, 211] },
    { label: 'WAITING IN QUEUES', value: `${totalWaiting} customers`, color: [88, 28, 135], bg: [250, 245, 255], border: [233, 213, 255] },
  ];

  kpis.forEach((kpi, idx) => {
    const x = 14 + idx * (boxWidth + 5);
    // Box Background
    doc.setFillColor(kpi.bg[0], kpi.bg[1], kpi.bg[2]);
    doc.setDrawColor(kpi.border[0], kpi.border[1], kpi.border[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, startY, boxWidth, boxHeight, 2, 2, 'FD');

    // KPI Label
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.text(kpi.label, x + 3, startY + 6);

    // KPI Value
    doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(kpi.value, x + 3, startY + 13);
  });

  // 3. Businesses Data Table
  const tableData = businesses.map((b, index) => {
    const queueStatus = b.queueStatus || (b.queueActive !== false ? 'open' : 'closed');
    const statusText = queueStatus === 'open' ? 'OPEN' : queueStatus === 'paused' ? 'PAUSED' : 'CLOSED';

    const openingTime = b.openingTime || '09:00 AM';
    const closingTime = b.closingTime || '06:00 PM';
    const workingDays = b.workingDays || 'Mon - Sat';
    const scheduleStatus = getBusinessScheduleStatus(openingTime, closingTime);
    const waitingCount = Number(b.waiting) || 0;
    const completedCount = Number(b.completedToday) || 0;
    const currentToken = b.currentToken && b.currentToken !== '-' ? b.currentToken : '-';
    const phone = b.phone || b.ownerMobile || b.contactNumber || b.businessPhone || 'N/A';
    const city = b.city || b.district || 'Metropolis';
    const verification = b.verificationStatus || (b.isVerified ? 'Approved' : 'Pending');

    return [
      (index + 1).toString(),
      `${b.name || 'Unnamed'}\n(${b.category || 'General'})`,
      `${city}\n${phone}`,
      `${openingTime} - ${closingTime}\n${workingDays}`,
      scheduleStatus,
      statusText,
      currentToken,
      `${waitingCount}`,
      `${completedCount}`,
      b.avgServiceTime || '10 mins',
      verification
    ];
  });

  autoTable(doc, {
    startY: startY + boxHeight + 6,
    head: [[
      '#',
      'Establishment & Category',
      'Location & Phone',
      'Operating Hours & Days',
      'Schedule State',
      'Queue State',
      'Serving',
      'Waiting',
      'Served',
      'Avg Time',
      'Verification'
    ]],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'center',
      valign: 'middle',
      cellPadding: 2
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [30, 41, 59],
      cellPadding: 2,
      valign: 'middle'
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { halign: 'left', cellWidth: 42, fontStyle: 'bold' },
      2: { halign: 'left', cellWidth: 32 },
      3: { halign: 'center', cellWidth: 36 },
      4: { halign: 'center', cellWidth: 28 },
      5: { halign: 'center', cellWidth: 22, fontStyle: 'bold' },
      6: { halign: 'center', cellWidth: 16 },
      7: { halign: 'center', cellWidth: 16, fontStyle: 'bold' },
      8: { halign: 'center', cellWidth: 16 },
      9: { halign: 'center', cellWidth: 20 },
      10: { halign: 'center', cellWidth: 22 }
    },
    didParseCell: (data) => {
      // Color-code Queue State column
      if (data.section === 'body' && data.column.index === 5) {
        if (data.cell.raw === 'OPEN') {
          data.cell.styles.textColor = [5, 150, 105]; // Emerald
          data.cell.styles.fillColor = [236, 253, 245];
        } else if (data.cell.raw === 'PAUSED') {
          data.cell.styles.textColor = [217, 119, 6]; // Amber
          data.cell.styles.fillColor = [254, 243, 199];
        } else if (data.cell.raw === 'CLOSED') {
          data.cell.styles.textColor = [225, 29, 72]; // Rose
          data.cell.styles.fillColor = [255, 241, 242];
        }
      }

      // Schedule state color
      if (data.section === 'body' && data.column.index === 4) {
        if (typeof data.cell.raw === 'string' && data.cell.raw.includes('Open Now')) {
          data.cell.styles.textColor = [5, 150, 105];
        } else if (typeof data.cell.raw === 'string' && data.cell.raw.includes('Off Hours')) {
          data.cell.styles.textColor = [100, 116, 139];
        }
      }

      // Waiting count emphasis
      if (data.section === 'body' && data.column.index === 7) {
        const count = parseInt(data.cell.raw, 10);
        if (count > 0) {
          data.cell.styles.textColor = [217, 119, 6];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
    didDrawPage: (data) => {
      // Page Footer
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `QueueLess Platform Monitoring • Confidential Document • Page ${doc.internal.getNumberOfPages()}`,
        14,
        pageHeight - 6
      );
      doc.text(
        `Total Completed Served Across Platform Today: ${totalCompletedToday} Customers`,
        pageWidth - 95,
        pageHeight - 6
      );
    },
    margin: { top: 30, left: 14, right: 14, bottom: 12 }
  });

  // Save / Download PDF
  const filename = `QueueLess_Business_Queue_Report_${generatedDate.toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
  return filename;
};
