package com.hostelflow.util;

import com.google.zxing.*;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.UUID;

@Component
public class QRCodeUtil {

    @Value("${app.qr.size}")
    private int qrSize;

    @Value("${app.qr.base-url}")
    private String baseUrl;

    public String generateQRToken() {
        return UUID.randomUUID().toString().replace("-", "").toUpperCase();
    }

    public String generateQRCodeBase64(String token) {
        try {
            String qrContent = baseUrl + "?token=" + token;
            QRCodeWriter writer = new QRCodeWriter();
            BitMatrix bitMatrix = writer.encode(qrContent, BarcodeFormat.QR_CODE, qrSize, qrSize);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", baos);
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(baos.toByteArray());
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate QR code", e);
        }
    }
}
