import mongoose from "mongoose";

const userPaymentMethodSchema = new mongoose.Schema({
    stripeCustomerId: {
        type: String
    },
    paymentMethodId: {
        type: String
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
},
{
    timestamps: true,
});

const PaymentMethod = mongoose.models.PaymentMethod || mongoose.model("PaymentMethod", userPaymentMethodSchema);
export default PaymentMethod;
