import mongoose, { Schema } from "mongoose";
import { IOrder, IOrderItem } from "../interfaces/Order";

const OrderItemSchema = new Schema<IOrderItem>({
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    size: {
        type: String,
        required: true
    },
    image: {
        type: String,
        require: true
    },
    itemStatus: {
        type: String,
        enum: [
            'pending',       // Producto agregado a la orden, esperando procesamiento
            'shipped',       // Ya fue enviado 
            'delivered',     // Ya fue entregado
            'cancelled',     // Producto cancelado dentro de la orden
            'return_requested', // Cliente solicitó devolución
            'returned',      // Producto fue devuelto
            'refunded'       // Producto fue reembolsado
        ],
        default: 'pending'
    }

}, { _id: true });

const OrderSchema = new Schema<IOrder>({
    userId: {
        type: String,
        required: true
    },
    orderNumber: {
        type: String,
        unique: true,
        auto: true,
    },
    items: {
        type:[OrderItemSchema],
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    addressId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'cancelled', 'payment_failed'],
    },
    orderType: {
        type: String,
        enum: ['standard', 'pickup'],
        required: true
    },
    paymentId: {
        type: String,
        required: false,
        default: 'xxxxx'
    },
    paymentStatus: {
        type: String,
        enum: [
            'pending',          // Pago pendiente
            'approved',         // Pago aprobado
            'authorized',       // Pago autorizado pero no capturado
            'in_process',       // Pago en proceso de revisión
            'in_mediation',    // Pago en mediación
            'rejected',        // Pago rechazado
            'cancelled',       // Pago cancelado
            'refunded',        // Pago reembolsado
        ],
    },
    paymentMethod: {
        type: String,
        required: true
    },
    deliveryStatus: {
        type: String,
        enum: ['pending', 'shipped', 'delivered', 'returned'],
        default: 'pending'
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true,
    versionKey: false
});

OrderSchema.pre('save', function (next) {
    const order = this as IOrder;

    let newItemStatus: string | null = null;

    switch (order.status) {
        case 'cancelled':
            newItemStatus = 'cancelled';
            break;
        case 'completed':
            if (order.deliveryStatus === 'delivered') {
                newItemStatus = 'delivered';
            }
            break;
        case 'processing':
            if (order.deliveryStatus === 'shipped') {
                newItemStatus = 'shipped';
            }
            break;
    }


    if (newItemStatus) {
        order.items = order.items.map(item => {
            if (item.itemStatus !== 'refunded' && item.itemStatus !== 'returned') {
                item.itemStatus = newItemStatus!;
            }
            return item;
        });
    }

    next();
});

OrderSchema.pre('save', async function (next) {
  const order = this as IOrder;

  if (!order.orderNumber) {
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 5) {
      const date = new Date();
      const ymd = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
      const random = Math.floor(Math.random() * 1e7).toString().padStart(7, '0');
      const generated = `${ymd}${random}`;

      const exists = await mongoose.models.Order.findOne({ orderNumber: generated });
      if (!exists) {
        order.orderNumber = generated;
        isUnique = true;
      } else {
        attempts++;
      }
    }

    if (!isUnique) {
      return next(new Error('Could not generate a unique order number. Try again.'));
    }
  }

  next();
});


export const OrderModel = mongoose.model<IOrder>('Order', OrderSchema);