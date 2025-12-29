export const certificateEmailTemplate = (data) => {
  return `
  <div style="
    background: #f4f7fb;
    padding: 30px;
    font-family: 'Segoe UI', Arial, sans-serif;
  ">
    <div style="
      max-width: 650px;
      margin: auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    ">
      
      <div style="background: #0047ab; padding: 25px; text-align: center;">
        <img src="https://i.postimg.cc/65gRRF5t/Chat-GPT-Image-Nov-15-2025-11-38-15-AM-removebg-preview-removebg-preview.png" width="160" alt="CertiPro Logo" style="margin-bottom: 10px;" />
        <h2 style="color: #fff; margin:0; font-weight: 500;">
          Your Certificate Is Ready!
        </h2>
      </div>
      
      <div style="padding: 30px;">
        <p style="font-size: 16px; color:#333;">
          Hello <strong>${data.studentName}</strong>,
        </p>

        <p style="font-size: 15px; color:#555; line-height: 1.6;">
          Congratulations! 🎉<br/>
          Your certificate for the course 
          <strong style="color:#0047ab;">${data.courseName}</strong> has been successfully generated.
        </p>

        <div style="
          background: #f0f6ff;
          border-left: 4px solid #0047ab;
          padding: 12px 18px;
          margin: 20px 0;
          border-radius: 6px;
        ">
          <p style="margin: 0; color: #0047ab; font-size: 15px;">
            <strong>Certificate ID:</strong> ${data.certificateId}
          </p>
        </div>

        <p style="font-size: 15px; color:#555;">
          You can instantly verify or download your certificate using the button below.
        </p>

        <div style="text-align: center; margin-top: 25px;">
          <a href="${process.env.FRONTEND_URL}/verify/${data.certificateId}"
          style="
            background: #0047ab;
            color: #fff;
            padding: 12px 22px;
            text-decoration: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 500;
            display: inline-block;
          ">
            🔍 Verify Certificate
          </a>
        </div>

        <p style="font-size: 13px; color:#999; margin-top: 30px;">
          If you did not expect this email, you can safely ignore it.
        </p>
      </div>

      <div style="background: #f4f7fb; padding: 15px; text-align:center;">
        <p style="font-size: 12px; color:#777;">
          © ${new Date().getFullYear()} TalentHive – All Rights Reserved
        </p>
      </div>

    </div>
  </div>
  `;
};

export const forgotPasswordEmailTemplate = (data) => {
  return `
  <div style="
    background: #f4f7fb;
    padding: 30px;
    font-family: 'Segoe UI', Arial, sans-serif;
  ">
    <div style="
      max-width: 650px;
      margin: auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    ">

      <div style="background: #0047ab; padding: 25px; text-align: center;">
        <img src="https://i.postimg.cc/65gRRF5t/Chat-GPT-Image-Nov-15-2025-11-38-15-AM-removebg-preview-removebg-preview.png" 
             width="160" 
             alt="CertiPro Logo"
             style="margin-bottom: 10px;" />
        <h2 style="color: #fff; margin:0; font-weight: 500;">
          Password Reset Request
        </h2>
      </div>

      <div style="padding: 30px;">
        <p style="font-size: 16px; color:#333;">
          Hello <strong>${data.userName}</strong>,
        </p>

        <p style="font-size: 15px; color:#555; line-height: 1.6;">
          We received a request to reset your account password.  
          Click the button below to create a new password.
        </p>

        <div style="
          background: #f0f6ff;
          border-left: 4px solid #0047ab;
          padding: 12px 18px;
          margin: 20px 0;
          border-radius: 6px;
        ">
          <p style="margin: 0; color: #0047ab; font-size: 15px;">
            This reset link will expire in <strong>15 minutes</strong>.
          </p>
        </div>

        <div style="text-align: center; margin-top: 25px;">
          <a href="${data.resetLink}"
            style="
              background: #0047ab;
              color: #fff;
              padding: 12px 22px;
              text-decoration: none;
              border-radius: 8px;
              font-size: 16px;
              font-weight: 500;
              display: inline-block;
            ">
            🔐 Reset Password
          </a>
        </div>

        <p style="font-size: 14px; color:#777; margin-top: 25px;">
          If you did not request a password reset, you can safely ignore this email.
        </p>
      </div>

      <div style="background: #f4f7fb; padding: 15px; text-align:center;">
        <p style="font-size: 12px; color:#777;">
          © ${new Date().getFullYear()} TalentHive – All Rights Reserved
        </p>
      </div>

    </div>
  </div>
  `;
};
