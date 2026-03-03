import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel, AlignmentType, WidthType, BorderStyle } from 'docx';
import { StudentRecord } from '../types';

// ─── Helpers ───────────────────────────────────────────────────────────────

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

const buildRows = (records: StudentRecord[]) =>
  records.map(r => ({
    Nome: r.profile.name,
    Curso: r.profile.course,
    Turma: r.profile.turma,
    'Data de Conclusão': formatDate(r.completedAt),
    'VARK Dominante': r.profile.dominantVark.join(', '),
    'Visual': r.profile.varkScores['Visual'] ?? 0,
    'Auditivo': r.profile.varkScores['Auditivo'] ?? 0,
    'Leitura/Escrita': r.profile.varkScores['Leitura/Escrita'] ?? 0,
    'Cinestésico': r.profile.varkScores['Cinestésico'] ?? 0,
    'Kolb Dominante': r.profile.dominantKolb.join(', '),
    'Ativo': r.profile.kolbScores['Ativo'] ?? 0,
    'Reflexivo': r.profile.kolbScores['Reflexivo'] ?? 0,
    'Teórico': r.profile.kolbScores['Teórico'] ?? 0,
    'Pragmático': r.profile.kolbScores['Pragmático'] ?? 0,
    'Análise IA': r.profile.aiAnalysis ?? '',
  }));

// ─── XLS Export ─────────────────────────────────────────────────────────────

export const exportToXLS = (records: StudentRecord[], turma: string) => {
  const rows = buildRows(records);
  const ws = XLSX.utils.json_to_sheet(rows);

  // Column widths
  ws['!cols'] = [
    { wch: 28 }, // Nome
    { wch: 20 }, // Curso
    { wch: 18 }, // Turma
    { wch: 18 }, // Data
    { wch: 22 }, // VARK Dom
    { wch: 8 },  // Visual
    { wch: 8 },  // Auditivo
    { wch: 14 }, // L/E
    { wch: 12 }, // Cinest
    { wch: 22 }, // Kolb Dom
    { wch: 8 },  // Ativo
    { wch: 10 }, // Reflexivo
    { wch: 8 },  // Teórico
    { wch: 11 }, // Pragmático
    { wch: 60 }, // Análise IA
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, turma.substring(0, 31));
  XLSX.writeFile(wb, `Relatorio_Turma_${turma.replace(/\s+/g, '_')}.xlsx`);
};

// ─── DOC Export ──────────────────────────────────────────────────────────────

export const exportToDOC = async (records: StudentRecord[], turma: string) => {
  const headerCell = (text: string) =>
    new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 18 })] })],
      shading: { fill: '1E2937' },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1, color: '334155' },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: '334155' },
        left: { style: BorderStyle.SINGLE, size: 1, color: '334155' },
        right: { style: BorderStyle.SINGLE, size: 1, color: '334155' },
      },
    });

  const dataCell = (text: string) =>
    new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text, size: 18 })] })],
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
        left: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
        right: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
      },
    });

  const headers = ['Nome', 'Curso', 'Data', 'VARK Dominante', 'Kolb Dominante'];

  const tableRows = [
    new TableRow({
      children: headers.map(h => headerCell(h)),
      tableHeader: true,
    }),
    ...records.map(r =>
      new TableRow({
        children: [
          dataCell(r.profile.name),
          dataCell(r.profile.course),
          dataCell(formatDate(r.completedAt)),
          dataCell(r.profile.dominantVark.join(', ')),
          dataCell(r.profile.dominantKolb.join(', ')),
        ],
      })
    ),
  ];

  const detailSections = records.flatMap(r => [
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun({ text: r.profile.name, bold: true })],
      spacing: { before: 400 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Curso: `, bold: true }),
        new TextRun(r.profile.course),
        new TextRun({ text: '   |   Turma: ', bold: true }),
        new TextRun(r.profile.turma),
        new TextRun({ text: '   |   Data: ', bold: true }),
        new TextRun(formatDate(r.completedAt)),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'VARK: ', bold: true }),
        new TextRun(r.profile.dominantVark.join(', ')),
        new TextRun({ text: '   |   Kolb: ', bold: true }),
        new TextRun(r.profile.dominantKolb.join(', ')),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Pontuações VARK — ', bold: true }),
        new TextRun(
          `Visual: ${r.profile.varkScores['Visual'] ?? 0} | Auditivo: ${r.profile.varkScores['Auditivo'] ?? 0} | Leitura/Escrita: ${r.profile.varkScores['Leitura/Escrita'] ?? 0} | Cinestésico: ${r.profile.varkScores['Cinestésico'] ?? 0}`
        ),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Pontuações Kolb — ', bold: true }),
        new TextRun(
          `Ativo: ${r.profile.kolbScores['Ativo'] ?? 0} | Reflexivo: ${r.profile.kolbScores['Reflexivo'] ?? 0} | Teórico: ${r.profile.kolbScores['Teórico'] ?? 0} | Pragmático: ${r.profile.kolbScores['Pragmático'] ?? 0}`
        ),
      ],
    }),
    ...(r.profile.aiAnalysis
      ? [
          new Paragraph({
            children: [new TextRun({ text: 'Análise Personalizada:', bold: true })],
            spacing: { before: 100 },
          }),
          new Paragraph({
            children: [new TextRun({ text: r.profile.aiAnalysis, italics: true })],
          }),
        ]
      : []),
  ]);

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `Relatório da Turma — ${turma}`,
                bold: true,
                size: 36,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `Prof. Thiago Giordano Siqueira  |  Gerado em ${new Date().toLocaleDateString('pt-BR')}`,
                size: 22,
                color: '64748B',
              }),
            ],
            spacing: { after: 400 },
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun(`Resumo — ${records.length} aluno(s)`)],
            spacing: { before: 200, after: 200 },
          }),
          new Table({
            rows: tableRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun('Detalhamento por Aluno')],
            spacing: { before: 600, after: 200 },
          }),
          ...detailSections,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Relatorio_Turma_${turma.replace(/\s+/g, '_')}.docx`;
  a.click();
  URL.revokeObjectURL(url);
};

// ─── PDF Export ──────────────────────────────────────────────────────────────

export const exportClassPDF = (records: StudentRecord[], turma: string) => {
  const doc = new jsPDF({ orientation: 'landscape' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  // Header background
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageW, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(`Relatório da Turma: ${turma}`, 15, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Prof. Thiago Giordano Siqueira  |  ${records.length} aluno(s)  |  Gerado em ${new Date().toLocaleDateString('pt-BR')}`, 15, 28);

  // Summary table headers
  const colHeaders = ['Aluno', 'Curso', 'Data', 'VARK Dominante', 'V', 'A', 'L/E', 'C', 'Kolb Dominante', 'At', 'Rf', 'Te', 'Pr'];
  const colWidths =   [50,     35,     22,    38,               10, 10, 10,   10,  38,               10,   10,   10,   10];

  let startX = 10;
  let y = 50;

  // Header row
  doc.setFillColor(51, 65, 85);
  doc.rect(startX, y - 6, colWidths.reduce((a, b) => a + b, 0), 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  let x = startX + 2;
  colHeaders.forEach((h, i) => {
    doc.text(h, x, y);
    x += colWidths[i];
  });

  y += 6;
  let rowIndex = 0;
  for (const r of records) {
    if (y > pageH - 20) {
      doc.addPage('a4', 'landscape');
      y = 20;
      rowIndex = 0;
    }

    doc.setFillColor(rowIndex % 2 === 0 ? 248 : 241, rowIndex % 2 === 0 ? 250 : 245, rowIndex % 2 === 0 ? 252 : 249);
    doc.rect(startX, y - 5, colWidths.reduce((a, b) => a + b, 0), 9, 'F');

    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    x = startX + 2;

    const vark = r.profile.varkScores;
    const kolb = r.profile.kolbScores;
    const cells = [
      r.profile.name.length > 24 ? r.profile.name.substring(0, 22) + '…' : r.profile.name,
      r.profile.course.length > 18 ? r.profile.course.substring(0, 16) + '…' : r.profile.course,
      formatDate(r.completedAt),
      r.profile.dominantVark.join(', '),
      String(vark['Visual'] ?? 0),
      String(vark['Auditivo'] ?? 0),
      String(vark['Leitura/Escrita'] ?? 0),
      String(vark['Cinestésico'] ?? 0),
      r.profile.dominantKolb.join(', '),
      String(kolb['Ativo'] ?? 0),
      String(kolb['Reflexivo'] ?? 0),
      String(kolb['Teórico'] ?? 0),
      String(kolb['Pragmático'] ?? 0),
    ];

    cells.forEach((cell, i) => {
      doc.text(cell, x, y);
      x += colWidths[i];
    });

    y += 9;
    rowIndex++;
  }

  // ── Per-student detail pages ─────────────────────────────────────────────
  for (const r of records) {
    doc.addPage('a4', 'portrait');
    const pw = doc.internal.pageSize.getWidth();

    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, pw, 38, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`Laudo Individual — ${r.profile.name}`, 15, 18);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Turma: ${r.profile.turma}  |  Curso: ${r.profile.course}  |  Data: ${formatDate(r.completedAt)}`, 15, 28);

    let cy = 55;
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Resultados VARK', 15, cy);
    cy += 7;

    const varkEntries = Object.entries(r.profile.varkScores) as [string, number][];
    const maxV = Math.max(...varkEntries.map(([, v]) => v));
    const barColors: [number, number, number][] = [[59, 130, 246], [16, 185, 129], [245, 158, 11], [239, 68, 68]];
    varkEntries.forEach(([label, score], idx) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      doc.text(label, 15, cy);
      const barW = maxV > 0 ? (score / maxV) * 120 : 0;
      doc.setFillColor(...barColors[idx % barColors.length]);
      doc.roundedRect(70, cy - 5, barW, 6, 1, 1, 'F');
      doc.setTextColor(50, 50, 50);
      doc.text(String(score), 196, cy);
      if (r.profile.dominantVark.includes(label as any)) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(37, 99, 235);
        doc.text('★', 200, cy);
      }
      cy += 10;
    });

    cy += 5;
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Resultados Kolb', 15, cy);
    cy += 7;

    const kolbEntries = Object.entries(r.profile.kolbScores) as [string, number][];
    const maxK = Math.max(...kolbEntries.map(([, v]) => v));
    const kolbColors: [number, number, number][] = [[147, 51, 234], [236, 72, 153], [20, 184, 166], [234, 88, 12]];
    kolbEntries.forEach(([label, score], idx) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      doc.text(label, 15, cy);
      const barW = maxK > 0 ? (score / maxK) * 120 : 0;
      doc.setFillColor(...kolbColors[idx % kolbColors.length]);
      doc.roundedRect(70, cy - 5, barW, 6, 1, 1, 'F');
      doc.text(String(score), 196, cy);
      if (r.profile.dominantKolb.includes(label as any)) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(147, 51, 234);
        doc.text('★', 200, cy);
      }
      cy += 10;
    });

    if (r.profile.aiAnalysis) {
      cy += 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 64, 175);
      doc.text('Análise Personalizada:', 15, cy);
      cy += 8;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      doc.setTextColor(30, 30, 30);
      const lines = doc.splitTextToSize(r.profile.aiAnalysis, 180);
      doc.text(lines, 15, cy);
    }
  }

  doc.save(`Relatorio_Turma_${turma.replace(/\s+/g, '_')}.pdf`);
};
