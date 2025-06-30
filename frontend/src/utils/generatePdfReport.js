// utils/generatePdfReport.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generatePdfReport = ({ repoName, scanType, issuesFound, issues, createdAt }) => {
  const doc = new jsPDF();
  
  // Professional color palette
  const colors = {
    primary: [24, 90, 157],      // Professional blue
    secondary: [52, 73, 94],     // Dark blue-gray
    success: [46, 125, 50],      // Professional green
    warning: [245, 124, 0],      // Professional orange
    danger: [211, 47, 47],       // Professional red
    light: [250, 250, 250],      // Light gray
    border: [224, 224, 224],     // Border gray
    text: [33, 37, 41],          // Dark text
    muted: [108, 117, 125]       // Muted text
  };
  
  let yPos = 0;
  
  // ============ HEADER SECTION ============
  // Gradient-like header with multiple rectangles for depth
  doc.setFillColor(24, 90, 157);
  doc.rect(0, 0, 210, 45, 'F');
  
  doc.setFillColor(19, 72, 126);
  doc.rect(0, 35, 210, 10, 'F');
  
  // Company/Tool logo area (left)
  doc.setFillColor(255, 255, 255);
  doc.circle(25, 22, 8, 'F');
  doc.setTextColor(...colors.primary);
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('GH', 21, 26);
  
  // Main title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont(undefined, 'bold');
  doc.text('Repository Cleanup Report', 45, 22);
  
  // Subtitle
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.text('Automated Code Quality Analysis', 45, 30);
  
  // Date stamp (right aligned)
  doc.setFontSize(9);
  const dateStr = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.text(dateStr, 210 - 14, 15, { align: 'right' });
  
  yPos = 60;
  
  // ============ REPOSITORY INFO CARD ============
  // Card shadow effect
  doc.setFillColor(0, 0, 0, 0.1);
  doc.rect(16, yPos + 2, 178, 35, 'F');
  
  // Main card
  doc.setFillColor(...colors.light);
  doc.rect(15, yPos, 180, 35, 'F');
  doc.setDrawColor(...colors.border);
  doc.setLineWidth(0.5);
  doc.rect(15, yPos, 180, 35, 'S');
  
  // Card header
  doc.setFillColor(255, 255, 255);
  doc.rect(15, yPos, 180, 12, 'F');
  doc.setDrawColor(...colors.border);
  doc.line(15, yPos + 12, 195, yPos + 12);
  
  doc.setTextColor(...colors.secondary);
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('Repository Information', 20, yPos + 8);
  
  // Repository details in two columns
  doc.setTextColor(...colors.text);
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  
  // Left column
  doc.setFont(undefined, 'bold');
  doc.text('Repository:', 20, yPos + 20);
  doc.text('Scan Type:', 20, yPos + 28);
  
  doc.setFont(undefined, 'normal');
  doc.text(repoName, 50, yPos + 20);
  doc.text(scanType, 50, yPos + 28);
  
  // Right column
  doc.setFont(undefined, 'bold');
  doc.text('Analyzed:', 120, yPos + 20);
  doc.text('Status:', 120, yPos + 28);
  
  doc.setFont(undefined, 'normal');
  doc.text(new Date(createdAt).toLocaleDateString(), 145, yPos + 20);
  
  // Status with colored indicator
  const statusInfo = getStatusInfo(issuesFound);
  doc.setFillColor(...statusInfo.color);
  doc.circle(147, yPos + 26, 2, 'F');
  doc.setTextColor(...statusInfo.color);
  doc.setFont(undefined, 'bold');
  doc.text(statusInfo.text, 152, yPos + 28);
  
  yPos += 50;
  
  // ============ SUMMARY DASHBOARD ============
  // Dashboard background
  doc.setFillColor(248, 249, 250);
  doc.rect(15, yPos, 180, 45, 'F');
  doc.setDrawColor(...colors.border);
  doc.rect(15, yPos, 180, 45, 'S');
  
  // Dashboard title
  doc.setTextColor(...colors.secondary);
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Scan Summary', 20, yPos + 15);
  
  // Main metric (center)
  const metricX = 105;
  doc.setTextColor(...statusInfo.color);
  doc.setFontSize(36);
  doc.setFont(undefined, 'bold');
  doc.text(issuesFound.toString(), metricX, yPos + 35, { align: 'center' });
  
  doc.setTextColor(...colors.muted);
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  doc.text('Issues Found', metricX, yPos + 40, { align: 'center' });
  
  // Side metrics
  if (issues && issues.length > 0) {
    const stats = getDetailedStatistics(issues);
    
    // Left side - Categories
    doc.setTextColor(...colors.text);
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text('BY CATEGORY', 25, yPos + 25);
    
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    let leftY = yPos + 30;
    Object.entries(stats.categories).forEach(([category, count]) => {
      doc.text(`${category}: ${count}`, 25, leftY);
      leftY += 4;
    });
    
    // Right side - Severity
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text('BY PRIORITY', 155, yPos + 25);
    
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...colors.danger);
    doc.text(`High: ${stats.severity.high}`, 155, yPos + 30);
    doc.setTextColor(...colors.warning);
    doc.text(`Medium: ${stats.severity.medium}`, 155, yPos + 34);
    doc.setTextColor(...colors.success);
    doc.text(`Low: ${stats.severity.low}`, 155, yPos + 38);
  }
  
  yPos += 60;
  
  // ============ MAIN CONTENT SECTION ============
  if (issues && issues.length > 0) {
    // Section header
    doc.setTextColor(...colors.secondary);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Detailed Analysis', 15, yPos);
    
    yPos += 10;
    
    // Professional table
    autoTable(doc, {
      startY: yPos,
      head: [['#', 'Priority', 'Category', 'Description', 'Action Required']],
      body: issues.map((issue, index) => {
        const analysis = analyzeIssue(issue);
        return [
          String(index + 1).padStart(2, '0'),
          analysis.severity,
          analysis.category,
          analysis.description,
          analysis.action
        ];
      }),
      
      // Professional styling
      theme: 'plain',
      headStyles: {
        fillColor: colors.primary,
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center',
        cellPadding: { top: 4, right: 3, bottom: 4, left: 3 }
      },
      
      bodyStyles: {
        fontSize: 8,
        cellPadding: { top: 3, right: 3, bottom: 3, left: 3 },
        lineColor: colors.border,
        lineWidth: 0.1
      },
      
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        1: { halign: 'center', cellWidth: 20 },
        2: { cellWidth: 25 },
        3: { cellWidth: 85 },
        4: { cellWidth: 45 }
      },
      
      alternateRowStyles: {
        fillColor: [252, 252, 252]
      },
      
      // Custom cell styling based on content
      didParseCell: function(data) {
        if (data.column.index === 1) { // Priority column
          const priority = data.cell.text[0];
          if (priority === 'High') {
            data.cell.styles.textColor = colors.danger;
            data.cell.styles.fontStyle = 'bold';
          } else if (priority === 'Medium') {
            data.cell.styles.textColor = colors.warning;
            data.cell.styles.fontStyle = 'bold';
          } else if (priority === 'Low') {
            data.cell.styles.textColor = colors.success;
            data.cell.styles.fontStyle = 'bold';
          }
        }
      },
      
      margin: { left: 15, right: 15 }
    });
    
    yPos = doc.lastAutoTable.finalY + 15;
    
    // Recommendations section
    addRecommendationsSection(doc, issues, yPos, colors);
    
  } else {
    // Success state - no issues found
    // Success card with shadow
    doc.setFillColor(0, 0, 0, 0.05);
    doc.rect(16, yPos + 2, 178, 60, 'F');
    
    doc.setFillColor(232, 245, 233);
    doc.rect(15, yPos, 180, 60, 'F');
    doc.setDrawColor(76, 175, 80);
    doc.setLineWidth(2);
    doc.rect(15, yPos, 180, 60, 'S');
    
    // Success icon and message
    doc.setTextColor(...colors.success);
    doc.setFontSize(32);
    doc.text('✓', 105, yPos + 25, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Repository Clean!', 105, yPos + 35, { align: 'center' });
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text('No issues detected. Your code quality standards are being maintained.', 105, yPos + 43, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setTextColor(...colors.muted);
    doc.text('Keep up the excellent work! Consider running scans regularly to maintain code quality.', 105, yPos + 52, { align: 'center' });
  }
  
  // ============ FOOTER ============
  addProfessionalFooter(doc, repoName, colors);
  
  // Generate filename with timestamp
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const filename = `${repoName.replace(/[^a-zA-Z0-9]/g, '_')}_Cleanup_Report_${timestamp}.pdf`;
  
  doc.save(filename);
};

// ============ HELPER FUNCTIONS ============

function getStatusInfo(issuesFound) {
  if (issuesFound === 0) {
    return { color: [46, 125, 50], text: 'Clean' };
  } else if (issuesFound <= 3) {
    return { color: [245, 124, 0], text: 'Minor Issues' };
  } else if (issuesFound <= 10) {
    return { color: [255, 152, 0], text: 'Needs Attention' };
  } else {
    return { color: [211, 47, 47], text: 'Critical' };
  }
}

function analyzeIssue(issue) {
  const issueStr = typeof issue === 'string' ? issue : JSON.stringify(issue);
  const lowerIssue = issueStr.toLowerCase();
  
  // Determine category
  let category = 'General';
  if (lowerIssue.includes('security') || lowerIssue.includes('vulnerability')) category = 'Security';
  else if (lowerIssue.includes('dependency') || lowerIssue.includes('package')) category = 'Dependencies';
  else if (lowerIssue.includes('file') || lowerIssue.includes('unused')) category = 'Files';
  else if (lowerIssue.includes('config') || lowerIssue.includes('setting')) category = 'Configuration';
  else if (lowerIssue.includes('performance') || lowerIssue.includes('optimization')) category = 'Performance';
  
  // Determine severity
  let severity = 'Low';
  if (lowerIssue.includes('critical') || lowerIssue.includes('security') || lowerIssue.includes('vulnerability')) {
    severity = 'High';
  } else if (lowerIssue.includes('deprecated') || lowerIssue.includes('warning') || lowerIssue.includes('outdated')) {
    severity = 'Medium';
  }
  
  // Generate description
  let description = issueStr;
  if (typeof issue === 'object') {
    description = issue.message || issue.description || issue.file || 'Issue detected in codebase';
  }
  if (description.length > 60) {
    description = description.substring(0, 57) + '...';
  }
  
  // Generate action
  let action = 'Review and fix';
  if (severity === 'High') action = 'Fix immediately';
  else if (severity === 'Medium') action = 'Schedule fix';
  else if (category === 'Files') action = 'Clean up';
  else if (category === 'Dependencies') action = 'Update/remove';
  
  return { category, severity, description, action };
}

function getDetailedStatistics(issues) {
  const stats = {
    categories: {},
    severity: { high: 0, medium: 0, low: 0 }
  };
  
  issues.forEach(issue => {
    const analysis = analyzeIssue(issue);
    
    // Count categories
    stats.categories[analysis.category] = (stats.categories[analysis.category] || 0) + 1;
    
    // Count severity
    stats.severity[analysis.severity.toLowerCase()]++;
  });
  
  return stats;
}

function addRecommendationsSection(doc, issues, yPos, colors) {
  const recommendations = generateRecommendations(issues);
  
  if (recommendations.length === 0) return;
  
  // Recommendations header
  doc.setTextColor(...colors.secondary);
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Recommendations', 15, yPos);
  
  yPos += 8;
  
  // Recommendations list
  doc.setFillColor(248, 249, 250);
  doc.rect(15, yPos, 180, recommendations.length * 8 + 8, 'F');
  doc.setDrawColor(...colors.border);
  doc.rect(15, yPos, 180, recommendations.length * 8 + 8, 'S');
  
  yPos += 6;
  
  doc.setTextColor(...colors.text);
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  
  recommendations.forEach((rec, index) => {
    doc.text(`${index + 1}. ${rec}`, 20, yPos);
    yPos += 6;
  });
}

function generateRecommendations(issues) {
  const stats = getDetailedStatistics(issues);
  const recommendations = [];
  
  if (stats.severity.high > 0) {
    recommendations.push('Address high-priority security and critical issues first');
  }
  
  if (stats.categories['Dependencies'] > 0) {
    recommendations.push('Review and update outdated dependencies regularly');
  }
  
  if (stats.categories['Files'] > 0) {
    recommendations.push('Clean up unused files to reduce repository size');
  }
  
  if (issues.length > 10) {
    recommendations.push('Consider implementing automated code quality checks');
  }
  
  recommendations.push('Schedule regular repository maintenance scans');
  recommendations.push('Document cleanup procedures for team consistency');
  
  return recommendations.slice(0, 4); // Limit to 4 recommendations
}

function addProfessionalFooter(doc, repoName, colors) {
  const pageHeight = doc.internal.pageSize.height;
  
  // Footer line
  doc.setDrawColor(...colors.border);
  doc.line(15, pageHeight - 25, 195, pageHeight - 25);
  
  // Footer content
  doc.setTextColor(...colors.muted);
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  
  // Left side
  doc.text('Generated by GitHub Cleanup Tool', 15, pageHeight - 18);
  doc.text(`Repository: ${repoName}`, 15, pageHeight - 13);
  
  // Center
  const now = new Date();
  doc.text(`Report generated on ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`, 105, pageHeight - 18, { align: 'center' });
  doc.text('For support or questions, contact your development team', 105, pageHeight - 13, { align: 'center' });
  
  // Right side
  doc.text('Page 1 of 1', 195, pageHeight - 18, { align: 'right' });
  doc.text('Confidential', 195, pageHeight - 13, { align: 'right' });
}