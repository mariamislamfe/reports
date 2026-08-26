import { Document, Page, View, Text, Image, StyleSheet, Font } from "@react-pdf/renderer";
import path from "node:path";
import { HSE_FIELD_KEYS, type Report } from "@/lib/types";
import { reshapeArabicLigatures } from "./arabic-shape";

// -----------------------------------------------------------------------------
// Reproduces the company's real "HSE Observation Record" template
// (PMF-015-HSE-012). Layout, section order, shading colors, and footer text
// were extracted directly from the provided .docx template and a filled
// example — this is not a generic invented layout.
//
// This file is intentionally isolated from the rest of the app: to adjust the
// template further, edit only this file.
//
// Font: the base-14 PDF fonts (Helvetica etc.) have no Arabic glyphs, so any
// Arabic text entered by employees would render as blank space. Cairo covers
// both Arabic and Latin script in one family, so every string in the
// document — English or Arabic — renders correctly regardless of which
// language a field was typed in. (Noto Sans Arabic was tried first but its
// glyph shaping came out corrupted in this renderer for several real Arabic
// strings — dropped/substituted letters — while Cairo renders them cleanly.)
// -----------------------------------------------------------------------------

const FONT_FAMILY = "Cairo";
Font.register({
  family: FONT_FAMILY,
  fonts: [
    { src: path.join(process.cwd(), "public", "fonts", "Cairo-Regular.ttf"), fontWeight: 400 },
    { src: path.join(process.cwd(), "public", "fonts", "Cairo-Bold.ttf"), fontWeight: 700 },
  ],
});
// react-pdf's default hyphenation splits words using Latin-oriented syllable
// rules, which corrupts Arabic script mid-word (dropped/garbled letters).
// Treating every word as unsplittable fixes that; words still wrap normally
// at spaces, they just never get chopped internally.
Font.registerHyphenationCallback((word) => [word]);

const DOC_CODE = "PMF-015-HSE-012_03 HSE Observation Record";
const LABEL_SHADE = "#D9E2F3";
const SECTION_SHADE = "#B4C6E7";
const LINE = "#8496B0";
const INK = "#1e293b";

const styles = StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 9,
    fontFamily: FONT_FAMILY,
    color: INK,
  },
  headerRow: {
    alignItems: "center",
    marginBottom: 4,
  },
  logo: { width: 70, height: 50, objectFit: "contain" },
  title: {
    textAlign: "center",
    fontSize: 14,
    fontFamily: FONT_FAMILY,
    fontWeight: 700,
    marginVertical: 8,
  },

  table: {
    borderWidth: 1,
    borderColor: LINE,
    marginBottom: 4,
  },
  row: { flexDirection: "row", borderBottomWidth: 1, borderColor: LINE },
  rowLast: { flexDirection: "row" },

  labelCell: {
    width: "18%",
    backgroundColor: LABEL_SHADE,
    padding: 4,
    borderRightWidth: 1,
    borderColor: LINE,
    fontFamily: FONT_FAMILY,
    fontWeight: 700,
    fontSize: 8.5,
  },
  valueCell: {
    width: "32%",
    padding: 4,
    borderRightWidth: 1,
    borderColor: LINE,
    fontSize: 8.5,
  },
  valueCellLast: {
    width: "32%",
    padding: 4,
    fontSize: 8.5,
  },

  sectionBar: {
    backgroundColor: SECTION_SHADE,
    padding: 4,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: LINE,
    fontFamily: FONT_FAMILY,
    fontWeight: 700,
    fontSize: 9,
  },

  fullLabelCell: {
    width: "26%",
    backgroundColor: LABEL_SHADE,
    padding: 4,
    borderRightWidth: 1,
    borderColor: LINE,
    fontFamily: FONT_FAMILY,
    fontWeight: 700,
    fontSize: 8,
  },
  fullValueCell: {
    width: "74%",
    padding: 4,
    fontSize: 8.5,
    lineHeight: 1.4,
  },

  photoBox: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: LINE,
    padding: 6,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 6,
  },
  photoSingle: { width: "70%", maxHeight: 220, objectFit: "contain" },
  photoMulti: { width: "31%", maxHeight: 140, objectFit: "contain" },

  signRow: { flexDirection: "row", borderWidth: 1, borderTopWidth: 0, borderColor: LINE },
  signLabelCell: {
    backgroundColor: LABEL_SHADE,
    padding: 4,
    borderRightWidth: 1,
    borderColor: LINE,
    fontFamily: FONT_FAMILY,
    fontWeight: 700,
    fontSize: 8.5,
    width: "10%",
  },
  signValueCell: {
    padding: 4,
    borderRightWidth: 1,
    borderColor: LINE,
    fontSize: 8.5,
    width: "15%",
  },
  signValueCellLast: {
    padding: 4,
    fontSize: 8.5,
    width: "15%",
  },
  signatureImageCell: {
    padding: 2,
    borderRightWidth: 1,
    borderColor: LINE,
    width: "15%",
    alignItems: "center",
    justifyContent: "center",
  },
  signatureImage: { maxWidth: "100%", maxHeight: 26, objectFit: "contain" },

  appendixTable: {
    borderWidth: 1,
    borderColor: LINE,
    marginTop: 10,
    marginBottom: 4,
  },
  appendixTitle: {
    fontSize: 9,
    fontFamily: FONT_FAMILY,
    fontWeight: 700,
    marginBottom: 4,
    marginTop: 8,
  },
  appendixRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: LINE },
  appendixLabel: {
    width: "35%",
    backgroundColor: LABEL_SHADE,
    padding: 4,
    borderRightWidth: 1,
    borderColor: LINE,
    fontFamily: FONT_FAMILY,
    fontWeight: 700,
    fontSize: 8.5,
  },
  appendixValue: { width: "65%", padding: 4, fontSize: 8.5 },

  footer: {
    position: "absolute",
    bottom: 16,
    left: 28,
    right: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7.5,
    color: "#64748b",
    borderTopWidth: 1,
    borderColor: LINE,
    paddingTop: 4,
  },
});

function InfoRow({
  label1,
  value1,
  label2,
  value2,
  last,
}: {
  label1: string;
  value1: string;
  label2: string;
  value2: string;
  last?: boolean;
}) {
  return (
    <View style={last ? styles.rowLast : styles.row}>
      <Text style={styles.labelCell}>{label1}</Text>
      <Text style={styles.valueCell}>{value1 || "—"}</Text>
      <Text style={styles.labelCell}>{label2}</Text>
      <Text style={styles.valueCellLast}>{value2 || "—"}</Text>
    </View>
  );
}

function FullRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.fullLabelCell}>{label}</Text>
      <Text style={styles.fullValueCell}>{value || "—"}</Text>
    </View>
  );
}

function SignOffRow({
  name,
  position,
  date,
  signatureDataUri,
}: {
  name: string;
  position: string;
  date: string;
  signatureDataUri?: string | null;
}) {
  return (
    <View style={styles.signRow}>
      <Text style={styles.signLabelCell}>Name:</Text>
      <Text style={styles.signValueCell}>{name || "—"}</Text>
      <Text style={styles.signLabelCell}>Position:</Text>
      <Text style={styles.signValueCell}>{position || "—"}</Text>
      <Text style={styles.signLabelCell}>Signature:</Text>
      <View style={styles.signatureImageCell}>
        {signatureDataUri && (
          // eslint-disable-next-line jsx-a11y/alt-text
          <Image src={signatureDataUri} style={styles.signatureImage} />
        )}
      </View>
      <Text style={styles.signLabelCell}>Date:</Text>
      <Text style={styles.signValueCellLast}>{date || "—"}</Text>
    </View>
  );
}

function PhotoGrid({ photos }: { photos: string[] }) {
  if (photos.length === 0) return null;
  return (
    <View style={styles.photoBox}>
      {photos.map((src, i) => (
        // eslint-disable-next-line jsx-a11y/alt-text
        <Image key={i} src={src} style={photos.length === 1 ? styles.photoSingle : styles.photoMulti} />
      ))}
    </View>
  );
}

function formatValue(value: unknown): string {
  if (value === undefined || value === null || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return reshapeArabicLigatures(String(value));
}

// Any free-text field (names, positions, project metadata, locations) can
// contain Arabic typed by a user, so every such string is routed through the
// same ligature fix as formatValue — see arabic-shape.ts for why.
const R = (value: string | null | undefined) => reshapeArabicLigatures(value) || "";

export function ViolationReportDocument({
  report,
  photoDataUris,
  logoDataUri,
  signatureDataUri,
  contractorPhotoDataUris,
  contractorSignatureDataUri,
  closeoutSignatureDataUri,
}: {
  report: Report;
  photoDataUris: string[];
  logoDataUri: string | null;
  signatureDataUri: string | null;
  contractorPhotoDataUris: string[];
  contractorSignatureDataUri: string | null;
  closeoutSignatureDataUri: string | null;
}) {
  const createdAt = new Date(report.created_at);
  const dateStr = createdAt.toLocaleDateString("en-GB");
  const timeStr = createdAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const contractorDateStr = report.contractor_submitted_at
    ? new Date(report.contractor_submitted_at).toLocaleDateString("en-GB")
    : "";
  const closeoutDateStr = report.closeout_submitted_at
    ? new Date(report.closeout_submitted_at).toLocaleDateString("en-GB")
    : "";

  const observationDescription = report.field_values[HSE_FIELD_KEYS.OBSERVATION_DESCRIPTION];
  const immediateActions = report.field_values[HSE_FIELD_KEYS.IMMEDIATE_ACTIONS];
  const furtherActions = report.field_values[HSE_FIELD_KEYS.FURTHER_ACTIONS];
  const completionDate = report.field_values[HSE_FIELD_KEYS.COMPLETION_DATE];

  const knownKeys: string[] = Object.values(HSE_FIELD_KEYS);
  const extraFields = report.violation_snapshot.fields.filter((f) => !knownKeys.includes(f.key));

  return (
    <Document title={`HSE Observation Record ${report.report_number}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          {logoDataUri ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image src={logoDataUri} style={styles.logo} />
          ) : null}
        </View>

        <Text style={styles.title}>HSE OBSERVATION RECORD</Text>

        <View style={styles.table}>
          <InfoRow
            label1="Business Unit"
            value1={R(report.project_snapshot.business_unit)}
            label2="Ref"
            value2={report.report_number}
          />
          <InfoRow
            label1="Project"
            value1={R(report.project_snapshot.name)}
            label2="Observation Date"
            value2={dateStr}
          />
          <InfoRow
            label1="Contractor"
            value1={R(report.project_snapshot.contractor)}
            label2="Observation Time"
            value2={timeStr}
          />
          <InfoRow
            label1="Sup Consultant"
            value1={R(report.project_snapshot.sup_consultant)}
            label2="Observation Location"
            value2={R(report.observation_location)}
            last
          />
        </View>

        <Text style={styles.sectionBar}>OBSERVATION: (by supervision consultant)</Text>
        <FullRow label="Observation description" value={formatValue(observationDescription)} />
        <PhotoGrid photos={photoDataUris} />
        <FullRow
          label="Immediate corrective and preventive actions"
          value={formatValue(immediateActions)}
        />
        <FullRow label="Further corrective and preventive actions" value={formatValue(furtherActions)} />
        <FullRow
          label="Comp. date"
          value={`The required date for completing the above mentioned actions is: ${formatValue(completionDate)}`}
        />
        <SignOffRow
          name={R(report.employee_snapshot.full_name)}
          position={R(report.employee_snapshot.position)}
          date={dateStr}
          signatureDataUri={signatureDataUri}
        />

        <Text style={styles.sectionBar}>CLOSE-OUT REQUEST (by contractor)</Text>
        <FullRow label="Descriptions and evidence" value={formatValue(report.contractor_description)} />
        <PhotoGrid photos={contractorPhotoDataUris} />
        <SignOffRow
          name={R(report.contractor_snapshot?.full_name)}
          position={R(report.contractor_snapshot?.position)}
          date={contractorDateStr}
          signatureDataUri={contractorSignatureDataUri}
        />

        <Text style={styles.sectionBar}>CLOSE-OUT (by supervision consultant)</Text>
        <FullRow
          label="Comments:"
          value={formatValue(
            report.closeout_comments ??
              (report.status === "closed"
                ? "This HSE observation record is closed by the below signature."
                : null)
          )}
        />
        <SignOffRow
          name={R(report.closeout_snapshot?.full_name)}
          position={R(report.closeout_snapshot?.position)}
          date={closeoutDateStr}
          signatureDataUri={closeoutSignatureDataUri}
        />

        {(extraFields.length > 0 || report.notes) && (
          <View>
            <Text style={styles.appendixTitle}>Additional Details</Text>
            <View style={styles.appendixTable}>
              {extraFields.map((field, i) => (
                <View
                  key={field.key}
                  style={
                    i === extraFields.length - 1 && !report.notes
                      ? [styles.appendixRow, { borderBottomWidth: 0 }]
                      : styles.appendixRow
                  }
                >
                  <Text style={styles.appendixLabel}>{R(field.label)}</Text>
                  <Text style={styles.appendixValue}>{formatValue(report.field_values[field.key])}</Text>
                </View>
              ))}
              {report.notes && (
                <View style={[styles.appendixRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.appendixLabel}>Additional Notes</Text>
                  <Text style={styles.appendixValue}>{R(report.notes)}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={styles.footer} fixed>
          <Text>{DOC_CODE}</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
