import bcrypt from 'bcrypt';
import { transporter } from '@/lib/mail/nodemailer';

export const sendVerificationEmail = async (email: string, code: string) => {
  const mailOptions = {
    from: `"Crossy Store" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your Verification Code',
    html: `<p>Your verification code is: <strong>${code}</strong></p><p>This code will expire in 15 minutes.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('❌ Email sending error in sendVerificationEmail:', error);
    throw new Error('Failed to send verification email');
  }
};

export async function hashPassword(password: string) {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    console.error('❌ Hash password error:', error);
    throw new Error('Failed to hash password');
  }
}

export async function comparePasswords(
  inputPassword: string,
  hashedPassword: string
) {
  try {
    return await bcrypt.compare(inputPassword, hashedPassword);
  } catch (error) {
    console.error('❌ Compare passwords error:', error);
    throw new Error('Failed to compare passwords');
  }
}
