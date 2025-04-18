import { FilterQuery } from "mongoose";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import nodemailer from "nodemailer";
import { SaleRepository } from "../repositories/sales.repository";
import { ItemRepository } from "../repositories/item.repository";
import Sale, { ISale } from "../models/sales.model";
import Item, { IItem } from "../models/item.model";
import { BadRequestError } from "../utils/errors";

interface ReportFilter {
  startDate?: Date;
  endDate?: Date;
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

  async getSalesReport(filter: ReportFilter): Promise<ISale[]> {
    const query: FilterQuery<ISale> = {};
    if (filter.startDate || filter.endDate) {
      query.date = {};
      if (filter.startDate) query.date.$gte = filter.startDate;
      if (filter.endDate) query.date.$lte = filter.endDate;
    }
    return this.saleRepository.findAll(query);
  }

  async getItemsReport(): Promise<IItem[]> {
    return this.itemRepository.findAll();
  }

  async getCustomerLedger(customerId: string): Promise<ISale[]> {
    if (!customerId) {
      throw new BadRequestError("Customer ID is required");
    }
    return this.saleRepository.findAll({ customerId });
  }

  async exportToExcel(
    data: any[],
    type: "sales" | "items" | "ledger"
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(
      type.charAt(0).toUpperCase() + type.slice(1)
    );

    if (type === "sales") {
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
          date: sale.date.toISOString().split("T")[0],
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
    } else if (type === "ledger") {
      worksheet.columns = [
        { header: "Item", key: "itemName", width: 20 },
        { header: "Quantity", key: "quantity", width: 10 },
        { header: "Date", key: "date", width: 15 },
        { header: "Payment Type", key: "paymentType", width: 15 },
      ];
      data.forEach((sale: ISale) => {
        worksheet.addRow({
          itemName: (sale.itemId as any)?.name || "N/A",
          quantity: sale.quantity,
          date: sale.date.toISOString().split("T")[0],
          paymentType: sale.paymentType,
        });
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer) as Buffer;
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

    if (type === "sales") {
      doc.fontSize(12).text("Item | Customer | Quantity | Date | Payment Type");
      doc.moveDown();
      data.forEach((sale: ISale) => {
        doc.text(
          `${(sale.itemId as any)?.name || "N/A"} | ${(sale.customerId as any)?.name || "Cash"} | ${
            sale.quantity
          } | ${sale.date.toISOString().split("T")[0]} | ${sale.paymentType}`
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
    } else if (type === "ledger") {
      doc.fontSize(12).text("Item | Quantity | Date | Payment Type");
      doc.moveDown();
      data.forEach((sale: ISale) => {
        doc.text(
          `${(sale.itemId as any)?.name || "N/A"} | ${sale.quantity} | ${
            sale.date.toISOString().split("T")[0]
          } | ${sale.paymentType}`
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
