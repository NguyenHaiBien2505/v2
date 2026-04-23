import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiPrinter, FiPaperclip, FiDownload } from 'react-icons/fi';
import { toast } from 'sonner';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { patientSidebar } from './PatientDashboard';
import type { MedicalRecord } from '../../data/mockData';
import { getMedicalRecord } from '../../services/healthApi';
import { generatePrescriptionPdf } from '../../services/prescriptionPdf';
import dashStyles from './PatientDashboard.module.css';
import styles from './PatientMedicalRecords.module.css';

const PatientMedicalRecordDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      const data = await getMedicalRecord(Number(id)).catch(() => null);
      setRecord(data);
      setLoading(false);
    };

    load();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout sections={patientSidebar}>
        <h1 className={dashStyles.pageTitle}>Đang tải hồ sơ...</h1>
      </DashboardLayout>
    );
  }

  if (!record) {
    return (
      <DashboardLayout sections={patientSidebar}>
        <h1 className={dashStyles.pageTitle}>Không tìm thấy hồ sơ</h1>
        <Link to="/patient/medical-records"><button className={styles.printBtn}>← Quay lại</button></Link>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sections={patientSidebar}>
      <button onClick={() => navigate(-1)} className={styles.printBtn} style={{ background: 'transparent', color: 'var(--color-primary)', border: '1px solid var(--color-primary)' }}>
        <FiArrowLeft style={{ marginRight: 6 }} />Quay lại
      </button>
      <h1 className={dashStyles.pageTitle}>Hồ sơ khám bệnh #{record.id}</h1>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <button className={styles.printBtn} onClick={() => window.print()}>
          <FiPrinter style={{ marginRight: 6 }} />In hồ sơ
        </button>
        <button
          className={styles.printBtn}
          style={{ background: 'var(--color-primary)', color: '#fff' }}
          onClick={async () => {
            try {
              await generatePrescriptionPdf(record, 'Bệnh nhân Kim Quy');
              toast.success('Đã tải đơn thuốc PDF');
            } catch (e) {
              toast.error('Lỗi khi tạo PDF');
              console.error(e);
            }
          }}
        >
          <FiDownload style={{ marginRight: 6 }} />Tải đơn thuốc PDF
        </button>
      </div>

      <div className={styles.detailGrid}>
        <div>
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Thông tin khám</div>
            <p className={styles.txt}><strong>Bác sĩ:</strong> {record.doctorName}</p>
            <p className={styles.txt}><strong>Chuyên khoa:</strong> {record.specialtyName}</p>
            <p className={styles.txt}><strong>Ngày khám:</strong> {record.visitDate}</p>
            {record.followUpDate && <p className={styles.txt}><strong>Tái khám:</strong> {record.followUpDate}</p>}
          </div>

          <div className={styles.section}>
            <div className={styles.sectionTitle}>Triệu chứng</div>
            <p className={styles.txt}>{record.symptoms}</p>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionTitle}>Chẩn đoán</div>
            <p className={styles.txt} style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-primary)' }}>{record.diagnosis}</p>
            {record.icdCode && (
              <p className={styles.txt} style={{ marginTop: 6 }}>
                <strong>Mã ICD-10:</strong>{' '}
                <code style={{ background: 'var(--color-bg)', padding: '2px 8px', borderRadius: 4, color: 'var(--color-primary)' }}>{record.icdCode}</code>
              </p>
            )}
          </div>

          <div className={styles.section}>
            <div className={styles.sectionTitle}>Phác đồ điều trị</div>
            <p className={styles.txt}>{record.treatmentPlan}</p>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionTitle}>Đơn thuốc</div>
            <table className={styles.prescTable}>
              <thead>
                <tr>
                  <th>Tên thuốc</th>
                  <th>Liều dùng</th>
                  <th>Cách dùng</th>
                  <th>Thời gian</th>
                  <th>SL</th>
                </tr>
              </thead>
              <tbody>
                {record.prescription.map((p, i) => (
                  <tr key={i}>
                    <td>
                      <div className={styles.drugName}>{p.drugName}</div>
                      {p.note && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 4 }}>{p.note}</div>}
                    </td>
                    <td>{p.dosage}</td>
                    <td>{p.frequency}</td>
                    <td>{p.duration}</td>
                    <td>{p.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {record.doctorNote && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Lời dặn của bác sĩ</div>
              <div className={styles.note}>{record.doctorNote}</div>
            </div>
          )}
        </div>

        <div>
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Chỉ số sinh tồn</div>
            <div className={styles.vitalGrid}>
              <div className={styles.vitalItem}>
                <div className={styles.vitalLabel}>Huyết áp</div>
                <div className={styles.vitalValue}>{record.vitals.bloodPressure}</div>
              </div>
              <div className={styles.vitalItem}>
                <div className={styles.vitalLabel}>Nhịp tim</div>
                <div className={styles.vitalValue}>{record.vitals.heartRate}</div>
              </div>
              <div className={styles.vitalItem}>
                <div className={styles.vitalLabel}>Nhiệt độ</div>
                <div className={styles.vitalValue}>{record.vitals.temperature}</div>
              </div>
              <div className={styles.vitalItem}>
                <div className={styles.vitalLabel}>Cân nặng</div>
                <div className={styles.vitalValue}>{record.vitals.weight}</div>
              </div>
            </div>
          </div>

          {record.attachments.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Tài liệu đính kèm</div>
              <div className={styles.attachList}>
                {record.attachments.map((a, i) => (
                  <div key={i} className={styles.attachItem}>
                    <FiPaperclip />{a.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientMedicalRecordDetail;
