// controllers/orderController.js
import asyncHandler from "express-async-handler";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import User from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";
import axios from "axios";
import crypto from "crypto";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = "https://api.paystack.co";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:9000";
const PLATFORM_PERCENTAGE = 6;
const SELLER_PERCENTAGE = 94;

// ==================== CART CONTROLLERS ====================

const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity < 1) {
    res.status(400);
    throw new Error("Product ID and valid quantity are required");
  }

  const user = await User.findById(req.user._id);
  const product = await Product.findById(productId).populate(
    "seller",
    "name businessName",
  );

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (!product.isAvailable || product.isSoldOut) {
    res.status(400);
    throw new Error(`${product.name} is sold out or unavailable`);
  }

  if (!product.isApproved) {
    res.status(400);
    throw new Error(`${product.name} is pending approval`);
  }

  if (product.quantityAvailable < quantity) {
    res.status(400);
    throw new Error(
      `Only ${product.quantityAvailable} units available for ${product.name}`,
    );
  }

  const calculatePrice = (qty) => {
    if (product.bulkPricing && product.bulkPricing.length > 0) {
      const sortedPricing = [...product.bulkPricing].sort(
        (a, b) => b.minQuantity - a.minQuantity,
      );
      for (const tier of sortedPricing) {
        if (qty >= tier.minQuantity) {
          return tier.price;
        }
      }
    }
    if (qty >= 2 && product.bulkPrice) {
      return product.bulkPrice;
    }
    const basePrice = product.retailPrice || product.price || 0;
    if (product.discount && product.discount > 0) {
      const now = new Date();
      const isDiscountValid =
        (!product.discountStartDate || now >= product.discountStartDate) &&
        (!product.discountEndDate || now <= product.discountEndDate);
      if (isDiscountValid) {
        return basePrice * (1 - product.discount / 100);
      }
    }
    return basePrice;
  };

  const itemPrice = calculatePrice(quantity);

  await user.addToCart(product, quantity, itemPrice);

  const updatedUser = await User.findById(req.user._id).populate(
    "cart.product",
  );

  const cartCount =
    updatedUser.cart?.reduce(
      (count, item) => count + (item.quantity || 0),
      0,
    ) || 0;
  const cartTotal =
    updatedUser.cart?.reduce(
      (total, item) => total + (item.price || 0) * (item.quantity || 0),
      0,
    ) || 0;

  res.json({
    success: true,
    message: `${product.name} added to cart`,
    cart: updatedUser.cart,
    cartCount,
    cartTotal,
  });
});

const getCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: "cart.product",
    populate: {
      path: "seller",
      select: "name businessName email phone",
    },
  });

  const cartCount =
    user.cart?.reduce((count, item) => count + (item.quantity || 0), 0) || 0;
  const cartTotal =
    user.cart?.reduce(
      (total, item) => total + (item.price || 0) * (item.quantity || 0),
      0,
    ) || 0;

  res.json({
    cart: user.cart || [],
    cartCount,
    cartTotal,
  });
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const { productId } = req.params;

  if (!quantity || quantity < 1) {
    res.status(400);
    throw new Error("Valid quantity is required");
  }

  const user = await User.findById(req.user._id);
  const product = await Product.findById(productId);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (product.quantityAvailable < quantity) {
    res.status(400);
    throw new Error(`Only ${product.quantityAvailable} units available`);
  }

  await user.updateCartItemQuantity(productId, quantity, product);

  const updatedUser = await User.findById(req.user._id).populate(
    "cart.product",
  );

  const cartCount =
    updatedUser.cart?.reduce(
      (count, item) => count + (item.quantity || 0),
      0,
    ) || 0;
  const cartTotal =
    updatedUser.cart?.reduce(
      (total, item) => total + (item.price || 0) * (item.quantity || 0),
      0,
    ) || 0;

  res.json({
    success: true,
    cart: updatedUser.cart,
    cartCount,
    cartTotal,
  });
});

const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const user = await User.findById(req.user._id);
  await user.removeFromCart(productId);

  const updatedUser = await User.findById(req.user._id).populate(
    "cart.product",
  );

  const cartCount =
    updatedUser.cart?.reduce(
      (count, item) => count + (item.quantity || 0),
      0,
    ) || 0;
  const cartTotal =
    updatedUser.cart?.reduce(
      (total, item) => total + (item.price || 0) * (item.quantity || 0),
      0,
    ) || 0;

  res.json({
    success: true,
    message: "Item removed from cart",
    cart: updatedUser.cart,
    cartCount,
    cartTotal,
  });
});

const clearCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  await user.clearCart();

  res.json({
    success: true,
    message: "Cart cleared successfully",
    cart: [],
    cartCount: 0,
    cartTotal: 0,
  });
});

const getCartSummary = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  const cartCount =
    user.cart?.reduce((count, item) => count + (item.quantity || 0), 0) || 0;
  const cartTotal =
    user.cart?.reduce(
      (total, item) => total + (item.price || 0) * (item.quantity || 0),
      0,
    ) || 0;

  res.json({
    cartCount,
    cartTotal,
  });
});

// ==================== PAYSTACK HELPERS ====================

const initializePaystackTransaction = async (orders, user, customerEmail) => {
  const totalAmount = orders.reduce((sum, order) => sum + order.totalPrice, 0);
  const amount = Math.round(totalAmount * 100);

  const firstOrder = orders[0];
  const seller = await User.findById(firstOrder.seller);
  let subaccount = null;

  if (seller && seller.paystackSubaccountCode) {
    subaccount = seller.paystackSubaccountCode;
  }

  let email = customerEmail;
  if (!email || !email.includes("@")) {
    email = user?.email;
  }

  if (!email || !email.includes("@")) {
    throw new Error("Valid customer email is required for payment processing");
  }

  const payload = {
    email: email,
    amount: amount,
    currency: "NGN",
    reference: `ORDER-${firstOrder._id}-${Date.now()}`,
    callback_url: `${FRONTEND_URL}/uduua/shop/orders/${firstOrder._id}?payment=success`,
    metadata: {
      orderId: firstOrder._id.toString(),
      orderIds: orders.map((o) => o._id.toString()),
      custom_fields: [
        {
          display_name: "Customer Name",
          variable_name: "customer_name",
          value: firstOrder.shippingAddress?.fullName || user.name,
        },
        {
          display_name: "Phone",
          variable_name: "customer_phone",
          value: firstOrder.phone || user.phone,
        },
      ],
    },
  };

  if (subaccount) {
    payload.subaccount = subaccount;
    payload.transaction_charge = Math.round(
      amount * (PLATFORM_PERCENTAGE / 100),
    );
  }

  const response = await axios.post(
    `${PAYSTACK_BASE_URL}/transaction/initialize`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    },
  );

  return response.data.data;
};

const getBankList = asyncHandler(async (req, res) => {
  try {
    const response = await axios.get(`${PAYSTACK_BASE_URL}/bank`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
      params: { country: "nigeria", perPage: 100 },
    });
    res.json(response.data.data);
  } catch (error) {
    const fallbackBanks = [
      { name: "Access Bank", code: "044", type: "nuban" },
      { name: "Guaranty Trust Bank", code: "058", type: "nuban" },
      { name: "First Bank of Nigeria", code: "011", type: "nuban" },
      { name: "United Bank for Africa", code: "033", type: "nuban" },
      { name: "Zenith Bank", code: "057", type: "nuban" },
      { name: "Fidelity Bank", code: "070", type: "nuban" },
      { name: "OPay Digital Bank", code: "999992", type: "nuban" },
    ];
    res.json(fallbackBanks);
  }
});

const resolveBankAccount = asyncHandler(async (req, res) => {
  const { accountNumber, bankCode } = req.body;

  if (!accountNumber || !bankCode) {
    res.status(400);
    throw new Error("Account number and bank code are required");
  }

  try {
    const response = await axios.get(`${PAYSTACK_BASE_URL}/bank/resolve`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
      params: { account_number: accountNumber, bank_code: bankCode },
    });

    res.json({
      success: true,
      accountName: response.data.data.account_name,
    });
  } catch (error) {
    res.status(400);
    throw new Error(
      error.response?.data?.message || "Failed to resolve account number",
    );
  }
});

// @desc    Reinitialize payment for an existing order
// @route   POST /api/orders/reinitialize-payment
// @access  Private
const reinitializePayment = asyncHandler(async (req, res) => {
  const { orderId, paymentMethod } = req.body;
  const userId = req.user._id;

  const order = await Order.findById(orderId);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.user.toString() !== userId.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  if (order.isPaid) {
    res.status(400);
    throw new Error("Order already paid");
  }

  if (order.status === "cancelled") {
    res.status(400);
    throw new Error("Order has been cancelled");
  }

  if (paymentMethod && paymentMethod !== order.paymentMethod) {
    order.paymentMethod = paymentMethod;
    await order.save();
  }

  if (order.paymentMethod === "paystack") {
    const user = await User.findById(userId);
    const paystackData = await initializePaystackTransaction(
      [order],
      user,
      user.email,
    );

    order.paymentReference = paystackData.reference;
    order.paymentStatus = "pending_payment";
    await order.save();

    return res.json({
      success: true,
      paymentUrl: paystackData.authorization_url,
      paymentReference: paystackData.reference,
    });
  }

  res.json({
    success: true,
    message: "Payment method updated. Please complete payment at checkout.",
  });
});

// ==================== ORDER CONTROLLERS ====================

const checkoutCart = asyncHandler(async (req, res) => {
  let shippingAddress = req.body.shippingAddress;
  let paymentMethod = req.body.paymentMethod;
  let phone = req.body.phone;
  let notes = req.body.notes || "";
  let customerEmail = req.body.email;

  if (typeof shippingAddress === "string") {
    try {
      shippingAddress = JSON.parse(shippingAddress);
    } catch (error) {
      res.status(400);
      throw new Error("Invalid shipping address format");
    }
  }

  const user = await User.findById(req.user._id).populate({
    path: "cart.product",
    populate: {
      path: "seller",
      select: "name businessName email phone paystackSubaccountCode",
    },
  });

  if (!user.cart || user.cart.length === 0) {
    res.status(400);
    throw new Error("Your cart is empty");
  }

  if (!shippingAddress) {
    res.status(400);
    throw new Error("Shipping address is required");
  }

  if (
    !paymentMethod ||
    !["paystack", "ondelivery", "onsite"].includes(paymentMethod)
  ) {
    res.status(400);
    throw new Error("Valid payment method is required");
  }

  if (paymentMethod === "paystack") {
    const validEmail = customerEmail || user.email;
    if (!validEmail || !validEmail.includes("@")) {
      res.status(400);
      throw new Error("Valid email address is required for payment processing");
    }
  }

  if (paymentMethod === "onsite" && !req.file) {
    res.status(400);
    throw new Error("Payment receipt is required for on-site payment");
  }

  const itemsBySeller = {};
  let itemsPrice = 0;

  for (const cartItem of user.cart) {
    const product = cartItem.product;

    if (!product) {
      res.status(404);
      throw new Error(
        `Product not found: ${cartItem.name || "Unknown product"}`,
      );
    }

    if (!product.isAvailable || product.isSoldOut) {
      res.status(400);
      throw new Error(`${product.name} is sold out or unavailable`);
    }

    if (!product.isApproved) {
      res.status(400);
      throw new Error(`${product.name} is pending approval`);
    }

    if (cartItem.quantity > product.quantityAvailable) {
      res.status(400);
      throw new Error(
        `Only ${product.quantityAvailable} units available for ${product.name}`,
      );
    }

    const sellerId =
      product.seller?._id?.toString() ||
      product.seller?.toString() ||
      cartItem.seller?.toString();

    if (!sellerId) {
      res.status(400);
      throw new Error(
        `Product ${product.name} has no seller assigned. Please contact support.`,
      );
    }

    if (!itemsBySeller[sellerId]) {
      itemsBySeller[sellerId] = {
        seller: sellerId,
        items: [],
        subtotal: 0,
        sellerData: product.seller,
      };
    }

    const itemTotal = cartItem.price * cartItem.quantity;
    itemsBySeller[sellerId].items.push({
      product: product._id,
      name: product.name,
      image: product.images?.[0] || "",
      price: cartItem.price,
      quantity: cartItem.quantity,
    });
    itemsBySeller[sellerId].subtotal += itemTotal;
    itemsPrice += itemTotal;
  }

  if (Object.keys(itemsBySeller).length === 0) {
    res.status(400);
    throw new Error("No valid items in cart");
  }

  const shippingPrice = 0;
  const taxPrice = 0;
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  let paymentReceipt = "";
  if (paymentMethod === "onsite" && req.file) {
    paymentReceipt = req.file.path;
  }

  const shippingAddressData = {
    fullName: shippingAddress.fullName || "",
    address: shippingAddress.address || "",
    city: shippingAddress.city || "",
    state: shippingAddress.state || "",
    postalCode: shippingAddress.postalCode || "",
    country: shippingAddress.country || "Nigeria",
    phone: shippingAddress.phone || phone || user.phone,
    deliveryNotes: shippingAddress.deliveryNotes || "",
  };

  const orders = [];
  for (const sellerData of Object.values(itemsBySeller)) {
    const sellerPayoutAmount = sellerData.subtotal * (SELLER_PERCENTAGE / 100);
    const platformAmount = sellerData.subtotal * (PLATFORM_PERCENTAGE / 100);

    const order = await Order.create({
      user: req.user._id,
      seller: sellerData.seller,
      orderItems: sellerData.items,
      shippingAddress: shippingAddressData,
      paymentMethod: paymentMethod,
      paymentReceipt: paymentReceipt,
      phone: phone || user.phone,
      notes: notes || "",
      itemsPrice: sellerData.subtotal,
      shippingPrice: shippingPrice,
      taxPrice: taxPrice,
      totalPrice: sellerData.subtotal + shippingPrice + taxPrice,
      sellerPayoutAmount: sellerPayoutAmount,
      platformAmount: platformAmount,
      status: "order_placed",
      paymentStatus:
        paymentMethod === "ondelivery" ? "pending" : "pending_payment",
      deliveryStatus: "pending",
      isDelivered: false,
      isPaid: false,
    });
    orders.push(order);
  }

  await user.clearCart();

  if (paymentMethod === "paystack") {
    if (orders.length === 0) {
      res.status(400);
      throw new Error("No orders created");
    }

    try {
      const emailForPayment = customerEmail || user.email;
      const paystackData = await initializePaystackTransaction(
        orders,
        user,
        emailForPayment,
      );

      for (const order of orders) {
        order.paymentReference = paystackData.reference;
        await order.save();
      }

      return res.status(201).json({
        success: true,
        message: "Order created. Complete payment to confirm.",
        orders: orders,
        orderIds: orders.map((o) => o._id),
        paymentUrl: paystackData.authorization_url,
        paymentReference: paystackData.reference,
      });
    } catch (error) {
      console.error(
        "Paystack initialization error:",
        error.response?.data || error.message,
      );
      res.status(500);
      throw new Error(
        error.response?.data?.message ||
          "Failed to initialize payment. Please try again.",
      );
    }
  }

  res.status(201).json({
    success: true,
    message: `Order${orders.length > 1 ? "s" : ""} created successfully`,
    orders: orders,
    orderIds: orders.map((o) => o._id),
  });
});

const createOrder = asyncHandler(async (req, res) => {
  let orderItems = req.body.orderItems;
  let shippingAddress = req.body.shippingAddress;
  let paymentMethod = req.body.paymentMethod;
  let phone = req.body.phone;
  let notes = req.body.notes || "";
  let customerEmail = req.body.email;

  if (typeof orderItems === "string") {
    try {
      orderItems = JSON.parse(orderItems);
    } catch (error) {
      res.status(400);
      throw new Error("Invalid order items format");
    }
  }

  if (typeof shippingAddress === "string") {
    try {
      shippingAddress = JSON.parse(shippingAddress);
    } catch (error) {
      res.status(400);
      throw new Error("Invalid shipping address format");
    }
  }

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error("No order items");
  }

  if (!shippingAddress) {
    res.status(400);
    throw new Error("Shipping address is required");
  }

  if (
    !paymentMethod ||
    !["paystack", "ondelivery", "onsite"].includes(paymentMethod)
  ) {
    res.status(400);
    throw new Error("Valid payment method is required");
  }

  if (paymentMethod === "onsite" && !req.file) {
    res.status(400);
    throw new Error("Payment receipt is required for on-site payment");
  }

  const itemsBySeller = {};
  let itemsPrice = 0;

  for (const item of orderItems) {
    const product = await Product.findById(item.productId).populate(
      "seller",
      "name businessName email phone paystackSubaccountCode",
    );

    if (!product) {
      res.status(404);
      throw new Error(`Product not found: ${item.productId}`);
    }

    if (!product.isAvailable || product.isSoldOut) {
      res.status(400);
      throw new Error(`${product.name} is sold out or unavailable`);
    }

    if (!product.isApproved) {
      res.status(400);
      throw new Error(`${product.name} is pending approval`);
    }

    if (item.quantity > product.quantityAvailable) {
      res.status(400);
      throw new Error(
        `Only ${product.quantityAvailable} units available for ${product.name}`,
      );
    }

    let itemPrice = product.retailPrice;
    if (product.discount && product.discount > 0) {
      const now = new Date();
      const isDiscountValid =
        (!product.discountStartDate || now >= product.discountStartDate) &&
        (!product.discountEndDate || now <= product.discountEndDate);
      if (isDiscountValid) {
        itemPrice = product.retailPrice * (1 - product.discount / 100);
      }
    }

    const sellerId =
      product.seller?._id?.toString() || product.seller?.toString();
    if (!itemsBySeller[sellerId]) {
      itemsBySeller[sellerId] = {
        seller: sellerId,
        items: [],
        subtotal: 0,
      };
    }

    const itemTotal = itemPrice * item.quantity;
    itemsBySeller[sellerId].items.push({
      product: product._id,
      name: product.name,
      image: product.images[0] || "",
      price: itemPrice,
      quantity: item.quantity,
    });
    itemsBySeller[sellerId].subtotal += itemTotal;
    itemsPrice += itemTotal;
  }

  const shippingPrice = 0;
  const taxPrice = 0;
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  let paymentReceipt = "";
  if (paymentMethod === "onsite" && req.file) {
    paymentReceipt = req.file.path;
  }

  const shippingAddressData = {
    fullName: shippingAddress.fullName || "",
    address: shippingAddress.address || "",
    city: shippingAddress.city || "",
    state: shippingAddress.state || "",
    postalCode: shippingAddress.postalCode || "",
    country: shippingAddress.country || "Nigeria",
    phone: shippingAddress.phone || phone || req.user.phone,
    deliveryNotes: shippingAddress.deliveryNotes || "",
  };

  const orders = [];
  for (const sellerData of Object.values(itemsBySeller)) {
    const sellerPayoutAmount = sellerData.subtotal * (SELLER_PERCENTAGE / 100);
    const platformAmount = sellerData.subtotal * (PLATFORM_PERCENTAGE / 100);

    const order = await Order.create({
      user: req.user._id,
      seller: sellerData.seller,
      orderItems: sellerData.items,
      shippingAddress: shippingAddressData,
      paymentMethod,
      paymentReceipt,
      phone: phone || req.user.phone,
      notes: notes || "",
      itemsPrice: sellerData.subtotal,
      shippingPrice,
      taxPrice,
      totalPrice: sellerData.subtotal + shippingPrice + taxPrice,
      sellerPayoutAmount: sellerPayoutAmount,
      platformAmount: platformAmount,
      status: "order_placed",
      paymentStatus:
        paymentMethod === "ondelivery" ? "pending" : "pending_payment",
      deliveryStatus: "pending",
      isDelivered: false,
      isPaid: false,
    });
    orders.push(order);
  }

  if (paymentMethod === "paystack") {
    const emailForPayment = customerEmail || req.user.email;
    const paystackData = await initializePaystackTransaction(
      orders,
      req.user,
      emailForPayment,
    );

    for (const order of orders) {
      order.paymentReference = paystackData.reference;
      await order.save();
    }

    return res.status(201).json({
      success: true,
      message: "Order created. Complete payment to confirm.",
      orders,
      paymentUrl: paystackData.authorization_url,
      paymentReference: paystackData.reference,
    });
  }

  res.status(201).json({
    success: true,
    message: `Order${orders.length > 1 ? "s" : ""} created successfully`,
    orders,
    orderIds: orders.map((o) => o._id),
  });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate("orderItems.product", "name images")
    .populate("seller", "name businessName brandLogo");

  res.json(orders);
});

// @desc    Get seller's own orders (for seller dashboard)
// @route   GET /api/orders/seller/orders
// @access  Private (Seller only)
const getSellerOwnOrders = asyncHandler(async (req, res) => {
  const sellerId = req.user._id;
  const { page = 1, limit = 20, status } = req.query;

  let query = { seller: sellerId };
  if (status && status !== "all") {
    query.deliveryStatus = status;
  }

  const orders = await Order.find(query)
    .populate("user", "name email phone")
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Order.countDocuments(query);

  res.json({
    orders,
    page: Number(page),
    pages: Math.ceil(total / limit),
    total,
  });
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('orderItems.product', 'name images price')
    .populate('user', 'name email phone')
    .populate('seller', 'name businessName brandLogo phone email');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const userId = req.user._id.toString();
  const orderUserId = order.user?._id?.toString() || order.user?.toString();
  const orderSellerId = order.seller?._id?.toString() || order.seller?.toString();

  const isAuthorized = 
    userId === orderUserId || 
    userId === orderSellerId || 
    req.user.isAdmin === true;

  if (!isAuthorized) {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.json(order);
});

// @desc    Verify Paystack payment and update order
// @route   GET /api/orders/verify-payment/:reference
// @access  Public (Paystack callback + frontend)
const verifyPayment = asyncHandler(async (req, res) => {
  const { reference } = req.params;

  if (!reference) {
    res.status(400);
    throw new Error("Payment reference is required");
  }

  try {
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      },
    );

    const paystackData = response.data.data;

    if (paystackData.status !== "success") {
      res.status(400);
      throw new Error(`Payment verification failed: ${paystackData.gateway_response || paystackData.status}`);
    }

    const orders = await Order.find({ paymentReference: reference });

    if (orders.length === 0) {
      res.status(404);
      throw new Error("Order not found for this payment reference");
    }

    for (const order of orders) {
      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentStatus = "paid";
      order.paymentResult = {
        id: paystackData.id,
        status: paystackData.status,
        update_time: paystackData.paid_at,
        email_address: paystackData.customer.email,
      };

      await order.save();
    }

    res.json({
      success: true,
      status: "success",
      message: "Payment verified successfully",
      orders: orders.map((o) => o._id),
    });
  } catch (error) {
    console.error("Payment verification error:", error.response?.data || error.message);
    
    if (error.response?.data) {
      res.status(error.response.status || 500);
      throw new Error(error.response.data.message || "Payment verification failed");
    }
    
    throw error;
  }
});

// @desc    Paystack webhook handler
// @route   POST /api/orders/paystack-webhook
// @access  Public
const paystackWebhook = asyncHandler(async (req, res) => {
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (hash !== req.headers["x-paystack-signature"]) {
    res.status(401);
    throw new Error("Invalid webhook signature");
  }

  const event = req.body;

  if (event.event === "charge.success") {
    const reference = event.data.reference;
    const orders = await Order.find({ paymentReference: reference });

    for (const order of orders) {
      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentStatus = "paid";
      order.paymentResult = {
        id: event.data.id,
        status: event.data.status,
        update_time: event.data.paid_at,
        email_address: event.data.customer.email,
      };
      await order.save();
    }
  }

  res.sendStatus(200);
});

// @desc    Update delivery status (Seller only)
// @route   PUT /api/orders/:id/delivery-status
// @access  Private (Seller)
const updateDeliveryStatus = asyncHandler(async (req, res) => {
  const { status, riderName, riderPhone, trackingNumber, message } = req.body;

  if (!["processing", "dispatched", "in_transit", "delivered"].includes(status)) {
    res.status(400);
    throw new Error("Invalid delivery status");
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.seller.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  order.deliveryStatus = status;

  // Initialize deliveryTracking if it doesn't exist
  if (!order.deliveryTracking) {
    order.deliveryTracking = {
      riderName: '',
      riderPhone: '',
      trackingNumber: '',
      lastUpdate: null,
      updates: []
    };
  }

  if (riderName) order.deliveryTracking.riderName = riderName;
  if (riderPhone) order.deliveryTracking.riderPhone = riderPhone;
  if (trackingNumber) order.deliveryTracking.trackingNumber = trackingNumber;
  order.deliveryTracking.lastUpdate = new Date();

  // Initialize updates array if it doesn't exist
  if (!order.deliveryTracking.updates) {
    order.deliveryTracking.updates = [];
  }

  order.deliveryTracking.updates.push({
    status,
    message: message || `Order ${status.replace("_", " ")}`,
    date: new Date(),
  });

  if (status === "delivered") {
    order.sellerPayoutStatus = "pending";
    order.sellerPayoutEligible = true;
  }

  await order.save();

  res.json({
    success: true,
    message: `Delivery status updated to ${status}`,
    order,
  });
});

// @desc    Confirm delivery (Buyer only)
// @route   PUT /api/orders/:id/confirm-delivery
// @access  Private
const confirmDelivery = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  if (order.deliveryStatus !== 'delivered') {
    res.status(400);
    throw new Error('Order is not marked as delivered yet');
  }

  if (order.buyerConfirmedDelivery) {
    res.status(400);
    throw new Error('Delivery already confirmed');
  }

  order.buyerConfirmedDelivery = true;
  order.buyerConfirmedAt = new Date();

  // DON'T set status to 'completed' - use 'delivered' instead
  // REMOVE this line: order.status = 'completed';
  
  // If you want to mark as delivered, set the appropriate fields
  if (order.deliveryStatus === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = new Date();
  }

  if (order.paymentMethod === 'ondelivery') {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentStatus = 'paid_on_delivery';
    order.sellerPayoutStatus = 'pending';
    order.sellerPayoutEligible = true;

    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.quantityAvailable -= item.quantity;
        product.quantitySold += item.quantity;
        if (product.quantityAvailable <= 0) {
          product.isSoldOut = true;
          product.isAvailable = false;
        }
        await product.save();
      }
    }
  }

  await order.save();

  res.json({
    success: true,
    message: 'Delivery confirmed successfully',
    order,
  });
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(403);
    throw new Error("Not authorized");
  }

  if (order.deliveryStatus === "delivered") {
    res.status(400);
    throw new Error("Cannot cancel a delivered order");
  }

  if (order.isPaid) {
    order.paymentStatus = "refund_pending";
  }

  order.status = "cancelled";
  order.deliveryStatus = "cancelled";
  order.cancelledAt = new Date();
  order.cancellationReason = req.body.reason || "Cancelled by user";

  await order.save();

  res.json({
    success: true,
    message: "Order cancelled successfully",
    order,
  });
});

// ==================== ADMIN ORDER CONTROLLERS ====================

// @desc    Get all orders (admin)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, paymentStatus } = req.query;

  let query = {};
  if (status && status !== "all") query.deliveryStatus = status;
  if (paymentStatus && paymentStatus !== "all") query.paymentStatus = paymentStatus;

  const orders = await Order.find(query)
    .populate("user", "name email")
    .populate("seller", "name businessName")
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Order.countDocuments(query);

  res.json({
    orders,
    page: Number(page),
    pages: Math.ceil(total / limit),
    total,
  });
});

// @desc    Get seller orders (admin)
// @route   GET /api/orders/admin/seller/:sellerId
// @access  Private/Admin
const getSellerOrders = asyncHandler(async (req, res) => {
  const { sellerId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const orders = await Order.find({ seller: sellerId })
    .populate("user", "name email phone")
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Order.countDocuments({ seller: sellerId });

  res.json({
    orders,
    page: Number(page),
    pages: Math.ceil(total / limit),
    total,
  });
});

// @desc    Confirm on-site payment (admin)
// @route   PUT /api/orders/:id/confirm-payment
// @access  Private/Admin
const confirmPayment = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.paymentMethod !== "onsite") {
    res.status(400);
    throw new Error("Can only confirm on-site payments");
  }

  order.isPaid = true;
  order.paidAt = new Date();
  order.paymentStatus = "paid";
  order.paymentResult = {
    id: req.body.id || "admin-confirmed",
    status: "success",
    update_time: new Date().toISOString(),
    email_address: req.body.email || order.user?.email,
  };

  await order.save();

  res.json({
    success: true,
    message: "Payment confirmed by admin",
    order,
  });
});

// @desc    Reject on-site payment (admin)
// @route   PUT /api/orders/:id/reject-payment
// @access  Private/Admin
const rejectPayment = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.paymentStatus = "rejected";
  order.rejectionReason = req.body.reason || "Payment rejected by admin";

  await order.save();

  res.json({
    success: true,
    message: "Payment rejected",
    order,
  });
});

// @desc    Process seller payout (admin)
// @route   POST /api/orders/:id/process-payout
// @access  Private/Admin
const processSellerPayout = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (!order.sellerPayoutEligible) {
    res.status(400);
    throw new Error("Order is not eligible for payout");
  }

  if (order.sellerPayoutStatus === "completed") {
    res.status(400);
    throw new Error("Payout already processed");
  }

  order.sellerPayoutStatus = "completed";
  order.sellerPayoutDate = new Date();

  await order.save();

  res.json({
    success: true,
    message: "Seller payout processed successfully",
    order,
  });
});

// ==================== SELLER WITHDRAWAL CONTROLLERS ====================

// @desc    Get seller balance
// @route   GET /api/orders/seller-balance
// @access  Private (Seller)
const getSellerBalance = asyncHandler(async (req, res) => {
  const sellerId = req.user._id;

  const totalEarnings = await Order.aggregate([
    { $match: { seller: sellerId, isPaid: true, buyerConfirmedDelivery: true } },
    { $group: { _id: null, total: { $sum: "$sellerPayoutAmount" } } },
  ]);

  const pendingPayouts = await Order.aggregate([
    { $match: { seller: sellerId, sellerPayoutStatus: "pending", sellerPayoutEligible: true } },
    { $group: { _id: null, total: { $sum: "$sellerPayoutAmount" } } },
  ]);

  const completedPayouts = await Order.aggregate([
    { $match: { seller: sellerId, sellerPayoutStatus: "completed" } },
    { $group: { _id: null, total: { $sum: "$sellerPayoutAmount" } } },
  ]);

  const availableBalance = (totalEarnings[0]?.total || 0) - (completedPayouts[0]?.total || 0);

  res.json({
    totalEarnings: totalEarnings[0]?.total || 0,
    pendingPayouts: pendingPayouts[0]?.total || 0,
    completedPayouts: completedPayouts[0]?.total || 0,
    availableBalance,
  });
});

// @desc    Initiate seller withdrawal
// @route   POST /api/orders/withdraw
// @access  Private (Seller)
const initiateWithdrawal = asyncHandler(async (req, res) => {
  const { amount, bankCode, accountNumber, accountName } = req.body;
  const sellerId = req.user._id;

  if (!amount || amount < 1000) {
    res.status(400);
    throw new Error("Minimum withdrawal amount is ₦1,000");
  }

  if (!bankCode || !accountNumber || !accountName) {
    res.status(400);
    throw new Error("Bank details are required");
  }

  // Check available balance
  const totalEarnings = await Order.aggregate([
    { $match: { seller: sellerId, isPaid: true, buyerConfirmedDelivery: true } },
    { $group: { _id: null, total: { $sum: "$sellerPayoutAmount" } } },
  ]);

  const completedPayouts = await Order.aggregate([
    { $match: { seller: sellerId, sellerPayoutStatus: "completed" } },
    { $group: { _id: null, total: { $sum: "$sellerPayoutAmount" } } },
  ]);

  const availableBalance = (totalEarnings[0]?.total || 0) - (completedPayouts[0]?.total || 0);

  if (amount > availableBalance) {
    res.status(400);
    throw new Error(`Insufficient balance. Available: ₦${availableBalance}`);
  }

  // Create transfer recipient
  try {
    const recipientResponse = await axios.post(
      `${PAYSTACK_BASE_URL}/transferrecipient`,
      {
        type: "nuban",
        name: accountName,
        account_number: accountNumber,
        bank_code: bankCode,
        currency: "NGN",
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    const recipientCode = recipientResponse.data.data.recipient_code;

    // Initiate transfer
    const transferResponse = await axios.post(
      `${PAYSTACK_BASE_URL}/transfer`,
      {
        source: "balance",
        amount: Math.round(amount * 100),
        recipient: recipientCode,
        reason: "Seller withdrawal",
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    res.json({
      success: true,
      message: "Withdrawal initiated successfully",
      transferCode: transferResponse.data.data.transfer_code,
      status: transferResponse.data.data.status,
    });
  } catch (error) {
    console.error("Withdrawal error:", error.response?.data || error.message);
    res.status(500);
    throw new Error(
      error.response?.data?.message || "Failed to process withdrawal",
    );
  }
});

export {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartSummary,
  checkoutCart,
  createOrder,
  getMyOrders,
  getSellerOwnOrders,
  getOrderById,
  verifyPayment,
  paystackWebhook,
  updateDeliveryStatus,
  confirmDelivery,
  cancelOrder,
  getAllOrders,
  getSellerOrders,
  confirmPayment,
  rejectPayment,
  processSellerPayout,
  getSellerBalance,
  initiateWithdrawal,
  getBankList,
  resolveBankAccount,
  reinitializePayment,
};