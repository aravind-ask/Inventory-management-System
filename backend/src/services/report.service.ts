import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import nodemailer from "nodemailer";
import { SalesSummary } from "../repositories/sales.repository";
import { ItemsSummary } from "../repositories/item.repository";
import { BadRequestError } from "../utils/errors";
import { IReportService } from "./interfaces/IReportService";
import { ISaleRepository } from "../repositories/interfaces/ISalesRepository";
import { IItemRepository } from "../repositories/interfaces/IItemRepository";

export interface ReportParams {
  page: number;
  limit: number;
  search: string;
  sort: string;
  startDate?: string;
  endDate?: string;
}

export interface LedgerParams extends ReportParams {
  customerId: string;
}

export interface LedgerSummary {
  totalSpent: number;
  totalTransactions: number;
  averageTransactionValue: number;
  paymentTypeBreakdown: { type: string; count: number; percentage: number }[];
}

export interface ReportResult {
  data: any[];
  total: number;
  page: number;
  totalPages: number;
  summary: SalesSummary | ItemsSummary | LedgerSummary;
}

export class ReportService implements IReportService {
  private saleRepository: ISaleRepository;
  private itemRepository: IItemRepository;
  private transporter: nodemailer.Transporter;

  constructor(
    saleRepository: ISaleRepository,
    itemRepository: IItemRepository
  ) {
    this.saleRepository = saleRepository;
    this.itemRepository = itemRepository;

    const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;
    if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS) {
      throw new Error(
        "Missing email configuration. Ensure EMAIL_HOST, EMAIL_PORT, EMAIL_USER, and EMAIL_PASS are set in environment variables."
      );
    }

    this.transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: Number(EMAIL_PORT),
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });
  }

  async getSalesReport(params: ReportParams): Promise<ReportResult> {
    const { page, limit, search, sort, startDate, endDate } = params;
    if (startDate && isNaN(Date.parse(startDate))) {
      throw new BadRequestError("Invalid start date");
    }
    if (endDate && isNaN(Date.parse(endDate))) {
      throw new BadRequestError("Invalid end date");
    }

    const result = await this.saleRepository.getAllSales({
      page,
      limit,
      search,
      sort,
      startDate,
      endDate,
    });

    const summary = await this.saleRepository.getSalesSummary({
      search,
      sort,
      startDate,
      endDate,
    });

    return {
      data: result.sales.map((sale) => ({
        ...sale.toObject(),
        unitPrice: (sale.itemId as any)?.price || 0,
        totalPrice: sale.quantity * ((sale.itemId as any)?.price || 0),
      })),
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      summary,
    };
  }

  async getItemsReport(params: ReportParams): Promise<ReportResult> {
    const { page, limit, search, sort, startDate, endDate } = params;
    const result = await this.itemRepository.getAllItems({
      page,
      limit,
      search,
      sort,
      startDate,
      endDate,
    });

    const summary = await this.itemRepository.getItemsSummary({
      search,
      sort,
      startDate,
      endDate,
    });

    return {
      data: result.items.map((item) => ({
        ...item.toObject(),
        totalValue: item.quantity * item.price,
      })),
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      summary,
    };
  }

  async getCustomerLedger(params: LedgerParams): Promise<ReportResult> {
    const { customerId, page, limit, search, sort } = params;
    if (!customerId) {
      throw new BadRequestError("Customer ID is required");
    }

    const result = await this.saleRepository.getAllSales({
      page,
      limit,
      search,
      sort,
      customerId,
    });

    const summary = await this.saleRepository.getSalesSummary({
      search,
      sort,
      customerId,
    });

    return {
      data: result.sales.map((sale) => ({
        ...sale.toObject(),
        unitPrice: (sale.itemId as any)?.price || 0,
        totalPrice: sale.quantity * ((sale.itemId as any)?.price || 0),
      })),
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      summary,
    };
  }

  async exportToExcel(
    data: any[],
    summary: any,
    type: "sales" | "items" | "ledger"
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(
      type.charAt(0).toUpperCase() + type.slice(1)
    );

    if (type === "sales" || type === "ledger") {
      worksheet.columns = [
        { header: "Item", key: "itemName", width: 20 },
        { header: "Customer", key: "customerName", width: 20 },
        { header: "Quantity", key: "quantity", width: 10 },
        { header: "Unit Price", key: "unitPrice", width: 10 },
        { header: "Total Price", key: "totalPrice", width: 10 },
        { header: "Date", key: "date", width: 15 },
        { header: "Payment Type", key: "paymentType", width: 15 },
      ];
      data.forEach((sale: any) => {
        worksheet.addRow({
          itemName: sale.itemId?.name || "N/A",
          customerName: sale.customerId?.name || "Cash",
          quantity: sale.quantity,
          unitPrice: sale.unitPrice,
          totalPrice: sale.totalPrice,
          date: new Date(sale.date).toISOString().split("T")[0],
          paymentType: sale.paymentType,
        });
      });
      worksheet.addRow([]);
      worksheet.addRow(["Summary"]);
      if (type === "sales") {
        worksheet.addRow([
          "Total Revenue",
          `$${summary.totalRevenue.toFixed(2)}`,
        ]);
        worksheet.addRow(["Total Sales", summary.totalSales]);
        worksheet.addRow([
          "Average Sale Price",
          `$${summary.averageSalePrice.toFixed(2)}`,
        ]);
        worksheet.addRow(["Top Items"]);
        summary.topItems.forEach((item: any, index: number) => {
          worksheet.addRow([
            `#${index + 1}`,
            item.name,
            item.quantity,
            `$${item.revenue.toFixed(2)}`,
          ]);
        });
      } else {
        worksheet.addRow(["Total Spent", `$${summary.totalSpent.toFixed(2)}`]);
        worksheet.addRow(["Total Transactions", summary.totalTransactions]);
        worksheet.addRow([
          "Average Transaction Value",
          `$${summary.averageTransactionValue.toFixed(2)}`,
        ]);
        worksheet.addRow(["Payment Type Breakdown"]);
        summary.paymentTypeBreakdown.forEach((pt: any) => {
          worksheet.addRow([pt.type, pt.count, `${pt.percentage.toFixed(2)}%`]);
        });
      }
    } else if (type === "items") {
      worksheet.columns = [
        { header: "Name", key: "name", width: 20 },
        { header: "Description", key: "description", width: 30 },
        { header: "Quantity", key: "quantity", width: 10 },
        { header: "Price", key: "price", width: 10 },
        { header: "Total Value", key: "totalValue", width: 10 },
        { header: "Created By", key: "createdBy", width: 20 },
      ];
      data.forEach((item: any) => {
        worksheet.addRow({
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          price: item.price,
          totalValue: item.totalValue,
          createdBy: item.createdBy?.email || "N/A",
        });
      });
      worksheet.addRow([]);
      worksheet.addRow(["Summary"]);
      worksheet.addRow([
        "Total Inventory Value",
        `$${summary.totalInventoryValue.toFixed(2)}`,
      ]);
      worksheet.addRow(["Total Items", summary.totalItems]);
      worksheet.addRow([
        "Average Price",
        `$${summary.averagePrice.toFixed(2)}`,
      ]);
      worksheet.addRow(["Low Stock Items", summary.lowStockItems]);
      worksheet.addRow(["Top Turnover Rates"]);
      summary.turnoverRate.forEach((item: any, index: number) => {
        worksheet.addRow([`#${index + 1}`, item.name, item.rate.toFixed(2)]);
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async exportToPDF(
    data: any[],
    summary: any,
    type: "sales" | "items" | "ledger"
  ): Promise<Buffer> {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 60, bottom: 50, left: 50, right: 50 },
      bufferPages: true,
    });
    const buffers: Buffer[] = [];
    doc.on("data", (chunk) => buffers.push(chunk));

    // ---- 1. Header ----
    doc
      .font("Helvetica-Bold")
      .fontSize(18)
      .text("Inventory Management Pro", 50, 30);
    doc
      .font("Helvetica")
      .fontSize(12)
      .text(`${type.toUpperCase()} Report`, 50, 55);
    doc
      .font("Helvetica-Oblique")
      .fontSize(10)
      .text(`Generated on: ${new Date().toLocaleString()}`, { align: "right" });
    doc.moveTo(50, 75).lineTo(545, 75).stroke();
    doc.moveDown(2);

    // ---- 2. Table Headers and Rows ----
    let headers: string[] = [];
    let rows: string[][] = [];
    let colWidths: number[] = [];

    if (type === "sales" || type === "ledger") {
      headers = [
        "Item",
        "Customer",
        "Qty",
        "Unit Price",
        "Total",
        "Date",
        "Payment",
      ];
      colWidths = [80, 100, 40, 60, 60, 80, 80];
      rows = data.map((sale) => [
        sale.itemId?.name || "N/A",
        sale.customerId?.name || "Cash",
        sale.quantity.toString(),
        `$${sale.unitPrice.toFixed(2)}`,
        `$${sale.totalPrice.toFixed(2)}`,
        new Date(sale.date).toISOString().split("T")[0],
        sale.paymentType,
      ]);
    } else {
      headers = [
        "Name",
        "Description",
        "Qty",
        "Price",
        "Total Value",
        "Created By",
      ];
      colWidths = [90, 160, 40, 50, 70, 95];
      rows = data.map((item) => [
        item.name,
        item.description,
        item.quantity.toString(),
        `$${item.price.toFixed(2)}`,
        `$${item.totalValue.toFixed(2)}`,
        item.createdBy?.email || "N/A",
      ]);
    }

    const tableTop = doc.y;
    const rowHeight = 24;

    function renderTableHeader(y: number) {
      headers.forEach((header, i) => {
        doc
          .rect(
            50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0),
            y,
            colWidths[i],
            rowHeight
          )
          .fill("#f2f2f2")
          .stroke();
        doc
          .fillColor("black")
          .font("Helvetica-Bold")
          .fontSize(10)
          .text(
            header,
            52 + colWidths.slice(0, i).reduce((a, b) => a + b, 0),
            y + 6,
            {
              width: colWidths[i] - 4,
              align: "left",
              ellipsis: true,
            }
          );
      });
    }

    function renderTableRow(row: string[], y: number) {
      row.forEach((cell, i) => {
        const textSize = cell.length > 25 ? 8 : 9;
        doc
          .font("Helvetica")
          .fontSize(textSize)
          .fillColor("black")
          .text(
            cell,
            52 + colWidths.slice(0, i).reduce((a, b) => a + b, 0),
            y + 6,
            {
              width: colWidths[i] - 4,
              align: "left",
              ellipsis: true,
            }
          );
        doc
          .rect(
            50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0),
            y,
            colWidths[i],
            rowHeight
          )
          .stroke();
      });
    }

    renderTableHeader(tableTop);
    let y = tableTop + 20;

    for (const row of rows) {
      if (y > 720) {
        doc.addPage();
        y = 50;
        renderTableHeader(y);
        y += 20;
      }
      renderTableRow(row, y);
      y += 20;
    }

    // ---- 3. Summary Section ----
    doc.addPage();
    doc
      .moveDown()
      .font("Helvetica-Bold")
      .fontSize(14)
      .text("Summary", { underline: true });
    doc.moveDown();

    if (type === "sales") {
      doc
        .fontSize(11)
        .font("Helvetica")
        .text(`Total Revenue: $${summary.totalRevenue.toFixed(2)}`)
        .text(`Total Sales: ${summary.totalSales}`)
        .text(`Average Sale Price: $${summary.averageSalePrice.toFixed(2)}`)
        .moveDown()
        .text("Top Items:", { underline: true });
      summary.topItems.forEach((item: any, i: number) => {
        doc.text(
          `${i + 1}. ${item.name} — Qty: ${item.quantity}, Revenue: $${item.revenue.toFixed(2)}`
        );
      });
    } else if (type === "ledger") {
      doc
        .fontSize(11)
        .font("Helvetica")
        .text(`Total Spent: $${summary.totalSpent.toFixed(2)}`)
        .text(`Total Transactions: ${summary.totalTransactions}`)
        .text(
          `Average Transaction Value: $${summary.averageTransactionValue.toFixed(2)}`
        )
        .moveDown()
        .text("Payment Breakdown:", { underline: true });
      summary.paymentTypeBreakdown.forEach((pt: any) => {
        doc.text(
          `${pt.type} — Count: ${pt.count}, ${pt.percentage.toFixed(2)}%`
        );
      });
    } else if (type === "items") {
      doc
        .fontSize(11)
        .font("Helvetica")
        .text(
          `Total Inventory Value: $${summary.totalInventoryValue.toFixed(2)}`
        )
        .text(`Total Items: ${summary.totalItems}`)
        .text(`Average Price: $${summary.averagePrice.toFixed(2)}`)
        .text(`Low Stock Items: ${summary.lowStockItems}`)
        .moveDown()
        .text("Top Turnover:", { underline: true });
      summary.turnoverRate.forEach((item: any, i: number) => {
        doc.text(`${i + 1}. ${item.name} — Rate: ${item.rate.toFixed(2)}`);
      });
    }

    // ---- 4. Footer with Page Numbers ----
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      doc
        .fontSize(8)
        .fillColor("gray")
        .text(`Page ${i + 1} of ${range.count}`, 0, 820, {
          align: "center",
        });
    }

    doc.end();
    return new Promise<Buffer>((resolve) =>
      doc.on("end", () => resolve(Buffer.concat(buffers)))
    );
  }

  async sendEmailReport(
    to: string,
    subject: string,
    buffer: Buffer,
    filename: string
  ): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text: `Attached is the ${filename} report.`,
      attachments: [
        {
          filename,
          content: buffer,
        },
      ],
    });
  }
}
