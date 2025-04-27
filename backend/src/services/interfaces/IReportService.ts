import { LedgerParams, ReportParams, ReportResult } from "../report.service";

export interface IReportService {
  getSalesReport(params: ReportParams): Promise<ReportResult>;
  getItemsReport(params: ReportParams): Promise<ReportResult>;
  getCustomerLedger(params: LedgerParams): Promise<ReportResult>;
  exportToExcel(
    data: any[],
    summary: any,
    type: "sales" | "items" | "ledger"
  ): Promise<Buffer>;
  exportToPDF(
    data: any[],
    summary: any,
    type: "sales" | "items" | "ledger"
  ): Promise<Buffer>;
  sendEmailReport(
    to: string,
    subject: string,
    buffer: Buffer,
    filename: string
  ): Promise<void>;
}