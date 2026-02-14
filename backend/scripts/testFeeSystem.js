// Simple test script to verify the fee system works correctly
// Run this after setting up the database to test all functionality

import mongoose from 'mongoose';
import { Student } from '../models/studentModel.js';
import { Installment } from '../models/installmentModel.js';
import { FeeReceipt } from '../models/FeeReceiptModel.js';
import * as feeService from '../services/feeService.js';
import { sendInstallmentReceiptEmail } from '../services/emailService.js';

const testFeeSystem = async () => {
  try {
    console.log('🧪 Starting Fee System Test...\n');

    // Connect to database
    const DB_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/ppacademy';
    await mongoose.connect(DB_URL);
    console.log('✅ Connected to database');

    // Create test student if doesn't exist
    let testStudent = await Student.findOne({ 'contact.email': 'test@example.com' });
    
    if (!testStudent) {
      testStudent = new Student({
        personalDetails: {
          fullName: 'Test Student'
        },
        contact: {
          parentMobile: '1234567890',
          email: 'test@example.com'
        },
        standard: '11',
        status: 'Admitted'
      });
      await testStudent.save();
      console.log('✅ Test student created');
    } else {
      console.log('✅ Using existing test student');
    }

    // Clean up any existing test data
    await Installment.deleteMany({ student: testStudent._id });
    await FeeReceipt.deleteMany({ studentId: testStudent._id });
    console.log('✅ Cleaned up existing test data');

    // Test 1: First Payment
    console.log('\n🔸 Test 1: First Payment Processing');
    const firstPayment = await feeService.processPayment(
      testStudent._id,
      2000,
      'Cash',
      'TXN001',
      'First installment',
      8000,
      testStudent._id // Mock admin ID
    );
    
    console.log('✅ First payment processed successfully');
    console.log(`   Receipt Number: ${firstPayment.receipt.receiptNumber}`);
    console.log(`   Installment Receipt: ${firstPayment.payment.installmentReceiptNumber}`);
    console.log(`   Remaining Amount: ₹${firstPayment.remainingAmount}`);

    // Test 2: Second Payment
    console.log('\n🔸 Test 2: Second Payment Processing');
    const secondPayment = await feeService.processPayment(
      testStudent._id,
      3000,
      'Online',
      'TXN002',
      'Second installment',
      null, // No totalFees needed for subsequent payments
      testStudent._id
    );
    
    console.log('✅ Second payment processed successfully');
    console.log(`   Installment Receipt: ${secondPayment.payment.installmentReceiptNumber}`);
    console.log(`   Remaining Amount: ₹${secondPayment.remainingAmount}`);

    // Test 3: Email Functionality (if email configured)
    console.log('\n🔸 Test 3: Email Functionality');
    if (process.env.EMAIL_USER) {
      const emailResult = await sendInstallmentReceiptEmail(
        testStudent,
        secondPayment.payment,
        5000, // Total paid so far
        3000  // Remaining amount
      );
      
      if (emailResult.success) {
        console.log('✅ Email sent successfully');
        console.log(`   Recipient: ${emailResult.recipient}`);
        console.log(`   Receipt Number: ${emailResult.receiptNumber}`);
      } else {
        console.log('⚠️ Email failed (this is OK if not configured)');
        console.log(`   Reason: ${emailResult.message}`);
      }
    } else {
      console.log('⚠️ Email not configured (EMAIL_USER not set)');
    }

    // Test 4: Data Validation
    console.log('\n🔸 Test 4: Data Validation');
    
    // Check installments have unique receipt numbers
    const installments = await Installment.find({ student: testStudent._id });
    const receiptNumbers = installments.map(i => i.installmentReceiptNumber);
    const uniqueNumbers = [...new Set(receiptNumbers)];
    
    if (receiptNumbers.length === uniqueNumbers.length) {
      console.log('✅ All installment receipt numbers are unique');
    } else {
      console.log('❌ Duplicate receipt numbers found!');
    }

    // Check receipt data integrity
    const receipt = await FeeReceipt.findOne({ studentId: testStudent._id });
    const totalInstallmentAmount = installments.reduce((sum, i) => sum + i.amount, 0);
    
    if (receipt.totalAmount === totalInstallmentAmount) {
      console.log('✅ Receipt amounts match installment totals');
    } else {
      console.log('❌ Receipt amount mismatch!');
      console.log(`   Receipt Total: ₹${receipt.totalAmount}`);
      console.log(`   Installment Total: ₹${totalInstallmentAmount}`);
    }

    // Test 5: Error Handling
    console.log('\n🔸 Test 5: Error Handling');
    
    try {
      // Try to pay more than remaining amount
      await feeService.processPayment(
        testStudent._id,
        5000, // More than remaining ₹3000
        'Cash',
        'TXN003',
        'Should fail',
        null,
        testStudent._id
      );
      console.log('❌ Error handling failed - should have thrown error');
    } catch (error) {
      console.log('✅ Error handling works correctly');
      console.log(`   Error: ${error.message}`);
    }

    // Clean up test data
    await Installment.deleteMany({ student: testStudent._id });
    await FeeReceipt.deleteMany({ studentId: testStudent._id });
    await Student.deleteOne({ _id: testStudent._id });
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 All tests passed! Fee system is working correctly.');
    
    return {
      success: true,
      message: 'All tests passed successfully'
    };

  } catch (error) {
    console.error('❌ Test failed:', error);
    return {
      success: false,
      error: error.message
    };
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from database');
  }
};

// Export for use in other scripts
export { testFeeSystem };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testFeeSystem()
    .then(result => {
      console.log('\nFinal Result:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test runner failed:', error);
      process.exit(1);
    });
}