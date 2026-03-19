import nodemailer from 'nodemailer';

// Configure email transporter
const createTransporter = () => {
  // Update these with your email credentials
  return nodemailer.createTransport({
    service: 'gmail', // or your email service
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASS || 'your-app-password'
    }
  });
};

// Function to convert number to words (Indian format)
const numberToWords = (num) => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (num === 0) return 'Zero';

  let result = '';

  // Handle crores
  if (num >= 10000000) {
    result += numberToWords(Math.floor(num / 10000000)) + ' Crore ';
    num %= 10000000;
  }

  // Handle lakhs
  if (num >= 100000) {
    result += numberToWords(Math.floor(num / 100000)) + ' Lakh ';
    num %= 100000;
  }

  // Handle thousands
  if (num >= 1000) {
    result += numberToWords(Math.floor(num / 1000)) + ' Thousand ';
    num %= 1000;
  }

  // Handle hundreds
  if (num >= 100) {
    result += ones[Math.floor(num / 100)] + ' Hundred ';
    num %= 100;
  }

  // Handle tens and ones
  if (num >= 20) {
    result += tens[Math.floor(num / 10)] + ' ';
    num %= 10;
  } else if (num >= 10) {
    result += teens[num - 10] + ' ';
    return result.trim();
  }

  if (num > 0) {
    result += ones[num] + ' ';
  }

  return result.trim();
};

// Generate HTML email template for installment receipt (table-based for email client compatibility)
const generateInstallmentReceiptHTML = (student, installment, totalPaidSoFar, remainingAmount) => {
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
  const amountInWords = numberToWords(installment.amount);
  const totalFees = totalPaidSoFar + remainingAmount;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fee Receipt</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4;padding:20px 0;">
    <tr>
      <td align="center">

        <!-- Receipt card -->
        <table width="620" cellpadding="0" cellspacing="0" border="0"
          style="background-color:#ffffff;border:2px solid #2C3E50;border-radius:6px;overflow:hidden;max-width:620px;">

          <!-- ── Header ── -->
          <tr>
            <td align="center" bgcolor="#2C3E50"
              style="padding:20px 30px;background-color:#2C3E50;">
              <p style="margin:0;font-size:22px;font-weight:bold;color:#ffffff;letter-spacing:1px;">
                Pratik Patil's Maths Academy
              </p>
              <p style="margin:6px 0 0;font-size:13px;color:#b0c4d8;">
                Rajarampuri, Kolhapur &nbsp;|&nbsp; Contact: 7741814181
              </p>
            </td>
          </tr>

          <!-- ── Title bar ── -->
          <tr>
            <td align="center" bgcolor="#f0f4f8"
              style="padding:10px;background-color:#f0f4f8;border-bottom:1px solid #dce3ea;">
              <p style="margin:0;font-size:15px;font-weight:bold;color:#2C3E50;letter-spacing:2px;">
                FEE RECEIPT
              </p>
            </td>
          </tr>

          <!-- ── Receipt No / Date ── -->
          <tr>
            <td style="padding:14px 30px;border-bottom:1px solid #e8edf2;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-size:13px;color:#444;">
                    <b>Receipt No:</b>&nbsp;
                    <span style="font-family:monospace;font-size:13px;color:#2C3E50;">
                      ${installment.installmentReceiptNumber}
                    </span>
                  </td>
                  <td align="right" style="font-size:13px;color:#444;">
                    <b>Date:</b>&nbsp;${currentDate}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── Student Info ── -->
          <tr>
            <td bgcolor="#f9fafb" style="padding:14px 30px;background-color:#f9fafb;border-bottom:1px solid #e8edf2;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:bold;color:#888;text-transform:uppercase;letter-spacing:1px;">
                Student Information
              </p>
              <table width="100%" cellpadding="4" cellspacing="0" border="0">
                <tr>
                  <td width="50%" style="font-size:13px;color:#555;">
                    <b style="color:#333;">Name:</b>&nbsp;${student.personalDetails.fullName}
                  </td>
                  <td width="50%" style="font-size:13px;color:#555;">
                    <b style="color:#333;">Roll No:</b>&nbsp;${student.rollno || 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td style="font-size:13px;color:#555;">
                    <b style="color:#333;">Standard:</b>&nbsp;${student.standard || 'N/A'}
                  </td>
                  <td style="font-size:13px;color:#555;">
                    <b style="color:#333;">Contact:</b>&nbsp;${student.contact?.parentMobile || 'N/A'}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── Payment Details ── -->
          <tr>
            <td style="padding:14px 30px;border-bottom:1px solid #e8edf2;">
              <p style="margin:0 0 10px;font-size:11px;font-weight:bold;color:#888;text-transform:uppercase;letter-spacing:1px;">
                Payment Details
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-size:13px;color:#555;padding:4px 0;">
                    <b style="color:#333;">Installment:</b>&nbsp;
                    ${installment.paymentNumber}${getOrdinalSuffix(installment.paymentNumber)} Payment
                  </td>
                </tr>
                <tr>
                  <td style="font-size:13px;color:#555;padding:4px 0;">
                    <b style="color:#333;">Amount Paid:</b>&nbsp;
                    <span style="font-size:15px;font-weight:bold;color:#2C3E50;">&#8377;${installment.amount}</span>
                  </td>
                </tr>
                <tr>
                  <td style="font-size:13px;color:#555;padding:4px 0;">
                    <b style="color:#333;">Amount in Words:</b>&nbsp;${amountInWords} Rupees Only
                  </td>
                </tr>
                <tr>
                  <td style="font-size:13px;color:#555;padding:4px 0;">
                    <b style="color:#333;">Mode of Payment:</b>&nbsp;${installment.paymentMode}
                  </td>
                </tr>
                ${installment.transactionId ? `
                <tr>
                  <td style="font-size:13px;color:#555;padding:4px 0;">
                    <b style="color:#333;">Transaction ID:</b>&nbsp;${installment.transactionId}
                  </td>
                </tr>` : ''}
                ${installment.remarks ? `
                <tr>
                  <td style="font-size:13px;color:#555;padding:4px 0;">
                    <b style="color:#333;">Remarks:</b>&nbsp;${installment.remarks}
                  </td>
                </tr>` : ''}
              </table>
            </td>
          </tr>

          <!-- ── Fee Summary Table ── -->
          <tr>
            <td bgcolor="#f9fafb" style="padding:14px 30px;background-color:#f9fafb;border-bottom:1px solid #e8edf2;">
              <p style="margin:0 0 10px;font-size:11px;font-weight:bold;color:#888;text-transform:uppercase;letter-spacing:1px;">
                Fee Summary
              </p>
              <table width="100%" cellpadding="8" cellspacing="0" border="0"
                style="border:1px solid #dce3ea;border-radius:4px;">
                <tr style="background-color:#eef2f7;">
                  <th align="left"
                    style="font-size:12px;font-weight:bold;color:#555;border-bottom:1px solid #dce3ea;padding:8px 12px;">
                    Description
                  </th>
                  <th align="right"
                    style="font-size:12px;font-weight:bold;color:#555;border-bottom:1px solid #dce3ea;padding:8px 12px;">
                    Amount
                  </th>
                </tr>
                <tr>
                  <td style="font-size:13px;color:#444;padding:8px 12px;border-bottom:1px solid #eee;">
                    Total Course Fees
                  </td>
                  <td align="right"
                    style="font-size:13px;color:#444;padding:8px 12px;border-bottom:1px solid #eee;">
                    &#8377;${totalFees}
                  </td>
                </tr>
                <tr>
                  <td style="font-size:13px;color:#27ae60;padding:8px 12px;border-bottom:1px solid #eee;">
                    Total Paid (including this payment)
                  </td>
                  <td align="right"
                    style="font-size:13px;font-weight:bold;color:#27ae60;padding:8px 12px;border-bottom:1px solid #eee;">
                    &#8377;${totalPaidSoFar}
                  </td>
                </tr>
                <tr style="background-color:#fff9e6;">
                  <td style="font-size:13px;color:#d35400;padding:8px 12px;font-weight:bold;">
                    Remaining Balance
                  </td>
                  <td align="right"
                    style="font-size:13px;font-weight:bold;color:#d35400;padding:8px 12px;">
                    &#8377;${remainingAmount}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── Signature ── -->
          <tr>
            <td style="padding:20px 30px;border-bottom:1px solid #e8edf2;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-size:12px;color:#999;">
                    <p style="margin:0;">This is a computer-generated receipt.</p>
                    <p style="margin:4px 0 0;">Thank you for your payment.</p>
                  </td>
                  <td align="right" width="180">
                    <div style="border-top:1px solid #555;padding-top:6px;text-align:center;">
                      <p style="margin:0;font-size:12px;color:#555;">Authorised Signature</p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── Footer ── -->
          <tr>
            <td align="center" bgcolor="#f0f4f8"
              style="padding:12px 30px;background-color:#f0f4f8;">
              <p style="margin:0;font-size:12px;color:#888;font-style:italic;">
                For any queries, please contact: 7741814181
              </p>
            </td>
          </tr>

        </table>
        <!-- /Receipt card -->

      </td>
    </tr>
  </table>

</body>
</html>`;
};

// Helper function to get ordinal suffix
const getOrdinalSuffix = (num) => {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
};

// Send installment receipt email
export const sendInstallmentReceiptEmail = async (student, installment, totalPaidSoFar, remainingAmount) => {
  try {
    // Validate required fields
    if (!student || !installment) {
      throw new Error('Student and installment data are required');
    }

    if (!installment.installmentReceiptNumber) {
      throw new Error('Installment receipt number is missing');
    }

    // Check if parent email exists
    if (!student.contact?.email) {
      console.warn(`No email found for student: ${student.personalDetails?.fullName || student._id}`);
      return { success: false, message: 'No parent email found' };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(student.contact.email)) {
      console.warn(`Invalid email format for student: ${student.personalDetails?.fullName || student._id}`);
      return { success: false, message: 'Invalid email format' };
    }

    const transporter = createTransporter();
    const htmlContent = generateInstallmentReceiptHTML(student, installment, totalPaidSoFar, remainingAmount);

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@mathsacademy.com',
      to: student.contact.email,
      cc: process.env.ADMIN_EMAIL, // Optional: CC to admin
      subject: `Fee Receipt - ${installment.installmentReceiptNumber} - ${student.personalDetails?.fullName || 'Student'}`,
      html: htmlContent,
      attachments: [
        {
          filename: `Receipt_${installment.installmentReceiptNumber}.html`,
          content: htmlContent,
          contentType: 'text/html'
        }
      ]
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${student.contact.email} for installment ${installment.paymentNumber}`);

    return {
      success: true,
      messageId: result.messageId,
      recipient: student.contact.email,
      receiptNumber: installment.installmentReceiptNumber
    };

  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      message: error.message,
      recipient: student.contact?.email
    };
  }
};

// Send bulk installment receipts (for multiple students)
export const sendBulkInstallmentReceipts = async (studentInstallmentData) => {
  const results = [];

  for (const data of studentInstallmentData) {
    const result = await sendInstallmentReceiptEmail(
      data.student,
      data.installment,
      data.totalPaidSoFar,
      data.remainingAmount
    );
    results.push({
      studentId: data.student._id,
      studentName: data.student.personalDetails.fullName,
      ...result
    });
  }

  return results;
};