import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generatePdfReport = ({ repoName, scanType, issuesFound, issues, createdAt }) => {
  const doc = new jsPDF();

  const colors = {
    primary: [24, 90, 157],
    secondary: [52, 73, 94],
    success: [46, 125, 50],
    warning: [245, 124, 0],
    danger: [211, 47, 47],
    light: [250, 250, 250],
    border: [224, 224, 224],
    text: [33, 37, 41],
    muted: [108, 117, 125],
  };

  let yPos = 0;

  // Header
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, 210, 45, "F");
  doc.setFillColor(19, 72, 126);
  doc.rect(0, 35, 210, 10, "F");

  doc.setFillColor(255, 255, 255);
  doc.circle(25, 22, 8, "F");
  doc.setTextColor(...colors.primary);
  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.text("GH", 21, 26);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text("Repository Cleanup Report", 45, 22);
  doc.setFontSize(11);
  doc.setFont(undefined, "normal");
  doc.text("Automated Code Quality Analysis", 45, 30);

  doc.setFontSize(9);
  const dateStr = new Date(createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.text(dateStr, 196, 15, { align: "right" });

  yPos = 60;

  // Repo Info Card
  doc.setFillColor(0, 0, 0, 0.1);
  doc.rect(16, yPos + 2, 178, 35, "F");
  doc.setFillColor(...colors.light);
  doc.rect(15, yPos, 180, 35, "F");
  doc.setDrawColor(...colors.border);
  doc.setLineWidth(0.5);
  doc.rect(15, yPos, 180, 35, "S");

  doc.setFillColor(255, 255, 255);
  doc.rect(15, yPos, 180, 12, "F");
  doc.setDrawColor(...colors.border);
  doc.line(15, yPos + 12, 195, yPos + 12);

  doc.setTextColor(...colors.secondary);
  doc.setFontSize(11);
  doc.setFont(undefined, "bold");
  doc.text("Repository Information", 20, yPos + 8);

  doc.setTextColor(...colors.text);
  doc.setFontSize(10);

  doc.setFont(undefined, "bold");
  doc.text("Repository:", 20, yPos + 20);
  doc.text("Scan Type:", 20, yPos + 28);

  doc.setFont(undefined, "normal");
  doc.text(repoName, 50, yPos + 20);
  doc.text(scanType, 50, yPos + 28);

  doc.setFont(undefined, "bold");
  doc.text("Analyzed:", 120, yPos + 20);
  doc.text("Status:", 120, yPos + 28);

  doc.setFont(undefined, "normal");
  doc.text(new Date(createdAt).toLocaleDateString(), 145, yPos + 20);

  const statusInfo = getStatusInfo(issuesFound);
  doc.setFillColor(...statusInfo.color);
  doc.circle(147, yPos + 26, 2, "F");
  doc.setTextColor(...statusInfo.color);
  doc.setFont(undefined, "bold");
  doc.text(statusInfo.text, 152, yPos + 28);

  yPos += 50;

  // Summary Dashboard
  doc.setFillColor(248, 249, 250);
  doc.rect(15, yPos, 180, 45, "F");
  doc.setDrawColor(...colors.border);
  doc.rect(15, yPos, 180, 45, "S");

  doc.setTextColor(...colors.secondary);
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.text("Scan Summary", 20, yPos + 15);

  const metricX = 105;
  doc.setTextColor(...statusInfo.color);
  doc.setFontSize(36);
  doc.setFont(undefined, "bold");
  doc.text(issuesFound.toString(), metricX, yPos + 35, { align: "center" });

  doc.setTextColor(...colors.muted);
  doc.setFontSize(12);
  doc.text("Issues Found", metricX, yPos + 40, { align: "center" });

  if (issues?.length) {
    const stats = getDetailedStatistics(issues);

    doc.setTextColor(...colors.text);
    doc.setFontSize(9);
    doc.setFont(undefined, "bold");
    doc.text("BY CATEGORY", 25, yPos + 25);

    doc.setFontSize(8);
    doc.setFont(undefined, "normal");
    let leftY = yPos + 30;
    Object.entries(stats.categories).forEach(([cat, count]) => {
      doc.text(`${cat}: ${count}`, 25, leftY);
      leftY += 4;
    });

    doc.setFont(undefined, "bold");
    doc.setFontSize(9);
    doc.text("BY PRIORITY", 155, yPos + 25);

    doc.setFontSize(8);
    doc.setFont(undefined, "normal");
    doc.setTextColor(...colors.danger);
    doc.text(`High: ${stats.severity.high}`, 155, yPos + 30);
    doc.setTextColor(...colors.warning);
    doc.text(`Medium: ${stats.severity.medium}`, 155, yPos + 34);
    doc.setTextColor(...colors.success);
    doc.text(`Low: ${stats.severity.low}`, 155, yPos + 38);
  }

  yPos += 60;

  if (issues?.length > 0) {
    doc.setTextColor(...colors.secondary);
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("Detailed Analysis", 15, yPos);
    yPos += 10;

    autoTable(doc, {
      startY: yPos,
      head: [['#', 'Priority', 'Category', 'File', 'Description', 'Action Required']],
      body: issues.map((issue, index) => {
        const analysis = analyzeIssue(issue);
        return [
          String(index + 1).padStart(2, '0'),
          analysis.severity,
          analysis.category,
          issue.file || 'N/A',
          analysis.description,
          analysis.action
        ];
      }),
      theme: 'plain',
      headStyles: {
        fillColor: colors.primary,
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center',
        cellPadding: 4
      },
      bodyStyles: {
        fontSize: 8,
        lineColor: colors.border,
        lineWidth: 0.1,
        cellPadding: 3
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        1: { halign: 'center', cellWidth: 20 },
        2: { cellWidth: 25 },
        3: { cellWidth: 50 },
        4: { cellWidth: 60 },
        5: { cellWidth: 25 },
      },
      alternateRowStyles: { fillColor: [252, 252, 252] },
      didParseCell: (data) => {
        if (data.column.index === 1) {
          const val = data.cell.text[0];
          data.cell.styles.textColor =
            val === 'High' ? colors.danger :
            val === 'Medium' ? colors.warning :
            colors.success;
          data.cell.styles.fontStyle = 'bold';
        }
      },
      margin: { left: 15, right: 15 }
    });

    yPos = doc.lastAutoTable.finalY + 10;
    addRecommendationsSection(doc, issues, yPos, colors);
  }

  addProfessionalFooter(doc, repoName, colors);

  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const filename = `${repoName.replace(/[^a-zA-Z0-9]/g, '_')}_Cleanup_Report_${timestamp}.pdf`;

  doc.save(filename);
};

// ========== Helper Functions ==========
function getStatusInfo(issuesFound) {
  if (issuesFound === 0) return { color: [46, 125, 50], text: 'Clean' };
  if (issuesFound <= 3) return { color: [245, 124, 0], text: 'Minor Issues' };
  if (issuesFound <= 10) return { color: [255, 152, 0], text: 'Needs Attention' };
  return { color: [211, 47, 47], text: 'Critical' };
}

function analyzeIssue(issue) {
  const str = typeof issue === "string" ? issue : JSON.stringify(issue).toLowerCase();
  let category = 'General';
  if (str.includes("security")) category = "Security";
  else if (str.includes("file") || str.includes("unused")) category = "Files";
  else if (str.includes("dependency")) category = "Dependencies";

  let severity = "Low";
  if (str.includes("critical") || str.includes("vulnerability")) severity = "High";
  else if (str.includes("deprecated") || str.includes("warning")) severity = "Medium";

  let description = issue.description || issue.message || issue.file || 'Code issue detected';
  if (description.length > 60) description = description.substring(0, 57) + '...';

  let action = "Review and fix";
  if (severity === "High") action = "Fix immediately";
  else if (severity === "Medium") action = "Schedule fix";
  else if (category === "Files") action = "Clean up";

  return { category, severity, description, action };
}

function getDetailedStatistics(issues) {
  const stats = { categories: {}, severity: { high: 0, medium: 0, low: 0 } };
  issues.forEach((issue) => {
    const { category, severity } = analyzeIssue(issue);
    stats.categories[category] = (stats.categories[category] || 0) + 1;
    stats.severity[severity.toLowerCase()]++;
  });
  return stats;
}

function addRecommendationsSection(doc, issues, yPos, colors) {
  const stats = getDetailedStatistics(issues);
  const recommendations = [];

  if (stats.severity.high > 0)
    recommendations.push("Fix critical and high priority issues first.");
  if (stats.categories["Dependencies"])
    recommendations.push("Update outdated or vulnerable dependencies.");
  if (stats.categories["Files"])
    recommendations.push("Remove unused files to reduce clutter.");
  if (issues.length > 10)
    recommendations.push("Introduce automated quality checks.");

  recommendations.push("Schedule periodic code reviews and cleanup.");

  if (recommendations.length === 0) return;

  doc.setTextColor(...colors.secondary);
  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.text("Recommendations", 15, yPos);
  yPos += 8;

  doc.setFillColor(248, 249, 250);
  doc.rect(15, yPos, 180, recommendations.length * 8 + 8, 'F');
  doc.setDrawColor(...colors.border);
  doc.rect(15, yPos, 180, recommendations.length * 8 + 8, 'S');
  yPos += 6;

  doc.setTextColor(...colors.text);
  doc.setFontSize(9);
  doc.setFont(undefined, "normal");

  recommendations.forEach((rec, i) => {
    doc.text(`${i + 1}. ${rec}`, 20, yPos);
    yPos += 6;
  });
}

function addProfessionalFooter(doc, repoName, colors) {
  const pageHeight = doc.internal.pageSize.height;
  doc.setDrawColor(...colors.border);
  doc.line(15, pageHeight - 25, 195, pageHeight - 25);

  doc.setTextColor(...colors.muted);
  doc.setFontSize(8);
  doc.setFont(undefined, "normal");

  doc.text("Generated by GitHub Cleanup Tool", 15, pageHeight - 18);
  doc.text(`Repository: ${repoName}`, 15, pageHeight - 13);

  const now = new Date();
  doc.text(
    `Report generated on ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`,
    105,
    pageHeight - 18,
    { align: "center" }
  );
  doc.text("For support, contact your development team", 105, pageHeight - 13, {
    align: "center",
  });

  doc.text("Page 1 of 1", 195, pageHeight - 18, { align: "right" });
  doc.text("Confidential", 195, pageHeight - 13, { align: "right" });
}
