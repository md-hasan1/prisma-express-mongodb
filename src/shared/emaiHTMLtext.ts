//OTP HTML TXT
const generateOtpEmail = (otp: number) => {
    return `
      <div style="font-family: Arial, sans-serif; color: #333; padding: 30px; background: linear-gradient(135deg, #6c63ff, #3f51b5); border-radius: 8px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px;">
            <h2 style="color: #ffffff; font-size: 28px; text-align: center; margin-bottom: 20px;">
                <span style="color: #ffeb3b;">OTP Verification</span>
            </h2>
            <p style="font-size: 16px; color: #333; line-height: 1.5; text-align: center;">
                Your OTP code is below.
            </p>
            <p style="font-size: 32px; font-weight: bold; color: #ff4081; text-align: center; margin: 20px 0;">
                ${otp}
            </p>
            <div style="text-align: center; margin-bottom: 20px;">
                <p style="font-size: 14px; color: #555; margin-bottom: 10px;">
                    This OTP will expire in <strong>10 minutes</strong>. If you did not request this, please ignore this email.
                </p>
                <p style="font-size: 14px; color: #555; margin-bottom: 10px;">
                    If you need assistance, feel free to contact us.
                </p>
            </div>
            <div style="text-align: center; margin-top: 30px;">
                <p style="font-size: 12px; color: #999; text-align: center;">
                    Best Regards,<br/>
                    <span style="font-weight: bold; color: #3f51b5;">Developer Team</span><br/>
                </p>
            </div>
        </div>
      </div>`;
  };

//New User Registration HTML Template
const newAccEmail = (email: string, password: string) => {
  return `
    <div style="font-family: Arial, sans-serif; color: #333; padding: 30px; background: linear-gradient(135deg, #2196f3, #21cbf3); border-radius: 8px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px;">
          <h2 style="color: #ffffff; font-size: 28px; text-align: center; margin-bottom: 20px;">
              <span style="color: #2196f3;">Welcome to Our Platform</span>
          </h2>
          <p style="font-size: 16px; color: #333; line-height: 1.5; text-align: center;">
              Your new account has been successfully created. Below are your login credentials:
          </p>
          <div style="text-align: center; margin: 20px 0;">
              <p style="font-size: 18px; color: #333;"><strong>Email:</strong> ${email}</p>
              <p style="font-size: 18px; color: #333;"><strong>Password:</strong> ${password}</p>
          </div>
          <div style="text-align: center; margin-bottom: 20px;">
              <p style="font-size: 14px; color: #555;">
                  Please make sure to change your password after logging in for the first time.
              </p>
              <p style="font-size: 14px; color: #555;">
                  If you did not request this account, please contact our support team immediately.
              </p>
          </div>
          <div style="text-align: center; margin-top: 30px;">
              <p style="font-size: 12px; color: #999;">
                  Best Regards,<br/>
                  <span style="font-weight: bold; color: #2196f3;">Developer Team</span><br/>
              </p>
          </div>
      </div>
    </div>`;
};


export { generateOtpEmail, newAccEmail };