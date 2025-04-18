import { PaginateModel } from "mongoose";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import nodemailer from "nodemailer";
import { SaleRepository } from "../repositories/sales.repository";
import { ItemRepository } from "../repositories/item.repository";
import Sale, { ISale } from "../models/sales.model";
import Item, { IItem } from "../models/item.model";
import { BadRequestError } from "../utils/errors";

interface ReportParams {
  page: number;
  limit: number;
  search: string;
  sort: string;
  startDate?: string;
  endDate?: string;
}

interface LedgerParams extends ReportParams {
  customerId: string;
}

interface ReportResult {
  data: ISale[] | IItem[];
  total: number;
  page: number;
  totalPages: number;
}

export class ReportService {
  private saleRepository: SaleRepository;
  private itemRepository: ItemRepository;
  private transporter: nodemailer.Transporter;

  constructor() {
    this.saleRepository = new SaleRepository(Sale);
    this.itemRepository = new ItemRepository(Item);
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
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

    return {
      data: result.sales,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    };
  }

  async getItemsReport(params: ReportParams): Promise<ReportResult> {
    const { page, limit, search, sort } = params;
    const result = await this.itemRepository.getAllItems({
      page,
      limit,
      search,
      sort,
    });

    return {
      data: result.items,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
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

    return {
      data: result.sales,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    };
  }

  async exportToExcel(
    data: any[],
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
        { header: "Date", key: "date", width: 15 },
        { header: "Payment Type", key: "paymentType", width: 15 },
      ];
      data.forEach((sale: ISale) => {
        worksheet.addRow({
          itemName: (sale.itemId as any)?.name || "N/A",
          customerName: (sale.customerId as any)?.name || "Cash",
          quantity: sale.quantity,
          date: new Date(sale.date).toISOString().split("T")[0],
          paymentType: sale.paymentType,
        });
      });
    } else if (type === "items") {
      worksheet.columns = [
        { header: "Name", key: "name", width: 20 },
        { header: "Description", key: "description", width: 30 },
        { header: "Quantity", key: "quantity", width: 10 },
        { header: "Price", key: "price", width: 10 },
        { header: "Created By", key: "createdBy", width: 20 },
      ];
      data.forEach((item: IItem) => {
        worksheet.addRow({
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          price: item.price,
          createdBy: (item.createdBy as any)?.email || "N/A",
        });
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async exportToPDF(
    data: any[],
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
      doc.fontSize(12).text("Item | Customer | Quantity | Date | Payment Type");
      doc.moveDown();
      data.forEach((sale: ISale) => {
        doc.text(
          `${(sale.itemId as any)?.name || "N/A"} | ${(sale.customerId as any)?.name || "Cash"} | ${
            sale.quantity
          } | ${new Date(sale.date).toISOString().split("T")[0]} | ${sale.paymentType}`
        );
      });
    } else if (type === "items") {
      doc
        .fontSize(12)
        .text("Name | Description | Quantity | Price | Created By");
      doc.moveDown();
      data.forEach((item: IItem) => {
        doc.text(
          `${item.name} | ${item.description} | ${item.quantity} | ${item.price} | ${
            (item.createdBy as any)?.email || "N/A"
          }`
        );
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
