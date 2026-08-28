package com.canteen.service;

import com.canteen.entity.Student;
import com.canteen.entity.WalletTransaction;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class StatementPdfService {

    private static final Font TITLE_FONT = new Font(Font.HELVETICA, 18, Font.BOLD);
    private static final Font HEADER_FONT = new Font(Font.HELVETICA, 10, Font.BOLD, Color.WHITE);
    private static final Font NORMAL_FONT = new Font(Font.HELVETICA, 10);
    private static final Font BOLD_FONT = new Font(Font.HELVETICA, 10, Font.BOLD);

    public byte[] generateStatement(Student student, YearMonth month,
                                     BigDecimal openingBalance, BigDecimal closingBalance,
                                     BigDecimal totalCredits, BigDecimal totalDebits,
                                     List<WalletTransaction> transactions) throws Exception {

        Document document = new Document(PageSize.A4, 40, 40, 50, 40);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, baos);
        document.open();

        Paragraph title = new Paragraph("Canteen Wallet Statement", TITLE_FONT);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);

        Paragraph period = new Paragraph(month.getMonth() + " " + month.getYear(),
                new Font(Font.HELVETICA, 11, Font.ITALIC, Color.GRAY));
        period.setAlignment(Element.ALIGN_CENTER);
        period.setSpacingAfter(20);
        document.add(period);

        document.add(new Paragraph("Student: " + student.getName(), BOLD_FONT));
        document.add(new Paragraph("Student ID: " + student.getStudentId(), NORMAL_FONT));
        document.add(new Paragraph("Department: " + nullSafe(student.getDepartment()), NORMAL_FONT));
        document.add(new Paragraph(" "));

        PdfPTable summary = new PdfPTable(2);
        summary.setWidthPercentage(100);
        summary.setSpacingAfter(20);
        addSummaryRow(summary, "Opening Balance", "Rs. " + fmt(openingBalance));
        addSummaryRow(summary, "Total Credits", "Rs. " + fmt(totalCredits));
        addSummaryRow(summary, "Total Debits", "Rs. " + fmt(totalDebits));
        addSummaryRow(summary, "Closing Balance", "Rs. " + fmt(closingBalance));
        document.add(summary);

        document.add(new Paragraph("Transaction Detail", BOLD_FONT));
        document.add(new Paragraph(" "));

        PdfPTable table = new PdfPTable(new float[]{2.2f, 1.3f, 1.5f, 1.5f, 1.5f});
        table.setWidthPercentage(100);

        addHeaderCell(table, "Date");
        addHeaderCell(table, "Type");
        addHeaderCell(table, "Amount");
        addHeaderCell(table, "Balance After");
        addHeaderCell(table, "Description");

        DateTimeFormatter fmtDate = DateTimeFormatter.ofPattern("dd MMM, HH:mm");
        for (WalletTransaction t : transactions) {
            table.addCell(new Phrase(t.getCreatedAt().format(fmtDate), NORMAL_FONT));
            table.addCell(new Phrase(t.getTransactionType().name(), NORMAL_FONT));
            table.addCell(new Phrase("Rs. " + fmt(t.getAmount()), NORMAL_FONT));
            table.addCell(new Phrase("Rs. " + fmt(t.getNewBalance()), NORMAL_FONT));
            table.addCell(new Phrase(nullSafe(t.getDescription()), NORMAL_FONT));
        }
        document.add(table);

        document.close();
        return baos.toByteArray();
    }

    private void addSummaryRow(PdfPTable table, String label, String value) {
        table.addCell(new Phrase(label, BOLD_FONT));
        table.addCell(new Phrase(value, NORMAL_FONT));
    }

    private void addHeaderCell(PdfPTable table, String text) {
        com.lowagie.text.pdf.PdfPCell cell = new com.lowagie.text.pdf.PdfPCell(new Phrase(text, HEADER_FONT));
        cell.setBackgroundColor(new Color(0xB9, 0x86, 0x2B)); // matches your brass accent
        cell.setPadding(6);
        table.addCell(cell);
    }

    private String fmt(BigDecimal value) {
        return value == null ? "0.00" : value.setScale(2, java.math.RoundingMode.HALF_UP).toString();
    }

    private String nullSafe(String s) {
        return s == null || s.isBlank() ? "-" : s;
    }
}