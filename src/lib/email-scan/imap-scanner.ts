import { ImapFlow } from "imapflow";
import { simpleParser, ParsedMail, Attachment } from "mailparser";
import { db } from "@/lib/db";
import { processInvoiceInBackground } from "@/lib/ai/process-invoice";
import { decrypt } from "@/lib/crypto";

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

function isAllowed(contentType: string): contentType is AllowedMimeType {
  return ALLOWED_MIME_TYPES.includes(contentType as AllowedMimeType);
}

export interface ScanResult {
  scanned: number;
  imported: number;
  skipped: number;
  errors: string[];
}

export async function scanEmailInbox(companyId: string): Promise<ScanResult> {
  const company = await db.company.findUnique({
    where: { id: companyId },
    select: {
      emailScanHost: true,
      emailScanPort: true,
      emailScanUser: true,
      emailScanPasswordEncrypted: true,
      emailScanFolder: true,
    },
  });

  if (
    !company?.emailScanHost ||
    !company.emailScanPort ||
    !company.emailScanUser ||
    !company.emailScanPasswordEncrypted
  ) {
    throw new Error("Configuración IMAP incompleta");
  }

  const password = decrypt(company.emailScanPasswordEncrypted);
  const folder = company.emailScanFolder ?? "INBOX";

  const client = new ImapFlow({
    host: company.emailScanHost,
    port: company.emailScanPort,
    secure: company.emailScanPort === 993,
    auth: {
      user: company.emailScanUser,
      pass: password,
    },
    logger: false,
  });

  const result: ScanResult = { scanned: 0, imported: 0, skipped: 0, errors: [] };

  await client.connect();

  try {
    const lock = await client.getMailboxLock(folder);
    try {
      // Search for unread messages only
      const messages = client.fetch("1:*", {
        envelope: true,
        source: true,
        flags: true,
      });

      for await (const msg of messages) {
        // Only process unseen messages
        if (msg.flags.has("\\Seen")) continue;

        result.scanned++;

        let parsed: ParsedMail;
        try {
          parsed = await simpleParser(msg.source);
        } catch (err) {
          result.errors.push(`Error parseando email uid=${msg.uid}: ${err}`);
          continue;
        }

        const messageId = parsed.messageId ?? `uid-${msg.uid}`;

        // Find invoice-like attachments
        const invoiceAttachments = (parsed.attachments ?? []).filter(
          (att: Attachment) =>
            att.contentType && isAllowed(att.contentType.split(";")[0].trim())
        );

        if (invoiceAttachments.length === 0) {
          // No attachments to process — mark as seen so we skip next time
          await client.messageFlagsAdd({ uid: msg.uid }, ["\\Seen"]);
          result.skipped++;
          continue;
        }

        let importedAny = false;

        for (const attachment of invoiceAttachments) {
          const mimeType = attachment.contentType.split(";")[0].trim() as AllowedMimeType;
          const fileName = attachment.filename ?? `factura-${Date.now()}.${mimeType.split("/")[1]}`;

          // Deduplication: skip if already imported (same messageId + filename)
          const dedupeKey = `${messageId}::${fileName}`;
          const existing = await db.invoice.findFirst({
            where: { companyId, emailMessageId: dedupeKey },
            select: { id: true },
          });

          if (existing) {
            result.skipped++;
            continue;
          }

          try {
            const base64 = attachment.content.toString("base64");
            const fileUrl = `data:${mimeType};base64,${base64}`;

            const invoice = await db.invoice.create({
              data: {
                companyId,
                fileUrl,
                fileName,
                fileType: mimeType,
                fileSizeBytes: attachment.size ?? attachment.content.length,
                emailMessageId: dedupeKey,
                status: "PROCESSING",
              },
            });

            processInvoiceInBackground(invoice.id, base64, mimeType, companyId);
            importedAny = true;
            result.imported++;
          } catch (err) {
            result.errors.push(`Error importando adjunto "${fileName}": ${err}`);
          }
        }

        // Mark email as read after processing
        if (importedAny) {
          await client.messageFlagsAdd({ uid: msg.uid }, ["\\Seen"]);
        }
      }
    } finally {
      lock.release();
    }
  } finally {
    await client.logout();
  }

  // Update last run timestamp
  await db.company.update({
    where: { id: companyId },
    data: { emailScanLastRun: new Date() },
  });

  return result;
}
