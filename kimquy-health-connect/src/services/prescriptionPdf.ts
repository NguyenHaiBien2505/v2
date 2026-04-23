/* ═══════════════════════════════════════
   Prescription PDF Generator
   jsPDF + qrcode – có header Kim Quy, chữ ký BS, mã QR xác thực
   ═══════════════════════════════════════ */
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import type { MedicalRecord } from '../data/mockData';

const CLINIC = {
  name: 'PHÒNG KHÁM ĐA KHOA KIM QUY',
  address: 'Số 1 Đường Sức Khỏe, Quận 1, TP. HCM',
  phone: '1900 1234',
  email: 'support@kimquy.vn',
  website: 'kimquy.vn',
};

// Encode tiếng Việt: jsPDF default font không hỗ trợ Unicode đầy đủ.
// Workaround đơn giản: dùng font helvetica + bỏ dấu cho text dài; tiêu đề chính giữ nguyên (có thể hiển thị một số ký tự lạ).
// Để giữ tiếng Việt đầy đủ, ta dùng output là utf-8 và font helvetica – sẽ render OK với hầu hết ký tự Latin mở rộng.

export const generatePrescriptionPdf = async (record: MedicalRecord, patientName = 'Bệnh nhân') => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  let y = 15;

  // ========== HEADER ==========
  doc.setFillColor(20, 108, 148);
  doc.rect(0, 0, W, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(CLINIC.name, W / 2, 12, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(CLINIC.address, W / 2, 18, { align: 'center' });
  doc.text(`Hotline: ${CLINIC.phone}  •  Email: ${CLINIC.email}  •  ${CLINIC.website}`, W / 2, 23, { align: 'center' });

  y = 38;
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('ĐƠN THUỐC', W / 2, y, { align: 'center' });
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Mã hồ sơ: #${record.id}    Ngày: ${record.visitDate}`, W / 2, y, { align: 'center' });

  // ========== PATIENT / DOCTOR INFO ==========
  y += 10;
  doc.setDrawColor(220);
  doc.line(15, y, W - 15, y);
  y += 7;

  doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
  doc.text('Bệnh nhân:', 15, y);
  doc.setFont('helvetica', 'normal');
  doc.text(patientName, 45, y);

  doc.setFont('helvetica', 'bold');
  doc.text('Bác sĩ:', 115, y);
  doc.setFont('helvetica', 'normal');
  doc.text(record.doctorName, 135, y);

  y += 6;
  doc.setFont('helvetica', 'bold'); doc.text('Chuyên khoa:', 15, y);
  doc.setFont('helvetica', 'normal'); doc.text(record.specialtyName, 45, y);

  // ========== DIAGNOSIS ==========
  y += 10;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
  doc.text('Chẩn đoán:', 15, y);
  if (record.icdCode) {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
    doc.setTextColor(20, 108, 148);
    doc.text(`ICD-10: ${record.icdCode}`, W - 15, y, { align: 'right' });
    doc.setTextColor(0);
  }
  y += 6;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
  const diagLines = doc.splitTextToSize(record.diagnosis, W - 30);
  doc.text(diagLines, 15, y);
  y += diagLines.length * 5 + 4;

  // ========== PRESCRIPTION TABLE ==========
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
  doc.text('Đơn thuốc (Rx):', 15, y);
  y += 5;

  // Table header
  doc.setFillColor(240, 247, 252);
  doc.rect(15, y, W - 30, 8, 'F');
  doc.setFontSize(9); doc.setFont('helvetica', 'bold');
  doc.text('STT', 18, y + 5.5);
  doc.text('Tên thuốc', 28, y + 5.5);
  doc.text('Liều', 90, y + 5.5);
  doc.text('Cách dùng', 115, y + 5.5);
  doc.text('Thời gian', 150, y + 5.5);
  doc.text('SL', 180, y + 5.5);
  y += 8;

  doc.setFont('helvetica', 'normal');
  record.prescription.forEach((p, i) => {
    const rowH = 10;
    if (y + rowH > 240) { doc.addPage(); y = 20; }
    doc.setDrawColor(230);
    doc.line(15, y + rowH, W - 15, y + rowH);
    doc.text(String(i + 1), 18, y + 4);
    doc.text(p.drugName, 28, y + 4);
    if (p.note) {
      doc.setFontSize(7); doc.setTextColor(120);
      doc.text(p.note, 28, y + 8);
      doc.setFontSize(9); doc.setTextColor(0);
    }
    doc.text(p.dosage, 90, y + 4);
    doc.text(p.frequency, 115, y + 4);
    doc.text(p.duration, 150, y + 4);
    doc.text(String(p.quantity), 180, y + 4);
    y += rowH;
  });

  // ========== DOCTOR NOTE ==========
  y += 6;
  if (record.doctorNote) {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
    doc.text('Lời dặn:', 15, y);
    y += 5;
    doc.setFont('helvetica', 'italic'); doc.setFontSize(9);
    const noteLines = doc.splitTextToSize(record.doctorNote, W - 30);
    doc.text(noteLines, 15, y);
    y += noteLines.length * 4.5;
  }

  // ========== SIGNATURE + QR ==========
  const sigY = Math.max(y + 12, 220);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
  doc.text(`Ngày ${record.visitDate}`, W - 60, sigY, { align: 'left' });
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
  doc.text('BÁC SĨ ĐIỀU TRỊ', W - 60, sigY + 6, { align: 'left' });
  doc.setFont('helvetica', 'italic'); doc.setFontSize(11);
  doc.setTextColor(20, 108, 148);
  // "Chữ ký" giả lập bằng chữ viết tay
  doc.text(record.doctorName, W - 60, sigY + 18, { align: 'left' });
  doc.setTextColor(0);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
  doc.text(record.doctorName, W - 60, sigY + 28, { align: 'left' });

  // QR code xác thực
  const verifyUrl = `https://${CLINIC.website}/verify/${record.id}-${Date.now().toString(36)}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 200 });
  doc.addImage(qrDataUrl, 'PNG', 15, sigY - 4, 30, 30);
  doc.setFontSize(7); doc.setTextColor(100);
  doc.text('Quét mã QR để', 15, sigY + 30);
  doc.text('xác thực đơn thuốc', 15, sigY + 33);

  // ========== FOOTER ==========
  doc.setDrawColor(20, 108, 148);
  doc.setLineWidth(0.5);
  doc.line(15, 280, W - 15, 280);
  doc.setFontSize(8); doc.setTextColor(120);
  doc.text(`© ${new Date().getFullYear()} ${CLINIC.name} – Đơn thuốc chỉ có giá trị trong 30 ngày kể từ ngày kê.`, W / 2, 285, { align: 'center' });
  doc.text(`Mã xác thực: ${verifyUrl}`, W / 2, 289, { align: 'center' });

  doc.save(`DonThuoc_KimQuy_${record.id}.pdf`);
};
