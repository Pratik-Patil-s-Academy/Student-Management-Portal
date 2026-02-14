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

// Generate HTML email template for installment receipt
const generateInstallmentReceiptHTML = (student, installment, totalPaidSoFar, remainingAmount) => {
  const currentDate = new Date().toLocaleDateString('en-IN');
  const amountInWords = numberToWords(installment.amount);
  
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; }
      .receipt-container { max-width: 600px; margin: 0 auto; border: 2px solid #333; }
      .header { background-color: #f0f8ff; padding: 15px; text-align: center; border-bottom: 1px solid #333; }
      .academy-name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
      .academy-details { font-size: 14px; color: #666; }
      .receipt-title { float: right; border: 2px solid #333; padding: 10px; border-radius: 10px; margin-top: -10px; }
      .content { padding: 20px; }
      .row { margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; }
      .label { font-weight: bold; }
      .value { border-bottom: 1px solid #333; min-width: 200px; padding: 2px 5px; }
      .amount-section { margin: 20px 0; }
      .fee-table { float: right; border: 1px solid #333; }
      .fee-table th, .fee-table td { border: 1px solid #333; padding: 8px 15px; text-align: left; }
      .signature { text-align: right; margin-top: 40px; }
      .footer { text-align: center; margin-top: 30px; font-style: italic; color: #666; }
    </style>
  </head>
  <body>
    <div class="receipt-container">
      <div class="header">
        <div class="academy-name">Pratik Patil's Maths Academy</div>
        <div class="academy-details">Rajarampuri, Kolhapur (7741814181)</div>
        <div class="receipt-title">Receipt</div>
      </div>
      
      <div class="content">
        <div class="row">
          <span>No.: <span class="value">${installment.installmentReceiptNumber}</span></span>
          <span>Date: <span class="value">${currentDate}</span></span>
        </div>
        
        <div class="fee-table" style="float: right; margin-bottom: 20px;">
          <table>
            <tr>
              <th>Total Fees</th>
              <td>₹${totalPaidSoFar + remainingAmount}</td>
            </tr>
            <tr>
              <th>Fees Paid</th>
              <td>₹${totalPaidSoFar}</td>
            </tr>
            <tr>
              <th>Remaining</th>
              <td>₹${remainingAmount}</td>
            </tr>
          </table>
        </div>
        
        <div class="row">
          <span class="label">Received from:</span>
          <span class="value">${student.personalDetails.fullName}</span>
        </div>
        
        <div class="row">
          <span class="label">Sum of Rupees:</span>
          <span class="value">${amountInWords} Only</span>
        </div>
        
        <div class="row">
          <span>Rs. <span class="value">₹${installment.amount}</span></span>
          <span>Mode of payment: <span class="value">${installment.paymentMode}</span></span>
        </div>
        
        <div class="row">
          <span class="label">Details:</span>
          <span class="value">${installment.paymentNumber}${getOrdinalSuffix(installment.paymentNumber)} Fees</span>
        </div>
        
        ${installment.transactionId ? `
        <div class="row">
          <span class="label">Transaction ID:</span>
          <span class="value">${installment.transactionId}</span>
        </div>
        ` : ''}
        
        ${installment.remarks ? `
        <div class="row">
          <span class="label">Remarks:</span>
          <span class="value">${installment.remarks}</span>
        </div>
        ` : ''}
        
        <div class="signature">
          <div style="border-top: 1px solid #333; width: 200px; margin-left: auto; padding-top: 10px;">
            Signature & Seal
          </div>
        </div>
      </div>
      
      <div class="footer">
        <p>Thank you for your payment. Keep this receipt for your records.</p>
        <p>For any queries, please contact: 7741814181</p>
      </div>
    </div>
  </body>
  </html>
  `;
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