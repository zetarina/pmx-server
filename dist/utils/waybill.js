"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateWaybillPDF = void 0;
const pdf_lib_1 = require("pdf-lib");
const fs_1 = __importDefault(require("fs"));
const qrcode_1 = __importDefault(require("qrcode"));
const bwip_js_1 = __importDefault(require("bwip-js"));
const path_1 = __importDefault(require("path"));
function generateWaybillPDF(packageData) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f;
        try {
            const formPdfPath = path_1.default.join(__dirname, "../public/files/waybill.pdf");
            if (!fs_1.default.existsSync(formPdfPath)) {
                throw new Error(`File not found: ${formPdfPath}`);
            }
            const formPdfBytes = fs_1.default.readFileSync(formPdfPath);
            const pdfDoc = yield pdf_lib_1.PDFDocument.load(formPdfBytes);
            const form = pdfDoc.getForm();
            const fontSize = 7;
            const fromField = form.getTextField("From");
            let fromText = "";
            if (packageData.sender.type === "Guest" && packageData.sender.guest) {
                fromText = `${packageData.sender.guest.name}\n${packageData.sender.guest.phoneNumber}\n${packageData.sender.guest.address}`;
            }
            else if (packageData.sender.type === "Shipper" &&
                packageData.sender.shipper) {
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
            const qrCodeDataUrl = yield qrcode_1.default.toDataURL(qrCodeUrl, {
                errorCorrectionLevel: "H",
            });
            // Generate barcode as data URL
            const barcodeDataUrl = yield new Promise((resolve, reject) => {
                bwip_js_1.default.toBuffer({
                    bcid: "code128",
                    text: barcodeID,
                    scale: 3,
                    height: 10,
                    includetext: true,
                    textxalign: "center",
                }, function (err, png) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        const base64 = png.toString("base64");
                        resolve(`data:image/png;base64,${base64}`);
                    }
                });
            });
            // Convert the data URLs to Uint8Array
            const qrCodeImage = yield pdfDoc.embedPng(qrCodeDataUrl);
            const barcodeImage = yield pdfDoc.embedPng(Buffer.from(barcodeDataUrl.split(",")[1], "base64"));
            const qrCodeField = form.getTextField("QR");
            qrCodeField.enableReadOnly();
            qrCodeField.setAlignment(pdf_lib_1.TextAlignment.Center);
            qrCodeField.setImage(qrCodeImage);
            const barcodeField = form.getTextField("Barcode");
            barcodeField.enableReadOnly();
            barcodeField.setAlignment(pdf_lib_1.TextAlignment.Center);
            barcodeField.setImage(barcodeImage);
            const regionField = form.getTextField("Region");
            let regionText = "";
            const country = ((_a = packageData.sender.guest) === null || _a === void 0 ? void 0 : _a.country) || ((_b = packageData.sender.shipper) === null || _b === void 0 ? void 0 : _b.country);
            if (country) {
                if (country.name === "Thailand") {
                    regionText = "TH";
                }
                else if (country.name === "Myanmar") {
                    regionText = "MMR";
                }
            }
            regionText +=
                "/" +
                    (((_d = (_c = packageData.sender.guest) === null || _c === void 0 ? void 0 : _c.city) === null || _d === void 0 ? void 0 : _d.name) ||
                        ((_f = (_e = packageData.sender.shipper) === null || _e === void 0 ? void 0 : _e.city) === null || _f === void 0 ? void 0 : _f.name));
            regionField.setText(regionText);
            regionField.setFontSize(fontSize);
            regionField.enableReadOnly();
            const companyDetailField = form.getTextField("CompanyDetail");
            companyDetailField.setText("393 Somdet Chao Phraya Rd, Somdet Chao Phraya, Khlong San, Bangkok 10600");
            companyDetailField.setFontSize(fontSize);
            companyDetailField.enableReadOnly();
            const filledPdfBytes = yield pdfDoc.save();
            return filledPdfBytes;
        }
        catch (err) {
            console.error("Error generating waybill:", err);
            throw err;
        }
    });
}
exports.generateWaybillPDF = generateWaybillPDF;
