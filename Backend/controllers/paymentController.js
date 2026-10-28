// Returns an error message, or null when the card passes the (test) checks.
// Same rules as POST /api/payment/pay.
export const validateCard = ({ cardNumber, expiry, cvc } = {}) => {
  const cleanCard = String(cardNumber || "").replace(/\s/g, "");
  if (!/^\d{16}$/.test(cleanCard)) return "Card number must contain exactly 16 digits";
  // Allowed range: 4000 0000 0000 0000 – 8999 9999 9999 9999 (first digit 4–8)
  if (!/^[4-8]/.test(cleanCard)) return "Invalid card number";

  const [month, year] = String(expiry || "").split("/");
  const expMonth = Number(month);
  const expYear = 2000 + Number(year);
  const today = new Date();
  if (!(expMonth >= 1 && expMonth <= 12)) return "Invalid expiry month";
  if (
    expYear < today.getFullYear() ||
    (expYear === today.getFullYear() && expMonth <= today.getMonth() + 1)
  ) {
    return "Card expired";
  }

  const cvcNumber = Number(cvc);
  if (!(cvcNumber >= 300 && cvcNumber <= 900)) return "CVC validation failed";
  return null;
};

export const pay = async (req, res) => {

    const { cardNumber, expiry, cvc } = req.body;

    // Card Number

        const cleanCard = cardNumber.replace(/\s/g, "");

        // Must be exactly 16 digits
        if (!/^\d{16}$/.test(cleanCard)) {
        return res.status(400).json({
            success: false,
            message: "Card number must contain exactly 16 digits",
        });
        }

        // Must be in range 4000 0000 0000 0000 – 8999 9999 9999 9999 (first digit 4–8)
        if (!/^[4-8]/.test(cleanCard)) {
        return res.status(400).json({
            success: false,
            message: "Invalid card number",
        });
        }

        const card = BigInt(cleanCard);

        // Optional numeric range check
        if (
        card < 4_000_000_000_000_000n ||
        card > 8_999_999_999_999_999n
        ) {
        return res.status(400).json({
            success: false,
            message: "Invalid card number",
        });
        }

    // Expiry
    const [month, year] = expiry.split("/");

    const expMonth = Number(month);
    const expYear = 2000 + Number(year);

    const today = new Date();

    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    if (
        expMonth < 1 ||
        expMonth > 12
    ) {
        return res.status(400).json({
            success:false,
            message:"Invalid expiry month"
        });
    }

    if (
        expYear < currentYear ||
        (expYear === currentYear && expMonth <= currentMonth)
    ) {
        return res.status(400).json({
            success:false,
            message:"Card expired"
        });
    }

    // CVC
    const cvcNumber = Number(cvc);

    if (
        cvcNumber < 300 ||
        cvcNumber > 900
    ) {
        return res.status(400).json({
            success:false,
            message:"CVC validation failed"
        });
    }

    return res.json({
        success:true,
        message:"Payment Successful"
    });

};