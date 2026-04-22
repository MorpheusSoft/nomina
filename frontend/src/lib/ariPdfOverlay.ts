import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { format } from 'date-fns';

export async function generateAriPdfOverlay(data: any) {
  // 1. Cargar la plantilla estática PDF
  const url = '/templates/ARI_BLANCO.pdf';
  const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer());

  // 2. Cargar el documento PDF usando pdf-lib
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helveticaRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const { height } = firstPage.getSize();

  // Función ayudante para formatear moneda en Venezuela asegurando casteo a Numero
  const numFormat = (num: any, decimals: boolean = true) =>
    Number(num).toLocaleString('es-VE', {
      minimumFractionDigits: decimals ? 2 : 0,
      maximumFractionDigits: decimals ? 2 : 0
    });

  // Función ayudante para alinear texto a la derecha
  const drawRightAligned = (text: string, rightLimitX: number, yOffsetFromTop: number, size = 10, font: any = helveticaFont) => {
    const textWidth = font.widthOfTextAtSize(text, size);
    const y = height - yOffsetFromTop;
    firstPage.drawText(text, {
      x: rightLimitX - textWidth,
      y,
      size,
      font,
      color: rgb(0, 0, 0)
    });
  };

  // Extracción de variables requeridas para cálculos
  const { tenant, worker, form } = data;
  const isDetailed = form.deductionType === 'DETAILED';
  const valUt = form.taxUnitsValue;

  const totalIngresoBs = form.estimatedRemuneration;
  const B_Uts = Math.round((totalIngresoBs / valUt) * 100) / 100;

  const totalDesgDetBs = isDetailed ? form.detailedDeductionsAmount : 0;
  const D_Uts = isDetailed ? Math.round((totalDesgDetBs / valUt) * 100) / 100 : 0;
  const E_Uts = isDetailed ? 0 : 774;

  const F_Uts = B_Uts - (isDetailed ? D_Uts : E_Uts);
  const netEstimableUt = F_Uts > 0 ? F_Uts : 0;

  let rate = 0;
  let subtrahend = 0;
  if (netEstimableUt <= 1000) { rate = 0.06; subtrahend = 0; }
  else if (netEstimableUt <= 1500) { rate = 0.09; subtrahend = 30; }
  else if (netEstimableUt <= 2000) { rate = 0.12; subtrahend = 75; }
  else if (netEstimableUt <= 2500) { rate = 0.16; subtrahend = 155; }
  else if (netEstimableUt <= 3000) { rate = 0.20; subtrahend = 255; }
  else if (netEstimableUt <= 4000) { rate = 0.24; subtrahend = 375; }
  else if (netEstimableUt <= 6000) { rate = 0.29; subtrahend = 575; }
  else { rate = 0.34; subtrahend = 875; }

  const G_Uts = netEstimableUt > 0 ? (netEstimableUt * rate) - subtrahend : 0;

  const H1 = 10;
  const H2 = form.familyLoadCount * 10;
  const H3 = 0;
  const H_Total = H1 + H2 + H3;

  const I_Uts = G_Uts - H_Total > 0 ? G_Uts - H_Total : 0;
  const J_Percent = B_Uts > 0 ? (I_Uts * 100) / B_Uts : 0;

  // ==== METODO DE INYECCION ====
  // Trazaremos textos en coordenadas con un origin [0,0] en la esquina inferior-izquierda. (Estandar de PDF)
  // X = de izquierda a derecha. Y = de Abajo hacia Arriba. (Height es lo más alto)

  const drawText = (text: string, x: number, yOffsetFromTop: number, size = 10, font = helveticaFont) => {
    // Calculamos Y real partiendo desde el tope
    const y = height - yOffsetFromTop;
    firstPage.drawText(text, {
      x,
      y,
      size,
      font,
      color: rgb(0, 0, 0),
    });
  };

  // ============================================
  // === MAPA EXPERIMENTAL DE COORDENADAS X/Y ===
  // Nota: Estos valores son iniciales para tu calibración
  // ============================================

  // 1. CABECERA
  drawText(form.fiscalYear.toString(), 500, 210, 11);  // Año

  // Relleno de Trimestre usando X
  const createdAtDate = new Date(form.createdAt);
  const quarterIndex = Math.floor(createdAtDate.getMonth() / 3); // 0, 1, 2, 3
  drawText('X', 350 + (quarterIndex * 30), 212, 12); // Trimestre X

  // 2. DATOS DE LOS SUJETOS
  drawText(`${worker.lastName}, ${worker.firstName}`, 55, 170, 9); // Nombres (+57y)
  drawText(`${worker.identity}`, 320, 167, 7); // Cedula (+57x, +57y)
  drawText(`${tenant.name}`, 55, 195, 9); // Empresa Razon Social (+57y)
  drawText(`${tenant.documentId}`, 420, 170, 10); // RIF Empresa (Mantener igual por ahora, no se mencionó)

  // 3. BLOQUES MATEMATICOS
  // A. ESTIMA PERCIBIR (Bs)
  drawText(numFormat(totalIngresoBs), 85, 257, 9); // Total Estima Percibir
  drawRightAligned(numFormat(totalIngresoBs), 510, 287, 9); // Total Estima Percibir
  drawText(numFormat(totalIngresoBs), 130, 310, 9); // Total Estima Percibir

  // B. CONVERSION A U.T.
  drawRightAligned(numFormat(B_Uts), 510, 310, 9); // Conversion B
  drawText(numFormat(valUt), 300, 310, 9); // Valor UT texto medio

  // C. DESGRAVAMEN DETALLADO (BS) - Solo si aplica
  if (isDetailed) {
    drawText(numFormat(form.eduDeductionAmount || 0), 300, 248, 8); // 1. Institutos Docentes
    drawText(numFormat(form.hcmDeductionAmount || 0), 300, 263, 8); // 2. Seguros HCM
    drawText(numFormat(form.medDeductionAmount || 0), 300, 278, 8); // 3. Servicios Médicos
    drawText(numFormat(form.housingDeductionAmount || 0), 300, 293, 8); // 4. Vivienda

    drawText(numFormat(totalDesgDetBs), 300, 312, 9); // TOTAL C
  }

  // D. CONVERSION DESG A U.T. - Solo si aplica
  if (isDetailed) {
    drawText(numFormat(totalDesgDetBs), 90, 332, 9); // Blank 1: Monto en Bs Estimado
    drawText(numFormat(valUt), 190, 332, 9); // Blank 2: Valor UT
    drawText(numFormat(D_Uts), 480, 332, 9); // Blank 3: Total U.T. al final
  }

  // E. DESGRAVAMEN UNICO (U.T.)
  if (!isDetailed) {
    drawRightAligned(numFormat(B_Uts), 140, 435, 9); // Conversion B
    drawRightAligned('774,00', 510, 418, 9);
    drawText('774,00', 250, 435, 9);
  }

  // F. BASE GRAVABLE NETA EN U.T.
  drawRightAligned(numFormat(F_Uts), 510, 435, 9);

  // G. IMPUESTO ANUAL TABLA U.T.
  drawRightAligned(numFormat(G_Uts), 510, 470, 9);

  // H. REBAJAS
  drawText(`${form.familyLoadCount}`, 220, 492, 8); // Cantidad de Cargas
  drawText(numFormat(H2), 360, 492, 8); // Cargas Familiares UT
  drawRightAligned(numFormat(H_Total), 510, 516, 9); // Total Rebajas H

  // I. IMPUESTO A RETENER
  drawRightAligned(numFormat(I_Uts), 510, 525, 8);

  // J. PORCENTAJE
  drawText(`${numFormat(I_Uts)} / ${numFormat(B_Uts)}`, 275, 548, 6); // 
  drawText(`${numFormat(J_Percent)} `, 400, 550, 10, helveticaFont);

  // K. TOTAL RETENCIONES
  drawText(`(${numFormat(I_Uts)} x ${numFormat(valUt)}) - 0`, 350, 620, 6, helveticaFont);
  drawText(`${numFormat(totalIngresoBs)} - 0`, 355, 633, 6, helveticaFont);
  drawText(`${numFormat(J_Percent)} `, 500, 620, 8, helveticaFont);

  // Serialización y Descarga Automática Blob
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
  const downloadUrl = URL.createObjectURL(blob);

  // Hack Programatico de navegador para iniciar descarga limpia
  const tempLink = document.createElement('a');
  tempLink.href = downloadUrl;
  tempLink.download = `ARI_CONSTANCIA_${worker.identity}_${form.fiscalYear}.pdf`;
  document.body.appendChild(tempLink);
  tempLink.click();
  document.body.removeChild(tempLink);
  URL.revokeObjectURL(downloadUrl);
}
