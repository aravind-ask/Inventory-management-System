import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import nodemailer from "nodemailer";
import {
  SalesSummary,
} from "../repositories/sales.repository";
import {
  ItemsSummary,
} from "../repositories/item.repository";
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
    const doc = new PDFDocument();
    const buffers: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => buffers.push(chunk));
    doc.on("end", () => {});

    doc
      .fontSize(16)
      .text(`${type.charAt(0).toUpperCase() + type.slice(1)} Report`, {
        align: "center",
      });
    doc.moveDown();

    if (type === "sales" || type === "ledger") {
      doc
        .fontSize(12)
        .text(
          "Item | Customer | Quantity | Unit Price | Total Price | Date | Payment Type"
        );
      doc.moveDown();
      data.forEach((sale: any) => {
        doc.text(
          `${sale.itemId?.name || "N/A"} | ${sale.customerId?.name || "Cash"} | ${
            sale.quantity
          } | $${sale.unitPrice.toFixed(2)} | $${sale.totalPrice.toFixed(2)} | ${
            new Date(sale.date).toISOString().split("T")[0]
          } | ${sale.paymentType}`
        );
      });
      doc.moveDown();
      doc.fontSize(14).text("Summary");
      if (type === "sales") {
        doc
          .fontSize(12)
          .text(`Total Revenue: $${summary.totalRevenue.toFixed(2)}`);
        doc.text(`Total Sales: ${summary.totalSales}`);
        doc.text(`Average Sale Price: $${summary.averageSalePrice.toFixed(2)}`);
        doc.text("Top Items:");
        summary.topItems.forEach((item: any, index: number) => {
          doc.text(
            `#${index + 1}: ${item.name} - ${item.quantity} units, $${item.revenue.toFixed(2)}`
          );
        });
      } else {
        doc.fontSize(12).text(`Total Spent: $${summary.totalSpent.toFixed(2)}`);
        doc.text(`Total Transactions: ${summary.totalTransactions}`);
        doc.text(
          `Average Transaction Value: $${summary.averageTransactionValue.toFixed(2)}`
        );
        doc.text("Payment Type Breakdown:");
        summary.paymentTypeBreakdown.forEach((pt: any) => {
          doc.text(`${pt.type}: ${pt.count} (${pt.percentage.toFixed(2)}%)`);
        });
      }
    } else if (type === "items") {
      doc
        .fontSize(12)
        .text(
          "Name | Description | Quantity | Price | Total Value | Created By"
        );
      doc.moveDown();
      data.forEach((item: any) => {
        doc.text(
          `${item.name} | ${item.description} | ${item.quantity} | $${item.price.toFixed(2)} | $${item.totalValue.toFixed(2)} | ${
            item.createdBy?.email || "N/A"
          }`
        );
      });
      doc.moveDown();
      doc.fontSize(14).text("Summary");
      doc
        .fontSize(12)
        .text(
          `Total Inventory Value: $${summary.totalInventoryValue.toFixed(2)}`
        );
      doc.text(`Total Items: ${summary.totalItems}`);
      doc.text(`Average Price: $${summary.averagePrice.toFixed(2)}`);
      doc.text(`Low Stock Items: ${summary.lowStockItems}`);
      doc.text("Top Turnover Rates:");
      summary.turnoverRate.forEach((item: any, index: number) => {
        doc.text(`#${index + 1}: ${item.name} - ${item.rate.toFixed(2)}`);
      });
    }

    doc.end();
    return new Promise<Buffer>((resolve) => {
      doc.on("end", () => {
        const finalBuffer = Buffer.concat(buffers);
        resolve(finalBuffer);
      });
    });
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
