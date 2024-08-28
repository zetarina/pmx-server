import { PDFDocument, TextAlignment } from "pdf-lib";
import fs from "fs";
import QRCode from "qrcode";
import bwipjs from "bwip-js";
import { Parcel } from "../models/Parcel";
import path from "path";

export async function generateWaybillPDF(packageData: Parcel) {
  try {
    const formPdfPath = path.join(__dirname, "../public/files/waybill.pdf");
    if (!fs.existsSync(formPdfPath)) {
      throw new Error(`File not found: ${formPdfPath}`);
    }

    const formPdfBytes = fs.readFileSync(formPdfPath);
    const pdfDoc = await PDFDocument.load(formPdfBytes);
    const form = pdfDoc.getForm();
    const fontSize = 7;

    const fromField = form.getTextField("From");
    let fromText = "";

    if (packageData.sender.type === "Guest" && packageData.sender.guest) {
      fromText = `${packageData.sender.guest.name}\n${packageData.sender.guest.phoneNumber}\n${packageData.sender.guest.address}`;
    } else if (
      packageData.sender.type === "Shipper" &&
      packageData.sender.shipper
    ) {
      fromText = `${packageData.sender.shipper.username}\n${packageData.sender.shipper.email}\n${packageData.sender.shipper.address}`;
    }

    fromField.setText(fromText);
    fromField.setFontSize(fontSize);
    fromField.enableReadOnly();

    const toField = form.getTextField("To");
    const toText = `${packageData.receiver.name}\n${packageData.receiver.phoneNumber}\n${packageData.receiver.address}`;
    toField.setText(toText);
    toField.setFontSize(fontSize);
    toField.enableReadOnly();

    const remarkField = form.getTextField("Remark");
    remarkField.setText(packageData.remark || "Remark \n ");
    remarkField.setFontSize(fontSize);
    remarkField.enableReadOnly();

    const descriptionField = form.getTextField("Description");
    descriptionField.setText("");
    descriptionField.setFontSize(fontSize);
    descriptionField.enableReadOnly();

    const paymentTypeText = `Payment Type: ${packageData.paymentType}`;
    const paymentTypeField = form.getTextField("PaymentType");
    paymentTypeField.setText(paymentTypeText);
    paymentTypeField.setFontSize(fontSize);
    paymentTypeField.enableReadOnly();

    const totalText = `Total: ${packageData.totalFeeIfPaid} Baht`;
    const totalField = form.getTextField("Total");
    totalField.setText(totalText);
    totalField.setFontSize(fontSize);
    totalField.enableReadOnly();

    const createdDate = packageData.createdAt
      ? new Date(packageData.createdAt)
      : null;
    const createdDateText = createdDate
      ? createdDate.toLocaleDateString("en-GB")
      : "";
    const createdDateField = form.getTextField("Created_Date");
    createdDateField.setText(`Created Date: ${createdDateText}`);
    createdDateField.setFontSize(fontSize);
    createdDateField.enableReadOnly();

    const qrCodeUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/tracking/${packageData.parcelId}`;
    const barcodeID = `${packageData.parcelId}`;

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl, {
      errorCorrectionLevel: "H",
    });

    // Generate barcode as data URL
    const barcodeDataUrl = await new Promise<string>((resolve, reject) => {
      bwipjs.toBuffer(
        {
          bcid: "code128",
          text: barcodeID,
          scale: 3,
          height: 10,
          includetext: true,
          textxalign: "center",
        },
        function (err, png) {
          if (err) {
            reject(err);
          } else {
            const base64 = png.toString("base64");
            resolve(`data:image/png;base64,${base64}`);
          }
        }
      );
    });

    // Convert the data URLs to Uint8Array
    const qrCodeImage = await pdfDoc.embedPng(qrCodeDataUrl);
    const barcodeImage = await pdfDoc.embedPng(
      Buffer.from(barcodeDataUrl.split(",")[1], "base64")
    );

    const qrCodeField = form.getTextField("QR");
    qrCodeField.enableReadOnly();
    qrCodeField.setAlignment(TextAlignment.Center);
    qrCodeField.setImage(qrCodeImage);

    const barcodeField = form.getTextField("Barcode");
    barcodeField.enableReadOnly();
    barcodeField.setAlignment(TextAlignment.Center);
    barcodeField.setImage(barcodeImage);

    const regionField = form.getTextField("Region");
    let regionText = "";

    const country =
      packageData.sender.guest?.country || packageData.sender.shipper?.country;
    if (country) {
      if (country.name === "Thailand") {
        regionText = "TH";
      } else if (country.name === "Myanmar") {
        regionText = "MMR";
      } 
    }

    regionText +=
      "/" +
      (packageData.sender.guest?.city?.name ||
        packageData.sender.shipper?.city?.name);
    regionField.setText(regionText);
    regionField.setFontSize(fontSize);
    regionField.enableReadOnly();

    const companyDetailField = form.getTextField("CompanyDetail");
    companyDetailField.setText(
      "393 Somdet Chao Phraya Rd, Somdet Chao Phraya, Khlong San, Bangkok 10600"
    );
    companyDetailField.setFontSize(fontSize);
    companyDetailField.enableReadOnly();

    const filledPdfBytes = await pdfDoc.save();
    return filledPdfBytes;
  } catch (err) {
    console.error("Error generating waybill:", err);
    throw err;
  }
}
