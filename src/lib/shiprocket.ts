import { prisma } from '@/lib/prisma';
import { getSystemSettings, invalidateSettingsCache } from '@/lib/settings';

const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

export interface ShiprocketConfig {
  enabled: boolean;
  email?: string;
  password?: string;
  token?: string;
  tokenExpiry?: Date | null;
  pickupLocation?: string;
  defaultWeightKg?: number;
  lengthCm?: number;
  breadthCm?: number;
  heightCm?: number;
  autoCreate?: boolean;
}

export interface ServiceabilityQuery {
  pickupPincode?: string;
  deliveryPincode: string;
  weightKg?: number;
  cod?: boolean;
  orderAmount?: number;
}

export interface CourierOption {
  courierCompanyId: number;
  courierName: string;
  rate: number;
  estimatedDeliveryDays: number;
  etdDate?: string;
  codCharges?: number;
  isRecommended?: boolean;
  rating?: number;
}

// In-memory token cache fallback
let memoryToken: string | null = null;
let memoryTokenExpiry: number = 0;

/**
 * Fetch current Shiprocket credentials from Database (SystemSetting) or Environment Variables
 */
export async function getShiprocketConfig(): Promise<ShiprocketConfig> {
  const settings = await getSystemSettings();
  
  const email = (settings.shiprocketEmail || process.env.SHIPROCKET_EMAIL || '').trim();
  const password = (settings.shiprocketPassword || process.env.SHIPROCKET_PASSWORD || '').trim();
  const pickupLocation = (settings.shiprocketPickupLocation || process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary').trim();
  const enabled = Boolean(settings.shiprocketEnabled || process.env.SHIPROCKET_ENABLED === 'true' || (email && password));

  return {
    enabled,
    email,
    password,
    token: settings.shiprocketToken || undefined,
    tokenExpiry: settings.shiprocketTokenExpiry ? new Date(settings.shiprocketTokenExpiry) : null,
    pickupLocation,
    defaultWeightKg: Number(settings.shiprocketDefaultWeightKg) || 0.5,
    lengthCm: Number(settings.shiprocketLengthCm) || 10,
    breadthCm: Number(settings.shiprocketBreadthCm) || 10,
    heightCm: Number(settings.shiprocketHeightCm) || 10,
    autoCreate: settings.shiprocketAutoCreate !== undefined ? Boolean(settings.shiprocketAutoCreate) : true,
  };
}

/**
 * Authenticate with Shiprocket API v2 and obtain or refresh Bearer JWT Token
 */
export async function getShiprocketToken(forceRefresh = false): Promise<string> {
  const config = await getShiprocketConfig();

  if (!config.email || !config.password) {
    throw new Error(
      'Shiprocket API credentials missing. कृपया Admin Settings में Shiprocket ईमेल व पासवर्ड दर्ज करें।'
    );
  }

  const now = Date.now();

  // 1. Check in-memory cache first
  if (!forceRefresh && memoryToken && now < memoryTokenExpiry) {
    return memoryToken;
  }

  // 2. Check DB cached token
  if (!forceRefresh && config.token && config.tokenExpiry) {
    const expiryTime = new Date(config.tokenExpiry).getTime();
    if (now < expiryTime - 60000) { // 1 min buffer
      memoryToken = config.token;
      memoryTokenExpiry = expiryTime;
      return config.token;
    }
  }

  // 3. Request fresh token from Shiprocket /auth/login
  try {
    const res = await fetch(`${SHIPROCKET_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: config.email,
        password: config.password,
      }),
      // Don't cache auth requests
      cache: 'no-store',
    });

    const data = await res.json();

    if (!res.ok || !data.token) {
      const errMsg = data.message || data.errors?.[0] || 'Shiprocket authentication failed';
      throw new Error(`Shiprocket Login Error: ${errMsg}`);
    }

    const token = data.token as string;
    // Shiprocket tokens last ~10 days (864,000s). We set safe expiry to 7 days
    const expiryDate = new Date(now + 7 * 24 * 60 * 60 * 1000);

    memoryToken = token;
    memoryTokenExpiry = expiryDate.getTime();

    // Persist token in DB for multi-instance Next.js
    try {
      const current = await getSystemSettings();
      await prisma.systemSetting.update({
        where: { id: current.id },
        data: {
          shiprocketToken: token,
          shiprocketTokenExpiry: expiryDate,
        },
      });
      invalidateSettingsCache();
    } catch (dbErr) {
      console.warn('Could not persist Shiprocket token to DB:', dbErr);
    }

    return token;
  } catch (err: any) {
    console.error('Shiprocket login failed:', err);
    throw err;
  }
}

/**
 * Authenticated fetch helper for Shiprocket API
 */
async function shiprocketFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  let token = await getShiprocketToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...(options.headers as Record<string, string> || {}),
  };

  let response = await fetch(`${SHIPROCKET_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // If unauthorized (401), try refreshing token once
  if (response.status === 401) {
    token = await getShiprocketToken(true);
    headers.Authorization = `Bearer ${token}`;
    response = await fetch(`${SHIPROCKET_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  }

  const result = await response.json();
  return { ok: response.ok, status: response.status, data: result };
}

/**
 * Get configured pickup locations from Shiprocket account
 */
export async function getShiprocketPickupLocations(): Promise<any[]> {
  const { ok, status, data } = await shiprocketFetch('/settings/company/pickup', {
    method: 'GET',
    cache: 'no-store',
  });

  if (!ok) {
    throw new Error(data?.message || `Failed to fetch pickup locations (HTTP ${status})`);
  }

  const list = data?.data?.shipping_address || [];
  return list;
}

/**
 * Check Courier Serviceability for a delivery pincode
 */
export async function checkCourierServiceability(params: ServiceabilityQuery): Promise<{
  serviceable: boolean;
  couriers: CourierOption[];
  recommended?: CourierOption;
  message?: string;
}> {
  const config = await getShiprocketConfig();
  
  // If pickup pincode is not provided, fetch primary pickup location pincode
  let pickupPincode = params.pickupPincode;
  if (!pickupPincode) {
    try {
      const locations = await getShiprocketPickupLocations();
      const primaryLoc = locations.find(
        (loc) => loc.pickup_location?.toLowerCase() === config.pickupLocation?.toLowerCase()
      ) || locations[0];
      if (primaryLoc?.pin_code) {
        pickupPincode = primaryLoc.pin_code;
      }
    } catch {
      // Fallback default pickup pincode (e.g., Indore / MP central hub if not detected)
      pickupPincode = '452001';
    }
  }

  const weight = params.weightKg || config.defaultWeightKg || 0.5;
  const isCod = params.cod ? 1 : 0;
  const deliveryPincode = params.deliveryPincode.trim();

  const queryUrl = `/courier/serviceability?pickup_postcode=${encodeURIComponent(
    pickupPincode || '452001'
  )}&delivery_postcode=${encodeURIComponent(deliveryPincode)}&weight=${weight}&cod=${isCod}`;

  const { ok, data } = await shiprocketFetch(queryUrl, {
    method: 'GET',
    cache: 'no-store',
  });

  if (!ok || !data) {
    return {
      serviceable: false,
      couriers: [],
      message: data?.message || 'Pincode serviceability check failed',
    };
  }

  const availableList: any[] = data?.data?.available_courier_companies || [];
  const recommendedId = data?.data?.recommended_courier_company_id;

  const couriers: CourierOption[] = availableList.map((c) => ({
    courierCompanyId: c.courier_company_id,
    courierName: c.courier_name,
    rate: Number(c.rate) || 0,
    estimatedDeliveryDays: Number(c.estimated_delivery_days) || 3,
    etdDate: c.etd,
    codCharges: Number(c.cod_charges) || 0,
    isRecommended: c.courier_company_id === recommendedId,
    rating: Number(c.rating) || 4.5,
  }));

  const recommended = couriers.find((c) => c.isRecommended) || couriers[0];

  return {
    serviceable: couriers.length > 0,
    couriers,
    recommended,
    message: couriers.length > 0 ? 'Serviceable' : 'Pincode not serviceable by Shiprocket',
  };
}

/**
 * Format and push an SGM Mart order to Shiprocket
 */
export async function createShiprocketOrder(orderId: string, customWeight?: number): Promise<{
  success: boolean;
  shiprocketOrderId?: number;
  shipmentId?: number;
  awbCode?: string;
  courierName?: string;
  status?: string;
  message?: string;
  raw?: any;
}> {
  const config = await getShiprocketConfig();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: { product: true },
      },
      user: true,
    },
  });

  if (!order) {
    throw new Error(`Order ${orderId} not found`);
  }

  const shipping = (order.shippingAddress || {}) as any;

  // Format customer names
  const rawFullName = (shipping.fullName || order.user.name || 'Customer').trim();
  const nameParts = rawFullName.split(' ');
  const firstName = nameParts[0] || 'Customer';
  const lastName = nameParts.slice(1).join(' ') || '.';

  const mobile = (shipping.mobile || order.user.mobile || '9999999999').replace(/[^0-9]/g, '').slice(-10);
  const email = (shipping.email || order.user.email || 'customer@sadgurumart.com').trim();
  const addressLine = (shipping.addressLine || 'Address').trim();
  const city = (shipping.city || 'City').trim();
  const state = (shipping.state || 'State').trim();
  const pinCode = (shipping.pinCode || shipping.pincode || '000000').toString().trim();

  // Format items
  const orderItems = order.items.map((it, idx) => ({
    name: it.product.title.slice(0, 100),
    sku: it.product.slug ? it.product.slug.slice(0, 50) : `SKU-${idx + 1}`,
    units: it.quantity,
    selling_price: it.unitDp,
    discount: 0,
    tax: 0,
    hsn: 0,
  }));

  const orderDate = new Date(order.createdAt).toISOString().slice(0, 16).replace('T', ' ');
  const isPrepaid = order.paymentMethod !== 'COD';

  const weight = customWeight || config.defaultWeightKg || 0.5;

  const payload = {
    order_id: order.orderNumber,
    order_date: orderDate,
    pickup_location: config.pickupLocation || 'Primary',
    channel_id: '',
    comment: `SGM Mart Order #${order.orderNumber}`,
    billing_customer_name: firstName,
    billing_last_name: lastName,
    billing_address: addressLine.slice(0, 150),
    billing_address_2: '',
    billing_city: city,
    billing_pincode: pinCode,
    billing_state: state,
    billing_country: 'India',
    billing_email: email,
    billing_phone: mobile,
    shipping_is_billing: true,
    order_items: orderItems,
    payment_method: isPrepaid ? 'Prepaid' : 'COD',
    shipping_charges: order.deliveryFee || 0,
    giftwrap_charges: 0,
    transaction_charges: 0,
    total_discount: order.totalDiscount || 0,
    sub_total: order.totalDp,
    length: config.lengthCm || 10,
    breadth: config.breadthCm || 10,
    height: config.heightCm || 10,
    weight,
  };

  const { ok, status, data } = await shiprocketFetch('/orders/create/adhoc', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!ok || !data) {
    const errorMsg = data?.message || JSON.stringify(data?.errors || 'Order creation failed on Shiprocket');
    return {
      success: false,
      message: errorMsg,
      raw: data,
    };
  }

  const shiprocketOrderId = data.order_id;
  const shipmentId = data.shipment_id;
  const awbCode = data.awb_code || null;
  const courierName = data.courier_name || null;
  const shipStatus = data.status || 'NEW';

  // Update order in database with Shiprocket identifiers
  await prisma.order.update({
    where: { id: order.id },
    data: {
      shiprocketOrderId: Number(shiprocketOrderId),
      shiprocketShipmentId: Number(shipmentId),
      shiprocketAwbCode: awbCode,
      shiprocketCourierName: courierName,
      shiprocketStatus: shipStatus,
      shiprocketEtc: data,
    },
  });

  return {
    success: true,
    shiprocketOrderId,
    shipmentId,
    awbCode,
    courierName,
    status: shipStatus,
    message: 'Shiprocket order successfully created',
    raw: data,
  };
}

/**
 * Assign courier and generate AWB for a shipment
 */
export async function assignCourierAWB(orderId: string, courierId?: number): Promise<{
  success: boolean;
  awbCode?: string;
  courierName?: string;
  courierId?: number;
  message?: string;
  raw?: any;
}> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || !order.shiprocketShipmentId) {
    throw new Error('Order does not have a valid Shiprocket Shipment ID. कृपया पहले शिपमेंट बनाएं।');
  }

  const payload: any = {
    shipment_id: order.shiprocketShipmentId,
  };
  if (courierId) {
    payload.courier_id = courierId;
  }

  const { ok, data } = await shiprocketFetch('/courier/assign/awb', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!ok || data?.awb_assign_status !== 1) {
    const errMsg = data?.message || data?.response?.data?.message || 'AWB Generation failed';
    return {
      success: false,
      message: errMsg,
      raw: data,
    };
  }

  const responseData = data?.response?.data || {};
  const awbCode = responseData.awb_code;
  const courierName = responseData.courier_name;
  const assignedCourierId = responseData.courier_company_id;

  // Update order record
  const currentAddress: any = order.shippingAddress || {};
  await prisma.order.update({
    where: { id: order.id },
    data: {
      shiprocketAwbCode: awbCode,
      shiprocketCourierName: courierName,
      shiprocketCourierId: assignedCourierId ? Number(assignedCourierId) : undefined,
      shiprocketStatus: 'AWB_ASSIGNED',
      orderStatus: 'SHIPPED',
      shippingAddress: {
        ...currentAddress,
        trackingNumber: awbCode,
        courierName: courierName,
        dispatchedAt: new Date().toISOString(),
      },
    },
  });

  return {
    success: true,
    awbCode,
    courierName,
    courierId: assignedCourierId,
    message: `AWB ${awbCode} generated via ${courierName}`,
    raw: data,
  };
}

/**
 * Generate Shipping Label PDF URL
 */
export async function generateShippingLabel(orderId: string): Promise<{
  success: boolean;
  labelUrl?: string;
  message?: string;
}> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || !order.shiprocketShipmentId) {
    throw new Error('Valid Shiprocket Shipment ID required');
  }

  const { ok, data } = await shiprocketFetch('/courier/generate/label', {
    method: 'POST',
    body: JSON.stringify({
      shipment_id: [order.shiprocketShipmentId],
    }),
  });

  if (!ok || !data?.label_url) {
    return {
      success: false,
      message: data?.message || 'Label generation failed',
    };
  }

  const labelUrl = data.label_url;
  await prisma.order.update({
    where: { id: order.id },
    data: { shiprocketLabelUrl: labelUrl },
  });

  return {
    success: true,
    labelUrl,
  };
}

/**
 * Generate Shiprocket Tax Invoice PDF URL
 */
export async function generateShiprocketInvoice(orderId: string): Promise<{
  success: boolean;
  invoiceUrl?: string;
  message?: string;
}> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || !order.shiprocketOrderId) {
    throw new Error('Valid Shiprocket Order ID required');
  }

  const { ok, data } = await shiprocketFetch('/orders/print/invoice', {
    method: 'POST',
    body: JSON.stringify({
      ids: [order.shiprocketOrderId],
    }),
  });

  if (!ok || !data?.invoice_url) {
    return {
      success: false,
      message: data?.message || 'Invoice generation failed',
    };
  }

  const invoiceUrl = data.invoice_url;
  await prisma.order.update({
    where: { id: order.id },
    data: { shiprocketInvoiceUrl: invoiceUrl },
  });

  return {
    success: true,
    invoiceUrl,
  };
}

/**
 * Request Courier Pickup for a shipment
 */
export async function requestCourierPickup(orderId: string): Promise<{
  success: boolean;
  pickupScheduledDate?: string;
  pickupTokenNumber?: string;
  message?: string;
}> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || !order.shiprocketShipmentId) {
    throw new Error('Valid Shiprocket Shipment ID required');
  }

  const { ok, data } = await shiprocketFetch('/courier/generate/pickup', {
    method: 'POST',
    body: JSON.stringify({
      shipment_id: [order.shiprocketShipmentId],
    }),
  });

  if (!ok || data?.pickup_status !== 1) {
    return {
      success: false,
      message: data?.message || 'Pickup request failed',
    };
  }

  const scheduled = data?.response?.pickup_scheduled_date;
  const token = data?.response?.pickup_token_number;

  await prisma.order.update({
    where: { id: order.id },
    data: { shiprocketStatus: 'PICKUP_SCHEDULED' },
  });

  return {
    success: true,
    pickupScheduledDate: scheduled,
    pickupTokenNumber: token,
    message: `Pickup scheduled for ${scheduled || 'soon'} (Token: ${token || 'N/A'})`,
  };
}

/**
 * Live Track Shipment using AWB Code or Shipment ID
 */
export async function trackShipment(identifier: { awbCode?: string; shipmentId?: number; orderNumber?: string }): Promise<{
  success: boolean;
  awbCode?: string;
  courierName?: string;
  currentStatus?: string;
  statusCode?: number;
  origin?: string;
  destination?: string;
  estimatedDeliveryDate?: string;
  activities: Array<{
    date: string;
    status: string;
    activity: string;
    location: string;
  }>;
  trackingUrl?: string;
  message?: string;
}> {
  let awb = identifier.awbCode;

  // If orderNumber is given, look up the order in DB
  if (!awb && identifier.orderNumber) {
    const ord = await prisma.order.findUnique({
      where: { orderNumber: identifier.orderNumber },
    });
    if (ord?.shiprocketAwbCode) {
      awb = ord.shiprocketAwbCode;
    } else if (ord?.shippingAddress && (ord.shippingAddress as any).trackingNumber) {
      awb = (ord.shippingAddress as any).trackingNumber;
    }
  }

  if (!awb && !identifier.shipmentId) {
    return {
      success: false,
      activities: [],
      message: 'No AWB Code or Shipment ID available for tracking',
    };
  }

  const endpoint = awb
    ? `/courier/track/awb/${encodeURIComponent(awb)}`
    : `/courier/track/shipment/${identifier.shipmentId}`;

  const { ok, data } = await shiprocketFetch(endpoint, {
    method: 'GET',
    cache: 'no-store',
  });

  if (!ok || !data?.tracking_data) {
    return {
      success: false,
      activities: [],
      message: data?.message || 'Tracking details not yet updated by courier partner',
    };
  }

  const tData = data.tracking_data;
  const trackInfo = tData.shipment_track?.[0] || {};
  const rawActivities: any[] = tData.shipment_track_activities || [];

  const activities = rawActivities.map((act) => ({
    date: act.date || '',
    status: act.status || act['sr-status-label'] || '',
    activity: act.activity || '',
    location: act.location || '',
  }));

  const trackingUrl = tData.track_url || (awb ? `https://shiprocket.co/tracking/${awb}` : undefined);

  return {
    success: true,
    awbCode: trackInfo.awb_code || awb,
    courierName: trackInfo.courier_name || '',
    currentStatus: trackInfo.current_status || 'IN_TRANSIT',
    statusCode: tData.shipment_status,
    origin: trackInfo.origin,
    destination: trackInfo.destination,
    estimatedDeliveryDate: trackInfo.edd,
    activities,
    trackingUrl,
  };
}

/**
 * Cancel order on Shiprocket
 */
export async function cancelShiprocketOrder(shiprocketOrderId: number): Promise<{
  success: boolean;
  message?: string;
}> {
  const { ok, data } = await shiprocketFetch('/orders/cancel', {
    method: 'POST',
    body: JSON.stringify({
      ids: [shiprocketOrderId],
    }),
  });

  if (!ok) {
    return {
      success: false,
      message: data?.message || 'Failed to cancel order on Shiprocket',
    };
  }

  return {
    success: true,
    message: 'Shiprocket order cancelled successfully',
  };
}
