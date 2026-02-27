import { jsPDF } from "jspdf";
import { UserProfile, Course } from "../types";
import { PDF_MESSAGES } from "../constants";

// Helper to add clean text wrapped
const addText = (doc: jsPDF, text: string, x: number, y: number, fontSize: number = 12, font: string = "helvetica", style: string = "normal", maxWidth: number = 170, color: [number, number, number] = [0,0,0]) => {
  doc.setFont(font, style);
  doc.setFontSize(fontSize);
  doc.setTextColor(color[0], color[1], color[2]);
  
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  // line height approx 1.15 * fontSize + padding
  return y + (lines.length * (fontSize * 0.5)) + 6; 
};

export const generatePDF = async (profile: UserProfile) => {
  const doc = new jsPDF();
  
  // --- HEADER ---
  // Background Header
  doc.setFillColor(30, 41, 59); // Slate 800
  doc.rect(0, 0, 210, 50, 'F');
  
  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18); 
  doc.text("Laudo de Perfil de Aprendizagem", 15, 25);
  
  // Header Subtitle info
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Prof. Thiago Giordano Siqueira", 15, 33);
  doc.text(`Emitido em: ${new Date().toLocaleDateString('pt-BR')}`, 15, 38);

  let currentY = 70;
  
  // --- STUDENT IDENTIFICATION ---
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(15, 55, 195, 55);

  doc.setTextColor(30, 41, 59); // Dark slate
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Identificação do Estudante", 15, 65);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Nome:", 15, 75);
  doc.setFont("helvetica", "normal");
  doc.text(profile.name, 35, 75);

  doc.setFont("helvetica", "bold");
  doc.text("Curso:", 110, 75);
  doc.setFont("helvetica", "normal");
  doc.text(profile.course, 130, 75);

  currentY = 85;

  // --- RESULTS BOX ---
  doc.setFillColor(241, 245, 249); // Slate 100
  doc.roundedRect(15, currentY, 180, 35, 3, 3, 'F');
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text("Resultados Obtidos", 25, currentY + 10);

  // VARK Result
  doc.setFontSize(11);
  doc.setTextColor(37, 99, 235); // Blue 600
  doc.text("Perfil VARK Dominante:", 25, currentY + 22);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text(profile.dominantVark.join(' & '), 75, currentY + 22);

  // Kolb Result
  doc.setFont("helvetica", "bold");
  doc.setTextColor(147, 51, 234); // Purple 600
  doc.text("Perfil Kolb Dominante:", 110, currentY + 22);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text(profile.dominantKolb.join(' & '), 155, currentY + 22);

  currentY += 50;

  // --- PEDAGOGICAL ANALYSIS ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text("Análise Pedagógica", 15, currentY);
  currentY += 10;

  // 1. Contextual Message based on Course
  let contextualMessage = PDF_MESSAGES.GENERAL;
  if ([Course.ARQUIVOLOGIA, Course.BIBLIOTECONOMIA, Course.MUSEOLOGIA].includes(profile.course as Course)) {
    contextualMessage = PDF_MESSAGES.GRADUATION;
  } else if (profile.course === Course.MESTRADO_PPGB) {
    contextualMessage = PDF_MESSAGES.MASTERS;
  } else if (profile.course === Course.DOUTORADO_PPGB) {
    contextualMessage = PDF_MESSAGES.PHD;
  }

  currentY = addText(doc, contextualMessage, 15, currentY, 11, "helvetica", "normal", 180, [50, 50, 50]);
  currentY += 5;

  // 2. AI Personalized Analysis
  if (profile.aiAnalysis) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(30, 64, 175); // Blue 800
    doc.text("Análise Personalizada Prof. Thiago:", 15, currentY);
    currentY += 8;
    
    // Add a light border/background for the AI text to make it stand out
    const aiTextY = currentY;
    
    // We add text first to calculate height if we wanted a box, but addText advances Y.
    // For simplicity, just printing the text with a distinct color/style
    currentY = addText(doc, profile.aiAnalysis, 15, currentY, 11, "helvetica", "italic", 180, [20, 20, 20]);
  }

  // --- SIGNATURE AREA ---
  // Ensure we have space at the bottom, or add new page
  if (currentY > 240) {
    doc.addPage();
    currentY = 40;
  } else {
    currentY = 250; // Position at bottom
  }

  doc.setDrawColor(100, 100, 100);
  doc.line(60, currentY, 150, currentY); // Signature line
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("Prof. Thiago Giordano Siqueira", 105, currentY + 5, { align: 'center' });
  // Subtitle removed as requested

  // Save
  doc.save(`Laudo_Aprendizagem_${profile.name.replace(/\s+/g, '_')}.pdf`);
};