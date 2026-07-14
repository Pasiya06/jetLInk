export const pay = async (req, res) => {

    const { cardNumber, expiry, cvc } = req.body;

    // Card Number
    if (!/^\d{16}$/.test(cardNumber)) {
        return res.status(400).json({
            success:false,
            message:"Card number must contain 16 digits"
        });
    }

    const card = BigInt(cardNumber);

    if (
        card < 4000000000000000n ||
        card > 5000000000000000n
    ) {
        return res.status(400).json({
            success:false,
            message:"Invalid card number"
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