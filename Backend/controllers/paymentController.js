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

        // Must start with 4 or 5
        if (!/^[45]/.test(cleanCard)) {
        return res.status(400).json({
            success: false,
            message: "Invalid card number",
        });
        }

        const card = BigInt(cleanCard);

        // Optional numeric range check
        if (
        card < 4_000_000_000_000_000n ||
        card > 5_999_999_999_999_999n
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
        cvcNumber < 800 ||
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